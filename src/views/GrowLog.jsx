import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { GROW_STAGES } from '../store/defaults.js'
import { todayISO, growDay, fmtShort } from '../lib/date.js'
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

  const open = (entry) => {
    if (entry) { setForm({ ...entry }); setEditing(entry) }
    else { setForm(blank()); setEditing('new') }
  }
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

  const plantName = (id) => (id === 'all' ? 'All plants' : (plants.find((p) => p.id === id)?.name || 'Unknown'))

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Grow Log</h1>
          <div className="desc">{germ ? `Day count runs from germination on ${fmtShort(germ)}.` : 'Set a germination date in Settings to turn on day counting.'}</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)} disabled={plants.length === 0}><Icon.plus width={16} /> Log entry</button>
      </div>

      <div className="seg" style={{ marginBottom: 16 }}>
        <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
        {plants.map((p) => (
          <button key={p.id} className={filter === p.id ? 'on' : ''} onClick={() => setFilter(p.id)}>{p.name}</button>
        ))}
      </div>

      {plants.length === 0 ? (
        <div className="empty"><h4>Add a plant first</h4><p>Grow entries attach to a plant. Head to the Plants tab to add your roster.</p></div>
      ) : rows.length === 0 ? (
        <div className="empty"><h4>Nothing logged yet</h4><p>Start your first entry. Even "no growth, empty soil" is worth recording.</p></div>
      ) : (
        <div className="card table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Day</th><th>Date</th><th>Plant</th><th>Stage</th><th>Height</th><th>Care</th><th>Notes</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const d = growDay(germ, e.date)
                return (
                  <tr key={e.id}>
                    <td className="num"><strong>{d ? `D${d}` : '—'}</strong></td>
                    <td className="num">{fmtShort(e.date)}</td>
                    <td>
                      <span className="row" style={{ alignItems: 'center', gap: 7 }}>
                        <span className="dot" style={{ background: e.plantId === 'all' ? 'var(--muted)' : colorFor(plantName(e.plantId)) }} />
                        {plantName(e.plantId)}
                      </span>
                    </td>
                    <td><span className="chip">{e.stage}</span></td>
                    <td className="num">{e.height !== '' && e.height != null ? `${e.height} ${unit}` : '—'}</td>
                    <td>
                      <span className="row" style={{ gap: 5 }}>
                        {e.watered && <span title="Watered" style={{ color: 'var(--leaf)' }}><Icon.drop width={15} /></span>}
                        {e.fed && <span className="chip chip-clay" style={{ padding: '1px 6px' }}>fed</span>}
                      </span>
                    </td>
                    <td style={{ maxWidth: 280, color: 'var(--ink-soft)', fontSize: 13 }}>{e.notes}</td>
                    <td>
                      <span className="row" style={{ gap: 2 }}>
                        <button className="icon-btn" onClick={() => open(e)} aria-label="Edit"><Icon.edit width={15} /></button>
                        <button className="icon-btn" onClick={() => removeItem('growLog', e.id)} aria-label="Delete"><Icon.trash width={15} /></button>
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
                {plants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Stage">
              <select className="select" value={form.stage} onChange={(e) => set('stage', e.target.value)}>
                {GROW_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label={`Height (${unit})`}><input type="number" step="0.1" className="input" value={form.height} onChange={(e) => set('height', e.target.value)} placeholder="0" /></Field>
            <div className="full row" style={{ gap: 18 }}>
              <label className="row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span className={`check ${form.watered ? 'on' : ''}`} onClick={() => set('watered', !form.watered)}><Icon.check width={14} /></span> Watered
              </label>
              <label className="row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <span className={`check ${form.fed ? 'on' : ''}`} onClick={() => set('fed', !form.fed)}><Icon.check width={14} /></span> Fed nutrients
              </label>
            </div>
            <div className="full"><Field label="Notes"><textarea className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="New node, leaf color, anything off." /></Field></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
