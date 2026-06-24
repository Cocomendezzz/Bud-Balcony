import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { colorFor, initials } from '../lib/color.js'
import { uid } from '../lib/id.js'

const EMPTY = { name: '', strain: '', type: 'autoflower', soil: '', pot: '5 gal cloth', notes: '' }

export default function Plants() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const [editing, setEditing] = useState(null) // plant object or 'new'
  const [form, setForm] = useState(EMPTY)
  const plants = project.plants || []

  const open = (plant) => {
    if (plant) { setForm({ ...plant }); setEditing(plant) }
    else { setForm({ ...EMPTY }); setEditing('new') }
  }

  const save = () => {
    if (!form.name.trim()) return
    if (editing === 'new') addItem('plants', { ...form, id: uid('pl_') })
    else updateItem('plants', editing.id, form)
    setEditing(null)
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Count of grow-log entries per plant for a quick "tracked" stat.
  const logCount = (id) => (project.growLog || []).filter((e) => e.plantId === id).length

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Plants</h1>
          <div className="desc">Your roster. Track each strain on its own so the failures and the stars are obvious.</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)}><Icon.plus width={16} /> Add plant</button>
      </div>

      {plants.length === 0 ? (
        <div className="empty">
          <h4>No plants yet</h4>
          <p>Add each seed you started. White Widow, Apple Fritter, Northern Lights, Blue Dream.</p>
          <button className="btn btn-leaf" style={{ marginTop: 14 }} onClick={() => open(null)}><Icon.plus width={16} /> Add your first plant</button>
        </div>
      ) : (
        <div className="plant-grid">
          {plants.map((p) => {
            const c = colorFor(p.strain || p.name)
            return (
              <div key={p.id} className="card plant-card">
                <div className="between">
                  <div className="swatch" style={{ background: c }}>{initials(p.name)}</div>
                  <div className="row" style={{ gap: 2 }}>
                    <button className="icon-btn" onClick={() => open(p)} aria-label="Edit"><Icon.edit width={16} /></button>
                    <button className="icon-btn" onClick={() => { if (confirm(`Remove ${p.name}? Its log entries stay but lose their plant link.`)) removeItem('plants', p.id) }} aria-label="Delete"><Icon.trash width={16} /></button>
                  </div>
                </div>
                <div>
                  <div className="pname">{p.name}</div>
                  <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                    <span className={`chip ${p.type === 'autoflower' ? 'chip-clay' : 'chip-leaf'}`}>{p.type === 'autoflower' ? 'Auto' : 'Photo'}</span>
                    {p.strain && p.strain !== p.name && <span className="chip">{p.strain}</span>}
                  </div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {p.soil && <div><span className="eyebrow">Soil</span> {p.soil}</div>}
                  {p.pot && <div><span className="eyebrow">Pot</span> {p.pot}</div>}
                </div>
                {p.notes && <div style={{ fontSize: 13, color: 'var(--muted)' }}>{p.notes}</div>}
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 'auto' }}>{logCount(p.id)} log entries</div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add plant' : 'Edit plant'} onClose={() => setEditing(null)}
          footer={<>
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save plant</button>
          </>}>
          <div className="form-grid">
            <Field label="Name"><input className="input" autoFocus value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Northern Lights A" /></Field>
            <Field label="Strain"><input className="input" value={form.strain} onChange={(e) => set('strain', e.target.value)} placeholder="Northern Lights" /></Field>
            <Field label="Type">
              <select className="select" value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="autoflower">Autoflower</option>
                <option value="photoperiod">Photoperiod</option>
              </select>
            </Field>
            <Field label="Pot"><input className="input" value={form.pot} onChange={(e) => set('pot', e.target.value)} placeholder="5 gal cloth" /></Field>
            <div className="full"><Field label="Soil / medium"><input className="input" value={form.soil} onChange={(e) => set('soil', e.target.value)} placeholder="Fox Farm Ocean Forest" /></Field></div>
            <div className="full"><Field label="Notes"><textarea className="textarea" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything to remember about this one." /></Field></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
