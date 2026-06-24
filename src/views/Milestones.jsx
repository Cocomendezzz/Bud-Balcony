import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { fmtShort, growDay } from '../lib/date.js'
import { uid } from '../lib/id.js'

export default function Milestones() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const germ = project.settings.germinationDate
  const milestones = project.milestones || []
  const [editing, setEditing] = useState(null)
  const blank = () => ({ name: '', targetDate: '', actualDate: '', done: false, notes: '' })
  const [form, setForm] = useState(blank())

  const open = (m) => { if (m) { setForm({ ...m }); setEditing(m) } else { setForm(blank()); setEditing('new') } }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = () => {
    if (!form.name.trim()) return
    if (editing === 'new') addItem('milestones', { ...form, id: uid('m_') })
    else updateItem('milestones', editing.id, form)
    setEditing(null)
  }
  const toggle = (m) => updateItem('milestones', m.id, { done: !m.done, actualDate: !m.done && !m.actualDate ? '' : m.actualDate })

  const doneCount = milestones.filter((m) => m.done).length

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Milestones</h1>
          <div className="desc">The beats worth extra editing effort. {doneCount} of {milestones.length} hit.</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)}><Icon.plus width={16} /> Add milestone</button>
      </div>

      {milestones.length === 0 ? (
        <div className="empty"><h4>No milestones</h4><p>These are your highest-leverage posts. Seed arrival, first leaves, flower, harvest, first smoke.</p></div>
      ) : (
        <div className="card">
          <div className="list" style={{ padding: '4px 16px' }}>
            {milestones.map((m) => {
              const d = m.actualDate ? growDay(germ, m.actualDate) : null
              return (
                <div key={m.id} className="list-row">
                  <button className={`check ${m.done ? 'on' : ''}`} onClick={() => toggle(m)} aria-label="Toggle done"><Icon.check width={14} /></button>
                  <div className="grow">
                    <div className="title" style={{ textDecoration: m.done ? 'line-through' : 'none', color: m.done ? 'var(--muted)' : 'var(--ink)' }}>{m.name}</div>
                    {m.notes && <div className="meta">{m.notes}</div>}
                  </div>
                  <div style={{ textAlign: 'right', minWidth: 130 }}>
                    {m.actualDate ? (
                      <div className="chip chip-leaf">Hit {fmtShort(m.actualDate)}{d ? ` · D${d}` : ''}</div>
                    ) : m.targetDate ? (
                      <div className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>Target {fmtShort(m.targetDate)}</div>
                    ) : (
                      <div className="mono" style={{ fontSize: 12, color: 'var(--line-strong)' }}>No date</div>
                    )}
                  </div>
                  <span className="row" style={{ gap: 2 }}>
                    <button className="icon-btn" onClick={() => open(m)} aria-label="Edit"><Icon.edit width={15} /></button>
                    <button className="icon-btn" onClick={() => removeItem('milestones', m.id)} aria-label="Delete"><Icon.trash width={15} /></button>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add milestone' : 'Edit milestone'} onClose={() => setEditing(null)}
          footer={<>
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save</button>
          </>}>
          <Field label="Milestone"><input className="input" autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="First signs of flower" /></Field>
          <div className="form-grid">
            <Field label="Target date"><input type="date" className="input" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)} /></Field>
            <Field label="Actual date"><input type="date" className="input" value={form.actualDate} onChange={(e) => set('actualDate', e.target.value)} /></Field>
          </div>
          <Field label="Notes"><textarea className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
          <label className="row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <span className={`check ${form.done ? 'on' : ''}`} onClick={() => set('done', !form.done)}><Icon.check width={14} /></span> Mark as hit
          </label>
        </Modal>
      )}
    </div>
  )
}
