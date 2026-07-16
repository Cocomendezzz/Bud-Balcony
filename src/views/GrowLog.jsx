import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { GROW_STAGES } from '../store/defaults.js'
import { todayISO, growDay, fmtShort, fmtLong } from '../lib/date.js'
import { convertedLabel } from '../lib/units.js'
import { colorFor } from '../lib/color.js'
import { uid } from '../lib/id.js'

export default function GrowLog() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const plants = project.plants || []
  const germ = project.settings.germinationDate
  const unit = project.settings.heightUnit || 'cm'

  const [filter, setFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const blank = () => ({ date: todayISO(), plantId: plants[0]?.id || 'all', stage: 'seedling', height: '', watered: false, fed: false, notes: '' })
  const [form, setForm] = useState(blank())

  const open = (entry) => { if (entry) { setForm({ ...entry }); setEditing(entry) } else { setForm(blank()); setEditing('new') } }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = () => {
    const payload = { ...form, height: form.height === '' ? '' : Number(form.height) }
    if (editing === 'new') addItem('growLog', { ...payload, id: uid('g_') })
    else updateItem('growLog', editing.id, payload)
    setEditing(null)
  }

  const rows = useMemo(() => {
    let list = [...(project.growLog || [])]
    if (filter !== 'all') list = list.filter((e) => e.plantId === filter)
    return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  }, [project.growLog, filter])

  const plantName = (id) => (id === 'all' ? 'All plants' : (plants.find((p) => p.strain && p.id === id)?.strain || 'Unknown'))
  const plantColor = (id) => (id === 'all' ? 'var(--muted)' : (plants.find((p) => p.id === id)?.color || colorFor(id)))

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Grow Log</h1>
          <div className="desc">{germ ? `Day count runs from germination on ${fmtShort(germ)}.` : 'Set a germination date in Settings to turn on day counting.'}</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)} disabled={plants.length === 0}><Icon.plus width={16} /> Log entry</button>
      </div>

      <div className="seg wrap" style={{ marginBottom: 16 }}>
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
        {plants.map((p) => <button key={p.id} className={filter === p.id ? 'on' : ''} onClick={() => setFilter(p.id)}>{p.strain}</button>)}
      </div>

      {plants.length === 0 ? (
        <div className="empty"><h4>Add a plant first</h4><p>Grow entries attach to a plant. Head to the Plants tab to add your roster.</p></div>
      ) : rows.length === 0 ? (
        <div className="empty"><h4>Nothing logged yet</h4><p>Start your first entry. Even "no growth, empty soil" is worth recording.</p></div>
      ) : (
        <div className="col" style={{ gap: 12 }}>
          {rows.map((e) => {
            const d = growDay(germ, e.date)
            const conv = convertedLabel(e.height, unit)
            return (
              <div key={e.id} className="card entry-card">
                <div className="entry-head">
                  <div className="row" style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span className="entry-day mono">{d ? `DAY ${d}` : 'DAY —'}</span>
                    <span className="entry-sep">·</span>
                    <span className="mono entry-date">{fmtShort(e.date).toUpperCase()}</span>
                    <span className="entry-sep">·</span>
                    <span className="row" style={{ alignItems: 'center', gap: 6 }}>
                      <span className="dot" style={{ background: plantColor(e.plantId) }} />
                      <strong style={{ letterSpacing: '0.01em' }}>{plantName(e.plantId).toUpperCase()}</strong>
                    </span>
                  </div>
                  <div className="row" style={{ gap: 2 }}>
                    <button className="icon-btn" onClick={() => open(e)} aria-label="Edit"><Icon.edit width={15} /></button>
                    <button className="icon-btn" onClick={() => removeItem('growLog', e.id)} aria-label="Delete"><Icon.trash width={15} /></button>
                  </div>
                </div>

                <div className="row wrap" style={{ gap: 8, margin: '10px 0' }}>
                  <span className="chip">{e.stage}</span>
                  {e.height !== '' && e.height != null && (
                    <span className="chip chip-leaf">{e.height} {unit}{conv ? ` · ${conv}` : ''}</span>
                  )}
                  {e.watered && <span className="chip"><Icon.drop width={12} style={{ verticalAlign: '-1px' }} /> watered</span>}
                  {e.fed && <span className="chip chip-clay">fed</span>}
                </div>

                {e.notes && <p className="entry-notes">{e.notes}</p>}
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Log a grow entry' : 'Edit entry'} onClose={() => setEditing(null)}
          footer={<>
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save entry</button>
          </>}>
          <div className="form-grid">
            <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
            <Field label="Plant">
              <select className="select" value={form.plantId} onChange={(e) => set('plantId', e.target.value)}>
                <option value="all">All plants</option>
                {plants.map((p) => <option key={p.id} value={p.id}>{p.strain}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select className="select" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                {GROW_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={`Height (${unit})`}>
              <input type="number" step="0.1" className="input" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="0" />
              {form.height !== '' && <div style={{ fontSize: 12, color: 'var(--leaf)', marginTop: 6 }}>= {convertedLabel(form.height, unit)}</div>}
            </Field>
            <div className="full row" style={{ gap: 18 }}>
              <label className="row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span className={`check ${form.watered ? 'on' : ''}`} onClick={() => set('watered', !form.watered)}><Icon.check width={14} /></span> Watered
              </label>
              <label className="row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span className={`check ${form.fed ? 'on' : ''}`} onClick={() => set('fed', !form.fed)}><Icon.check width={14} /></span> Fed nutrients
              </label>
            </div>
            <div className="full"><Field label="Notes"><textarea className="textarea" style={{ minHeight: 90 }} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="New node, leaf color, anything off. Write as much as you want." /></Field></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
