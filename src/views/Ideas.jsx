import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { PRIORITIES } from '../store/defaults.js'
import { CategorySelect, categoryById } from '../components/Category.jsx'
import { tint } from '../lib/color.js'
import { uid } from '../lib/id.js'

export default function Ideas() {
  const { project, addItem, updateItem, removeItem, reorderCollection, addIdeaColumn, updateIdeaColumn, removeIdeaColumn } = useStore()
  const ideas = project.ideas || []
  const columns = project.settings.ideaColumns || []
  const categories = project.settings.categories || []

  const [editing, setEditing] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [manageCols, setManageCols] = useState(false)

  const blank = (columnId) => ({ hook: '', columnId: columnId || columns[0]?.id, categoryId: null, priority: 'medium', styleTags: [], gear: '', script: '', notes: '' })
  const [form, setForm] = useState(blank())
  const [tagInput, setTagInput] = useState('')

  const open = (idea, columnId) => { if (idea) { setForm({ ...idea, styleTags: idea.styleTags || [] }); setEditing(idea) } else { setForm(blank(columnId)); setEditing('new') } }
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

  const onDropCard = (targetId, columnId) => {
    if (!dragId) return
    if (dragId === targetId) { setDragId(null); return }
    reorderCollection('ideas', dragId, targetId, { columnId })
    setDragId(null)
  }
  const onDropColumn = (columnId) => {
    if (!dragId) return
    reorderCollection('ideas', dragId, null, { columnId })
    setDragId(null)
  }

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Ideas</h1>
          <div className="desc">The vault. Drag cards between columns, color-code by type, open one to write the script.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={() => setManageCols(true)}><Icon.settings width={15} /> Columns</button>
          <button className="btn btn-leaf" onClick={() => open(null)}><Icon.plus width={16} /> Add idea</button>
        </div>
      </div>

      <div className="board">
        {columns.map((col) => {
          const items = ideas.filter((i) => i.columnId === col.id)
          return (
            <div key={col.id} className="board-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onDropColumn(col.id) }}>
              <div className="section-head">
                <h3>{col.label}</h3>
                <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{items.length}</span>
              </div>
              <div className="col" style={{ gap: 10, minHeight: 40 }}>
                {items.length === 0 && <div className="drop-hint">Drop here</div>}
                {items.map((i) => {
                  const cat = categoryById(categories, i.categoryId)
                  return (
                    <div key={i.id} className={`card idea-card ${dragId === i.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={() => setDragId(i.id)}
                      onDragEnd={() => setDragId(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); onDropCard(i.id, col.id) }}
                      onClick={() => open(i)}
                      style={cat ? { borderLeft: `3px solid ${cat.color}` } : undefined}>
                      <div className="between" style={{ alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 500, lineHeight: 1.35 }}>{i.hook || 'Untitled'}</div>
                        <span className="grip" style={{ flexShrink: 0 }}><Icon.grip width={15} /></span>
                      </div>
                      {i.notes && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{i.notes}</div>}
                      <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
                        {cat && <span className="chip" style={{ padding: '2px 7px', background: tint(cat.color, 0.82), borderColor: tint(cat.color, 0.55), color: cat.color }}>{cat.label}</span>}
                        <span className={`prio ${i.priority}`}>● {i.priority}</span>
                        {i.script && <span className="chip" style={{ padding: '2px 7px' }} title="Has a script"><Icon.edit width={11} /> script</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: 8, width: '100%' }} onClick={() => open(null, col.id)}><Icon.plus width={14} /> Add</button>
            </div>
          )
        })}
      </div>

      {editing && (
        <Modal wide title={editing === 'new' ? 'New idea' : 'Edit idea'} onClose={() => setEditing(null)}
          footer={<>
            {editing !== 'new' && <button className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => { removeItem('ideas', editing.id); setEditing(null) }}>Delete</button>}
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save idea</button>
          </>}>
          <Field label="Hook"><input className="input" autoFocus value={form.hook} onChange={(e) => set('hook', e.target.value)} placeholder="Serenading my weed plants" /></Field>
          <div className="form-grid">
            <Field label="Column">
              <select className="select" value={form.columnId} onChange={(e) => set('columnId', e.target.value)}>
                {columns.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <CategorySelect categories={categories} value={form.categoryId} onChange={(v) => set('categoryId', v)} />
            </Field>
            <Field label="Priority">
              <select className="select" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Equipment needed"><input className="input" value={form.gear} onChange={(e) => set('gear', e.target.value)} placeholder="360 camera, mic, tripod" /></Field>
          </div>
          <Field label="Style tags">
            <div className="row" style={{ gap: 8 }}>
              <input className="input" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} placeholder="timelapse, educational…" />
              <button className="btn" onClick={addTag}>Add</button>
            </div>
            {form.styleTags.length > 0 && (
              <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                {form.styleTags.map((t) => <span key={t} className="chip" style={{ cursor: 'pointer' }} onClick={() => set('styleTags', form.styleTags.filter((x) => x !== t))}>{t} ✕</span>)}
              </div>
            )}
          </Field>
          <Field label="Notes"><input className="input" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="One-line direction." /></Field>
          <Field label="Script / brain dump"><textarea className="textarea" style={{ minHeight: 160 }} value={form.script} onChange={(e) => set('script', e.target.value)} placeholder="Write the whole thing here. Shot list, voiceover, captions, references, whatever." /></Field>
        </Modal>
      )}

      {manageCols && (
        <Modal title="Manage columns" onClose={() => setManageCols(false)}
          footer={<button className="btn btn-leaf" onClick={() => setManageCols(false)}>Done</button>}>
          <div className="col" style={{ gap: 10 }}>
            {columns.map((c) => (
              <div key={c.id} className="row" style={{ gap: 8, alignItems: 'center' }}>
                <input className="input" value={c.label} onChange={(e) => updateIdeaColumn(c.id, { label: e.target.value })} />
                <button className="icon-btn" disabled={columns.length <= 1}
                  onClick={() => { if (confirm(`Delete "${c.label}"? Its cards move to ${columns.find((x) => x.id !== c.id)?.label}.`)) removeIdeaColumn(c.id, columns.find((x) => x.id !== c.id)?.id) }}
                  aria-label="Delete column"><Icon.trash width={15} /></button>
              </div>
            ))}
            <button className="btn" onClick={() => addIdeaColumn('New column')}><Icon.plus width={15} /> Add column</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
