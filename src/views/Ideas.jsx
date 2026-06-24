import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { IDEA_STATUS, PRIORITIES } from '../store/defaults.js'
import { uid } from '../lib/id.js'

const COLS = [
  { key: 'backlog', label: 'Backlog' },
  { key: 'planned', label: 'Planned' },
  { key: 'posted', label: 'Posted' },
]

export default function Ideas() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const ideas = project.ideas || []
  const [editing, setEditing] = useState(null)
  const blank = () => ({ hook: '', priority: 'medium', status: 'backlog', styleTags: [], notes: '' })
  const [form, setForm] = useState(blank())
  const [tagInput, setTagInput] = useState('')

  const open = (idea) => { if (idea) { setForm({ ...idea, styleTags: idea.styleTags || [] }); setEditing(idea) } else { setForm(blank()); setEditing('new') } }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const save = () => {
    if (!form.hook.trim()) return
    if (editing === 'new') addItem('ideas', { ...form, id: uid('i_') })
    else updateItem('ideas', editing.id, form)
    setEditing(null)
  }
  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !form.styleTags.includes(t)) set('styleTags', [...form.styleTags, t])
    setTagInput('')
  }
  const move = (idea, status) => updateItem('ideas', idea.id, { status })

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Ideas</h1>
          <div className="desc">The bank. Park every hook here, then pull from it when you plan the week.</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)}><Icon.plus width={16} /> Add idea</button>
      </div>

      {ideas.length === 0 ? (
        <div className="empty"><h4>Empty bank</h4><p>Drop in hooks as they come to you. Half the battle is never running out of them.</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, alignItems: 'start' }}>
          {COLS.map((col) => {
            const items = ideas.filter((i) => i.status === col.key)
            return (
              <div key={col.key}>
                <div className="section-head">
                  <h3>{col.label}</h3>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{items.length}</span>
                </div>
                <div className="col">
                  {items.length === 0 && <div className="empty" style={{ padding: 22, fontSize: 13 }}>Nothing here.</div>}
                  {items.map((i) => (
                    <div key={i.id} className="card" style={{ padding: 14 }}>
                      <div className="between" style={{ alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 500, lineHeight: 1.35 }}>{i.hook}</div>
                        <span className="row" style={{ gap: 0, flexShrink: 0 }}>
                          <button className="icon-btn" onClick={() => open(i)} aria-label="Edit"><Icon.edit width={14} /></button>
                          <button className="icon-btn" onClick={() => removeItem('ideas', i.id)} aria-label="Delete"><Icon.trash width={14} /></button>
                        </span>
                      </div>
                      {i.notes && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{i.notes}</div>}
                      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
                        <span className={`prio ${i.priority}`}>● {i.priority}</span>
                        {(i.styleTags || []).map((t) => <span key={t} className="chip" style={{ padding: '2px 7px' }}>{t}</span>)}
                      </div>
                      <div className="row" style={{ gap: 6, marginTop: 10 }}>
                        {COLS.filter((c) => c.key !== i.status).map((c) => (
                          <button key={c.key} className="btn btn-sm btn-ghost" onClick={() => move(i, c.key)}>→ {c.label}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add idea' : 'Edit idea'} onClose={() => setEditing(null)}
          footer={<>
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save idea</button>
          </>}>
          <Field label="Hook"><input className="input" autoFocus value={form.hook} onChange={(e) => set('hook', e.target.value)} placeholder="Serenading my weed plants" /></Field>
          <div className="form-grid">
            <Field label="Priority">
              <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {IDEA_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Style tags">
            <div className="row" style={{ gap: 8 }}>
              <input className="input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="timelapse, educational…" />
              <button className="btn" onClick={addTag}>Add</button>
            </div>
            {form.styleTags.length > 0 && (
              <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                {form.styleTags.map((t) => (
                  <span key={t} className="chip" style={{ cursor: 'pointer' }} onClick={() => set('styleTags', form.styleTags.filter((x) => x !== t))}>{t} ✕</span>
                ))}
              </div>
            )}
          </Field>
          <Field label="Notes"><textarea className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Style direction, who to film with, references." /></Field>
        </Modal>
      )}
    </div>
  )
}
