import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { PLATFORM_LABEL } from '../store/defaults.js'
import { CategorySelect, categoryById } from '../components/Category.jsx'
import { monthGrid, monthLabel, growDay, fmtLong, todayISO, DOW } from '../lib/date.js'
import { tint } from '../lib/color.js'
import { uid } from '../lib/id.js'

export default function Calendar() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const germ = project.settings.germinationDate
  const platforms = project.settings.platforms || []
  const categories = project.settings.categories || []
  const today = todayISO()

  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [dayOpen, setDayOpen] = useState(null)
  const [editing, setEditing] = useState(null)
  const [dragId, setDragId] = useState(null)

  const blank = (date) => ({ date, title: '', categoryId: categories[0]?.id || null, platform: platforms[0] || 'instagram', notes: '', done: false })
  const [form, setForm] = useState(blank(today))

  const cells = monthGrid(year, month)
  const events = project.calendar || []
  const eventsOn = (iso) => events.filter((e) => e.date === iso)
  const catColor = (id) => categoryById(categories, id)?.color || 'var(--muted)'

  const prev = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1) } else setMonth((m) => m - 1) }
  const next = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1) } else setMonth((m) => m + 1) }
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  const openNew = (date) => { setForm(blank(date)); setEditing('new') }
  const openEdit = (ev) => { setForm({ ...ev }); setEditing(ev) }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = () => {
    if (!form.title.trim()) return
    if (editing === 'new') addItem('calendar', { ...form, id: uid('c_') })
    else updateItem('calendar', editing.id, form)
    setEditing(null)
  }

  const onDropDay = (iso) => { if (dragId) { updateItem('calendar', dragId, { date: iso }); setDragId(null) } }

  return (
    <div>
      <div className="page-head">
        <h1>Calendar</h1>
        <div className="desc">Plan the whole run. Click a day to add, drag an entry to move it. Colors are your content categories.</div>
      </div>

      <div className="cal-head">
        <div className="row" style={{ alignItems: 'center', gap: 12 }}>
          <button className="icon-btn" onClick={prev} aria-label="Previous month"><Icon.left /></button>
          <div className="cal-title">{monthLabel(year, month)}</div>
          <button className="icon-btn" onClick={next} aria-label="Next month"><Icon.right /></button>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm" onClick={goToday}>Today</button>
          <button className="btn btn-sm btn-leaf" onClick={() => openNew(today)}><Icon.plus width={15} /> Add</button>
        </div>
      </div>

      <div className="cal-grid">
        {DOW.map((d) => <div key={d} className="cal-dow">{d}</div>)}
        {cells.map((c) => {
          const evs = eventsOn(c.iso)
          const gd = growDay(germ, c.iso)
          return (
            <div key={c.iso} className={`cal-cell ${c.inMonth ? '' : 'out'} ${c.iso === today ? 'today' : ''}`}
              onClick={() => setDayOpen(c.iso)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onDropDay(c.iso) }}>
              <div className="between">
                <span className="cell-day">{c.day}</span>
                {gd && gd > 0 && c.inMonth && <span className="cell-grow">D{gd}</span>}
              </div>
              {evs.slice(0, 4).map((e) => (
                <span key={e.id} className={`cal-event ${e.done ? 'done' : ''}`}
                  draggable
                  onDragStart={(ev) => { ev.stopPropagation(); setDragId(e.id) }}
                  onDragEnd={() => setDragId(null)}
                  onClick={(ev) => { ev.stopPropagation(); setDayOpen(e.date) }}
                  style={{ borderLeftColor: catColor(e.categoryId), background: tint(catColor(e.categoryId), 0.8) }}>
                  {e.title}
                </span>
              ))}
              {evs.length > 4 && <span className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>+{evs.length - 4} more</span>}
            </div>
          )
        })}
      </div>

      <div className="row wrap" style={{ gap: 14, marginTop: 14 }}>
        {categories.map((c) => (
          <span key={c.id} className="row" style={{ alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
            <span className="dot" style={{ background: c.color }} /> {c.label}
          </span>
        ))}
      </div>

      {dayOpen && (
        <Modal title={fmtLong(dayOpen)} onClose={() => setDayOpen(null)}
          footer={<button className="btn btn-leaf" onClick={() => { setDayOpen(null); openNew(dayOpen) }}><Icon.plus width={15} /> Add to this day</button>}>
          {growDay(germ, dayOpen) && <div className="eyebrow" style={{ marginBottom: 10 }}>Grow day {growDay(germ, dayOpen)}</div>}
          {eventsOn(dayOpen).length === 0 ? (
            <div className="empty" style={{ padding: 24 }}>Nothing planned. Add a reel, story, or reminder.</div>
          ) : (
            <div className="col" style={{ gap: 8 }}>
              {eventsOn(dayOpen).map((e) => {
                const cat = categoryById(categories, e.categoryId)
                return (
                  <div key={e.id} className="row" style={{ alignItems: 'center', gap: 10, padding: 10, border: '1px solid var(--line)', borderRadius: 8, borderLeft: `3px solid ${catColor(e.categoryId)}` }}>
                    <button className={`check ${e.done ? 'on' : ''}`} onClick={() => updateItem('calendar', e.id, { done: !e.done })}><Icon.check width={13} /></button>
                    <span className="grow">
                      <div style={{ fontWeight: 500, textDecoration: e.done ? 'line-through' : 'none' }}>{e.title}</div>
                      <div className="row wrap" style={{ gap: 6, marginTop: 3 }}>
                        {cat && <span className="chip" style={{ padding: '1px 7px', color: cat.color, borderColor: tint(cat.color, 0.5) }}>{cat.label}</span>}
                        {e.platform && <span className="chip" style={{ padding: '1px 7px' }}>{PLATFORM_LABEL[e.platform] || e.platform}</span>}
                      </div>
                      {e.notes && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>{e.notes}</div>}
                    </span>
                    <span className="row" style={{ gap: 2 }}>
                      <button className="icon-btn" onClick={() => { setDayOpen(null); openEdit(e) }} aria-label="Edit"><Icon.edit width={15} /></button>
                      <button className="icon-btn" onClick={() => removeItem('calendar', e.id)} aria-label="Delete"><Icon.trash width={15} /></button>
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </Modal>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add to calendar' : 'Edit event'} onClose={() => setEditing(null)}
          footer={<>
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save</button>
          </>}>
          <Field label="Title"><input className="input" autoFocus value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Week 3 recap reel" /></Field>
          <div className="form-grid">
            <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
            <Field label="Category"><CategorySelect categories={categories} value={form.categoryId} onChange={(v) => set('categoryId', v)} allowNone={false} /></Field>
            <Field label="Platform">
              <select className="select" value={form.platform} onChange={(e) => set('platform', e.target.value)}>
                <option value="">None</option>
                {platforms.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes"><textarea className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Structure, hook, what changed." /></Field>
        </Modal>
      )}
    </div>
  )
}
