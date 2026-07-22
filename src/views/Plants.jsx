import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { initials, SWATCHES, tint, readableOn } from '../lib/color.js'
import { strainInfoFor, makePlant } from '../store/defaults.js'
import { lookupStrain, strainNames } from '../lib/strains.js'
import { growDay, todayISO, fmtShort } from '../lib/date.js'

export default function Plants() {
  const { project, addItem, updateItem, removeItem, reorderCollection } = useStore()
  const plants = project.plants || []
  const germ = project.settings.germinationDate
  const [editing, setEditing] = useState(null)
  const [dragId, setDragId] = useState(null)

  const blank = () => ({ strain: '', growType: 'photoperiod', color: SWATCHES[0], germinationDate: '', info: strainInfoFor(''), infoManual: false })
  const [form, setForm] = useState(blank())

  const open = (plant) => {
    if (plant) {
      setForm({ ...plant, effectsText: (plant.info?.effects || []).join(', '), flavorsText: (plant.info?.flavors || []).join(', ') })
      setEditing(plant)
    } else { setForm({ ...blank(), effectsText: '', flavorsText: '' }); setEditing('new') }
  }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const parseList = (t) => t.split(',').map((x) => x.trim()).filter(Boolean)
  // Bind the list inputs to raw text so spaces/commas type normally; parse alongside.
  const setEffects = (t) => setForm((f) => ({ ...f, effectsText: t, info: { ...f.info, effects: parseList(t) } }))
  const setFlavors = (t) => setForm((f) => ({ ...f, flavorsText: t, info: { ...f.info, flavors: parseList(t) } }))

  // When the strain name changes, auto-fill info from the DB unless manually overridden.
  const onStrainChange = (val) => {
    setForm((f) => {
      if (f.infoManual) return { ...f, strain: val }
      const info = strainInfoFor(val)
      return { ...f, strain: val, info, effectsText: (info.effects || []).join(', '), flavorsText: (info.flavors || []).join(', ') }
    })
  }

  const save = () => {
    if (!form.strain.trim()) return
    const { effectsText, flavorsText, ...clean } = form
    if (editing === 'new') addItem('plants', { ...makePlant(clean.strain, clean.growType, clean.color, clean.germinationDate), info: clean.info, infoManual: clean.infoManual })
    else updateItem('plants', editing.id, clean)
    setEditing(null)
  }

  const logCount = (id) => (project.growLog || []).filter((e) => e.plantId === id).length
  const latestStage = (id) => {
    const entries = (project.growLog || []).filter((e) => e.plantId === id || e.plantId === 'all')
    if (!entries.length) return null
    return [...entries].sort((a, b) => (a.date < b.date ? 1 : -1))[0].stage
  }
  const found = lookupStrain(form.strain)

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Plants</h1>
          <div className="desc">Your roster. Drag to reorder. Strain info fills in automatically where we have it.</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)}><Icon.plus width={16} /> Add plant</button>
      </div>

      {plants.length === 0 ? (
        <div className="empty">
          <h4>No plants yet</h4>
          <p>Add each seed you started. Type the strain and we'll pull effects, THC, and lineage.</p>
          <button className="btn btn-leaf" style={{ marginTop: 14 }} onClick={() => open(null)}><Icon.plus width={16} /> Add your first plant</button>
        </div>
      ) : (
        <div className="plant-grid">
          {plants.map((p) => {
            const info = p.info || {}
            const eGerm = p.germinationDate || germ
            const gd = growDay(eGerm, todayISO())
            const stage = latestStage(p.id)
            return (
              <div key={p.id} className={`card plant-card ${dragId === p.id ? 'dragging' : ''}`}
                draggable
                onDragStart={() => setDragId(p.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); if (dragId && dragId !== p.id) reorderCollection('plants', dragId, p.id); setDragId(null) }}
                style={{ borderTop: `3px solid ${p.color}` }}>
                <div className="between">
                  <div className="row" style={{ alignItems: 'center', gap: 10 }}>
                    <span className="grip" title="Drag to reorder"><Icon.grip width={16} /></span>
                    <div className="swatch" style={{ background: p.color, color: readableOn(p.color) }}>{initials(p.strain)}</div>
                  </div>
                  <div className="row" style={{ gap: 2 }}>
                    <button className="icon-btn" onClick={() => open(p)} aria-label="Edit"><Icon.edit width={16} /></button>
                    <button className="icon-btn" onClick={() => { if (confirm(`Remove ${p.strain}?`)) removeItem('plants', p.id) }} aria-label="Delete"><Icon.trash width={16} /></button>
                  </div>
                </div>

                <div>
                  <div className="pname">{p.strain}</div>
                  <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                    <span className={`chip ${p.growType === 'autoflower' ? 'chip-clay' : 'chip-leaf'}`}>{p.growType === 'autoflower' ? 'Auto' : 'Photo'}</span>
                    {info.type && <span className="chip">{info.type}{info.lean && info.lean !== info.type ? ` · ${info.lean}` : ''}</span>}
                    {info.thc && <span className="chip">THC {info.thc}</span>}
                  </div>
                </div>

                {info.blurb && <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{info.blurb}</div>}

                {(info.effects?.length || info.flavors?.length) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5 }}>
                    {info.effects?.length ? <div><span className="eyebrow">Effects</span> <span style={{ color: 'var(--ink-soft)' }}>{info.effects.join(', ')}</span></div> : null}
                    {info.flavors?.length ? <div><span className="eyebrow">Taste</span> <span style={{ color: 'var(--ink-soft)' }}>{info.flavors.join(', ')}</span></div> : null}
                    {info.lineage ? <div><span className="eyebrow">Cross</span> <span style={{ color: 'var(--ink-soft)' }}>{info.lineage}</span></div> : null}
                  </div>
                ) : null}

                <div className="between" style={{ marginTop: 'auto', paddingTop: 6 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{logCount(p.id)} log entries</span>
                  {stage ? <span className="mono" style={{ fontSize: 11, color: 'var(--leaf)' }}>stage: {stage}</span> : <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>no log yet</span>}
                </div>
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
            <div className="full">
              <Field label="Strain">
                <input className="input" autoFocus list="strain-list" value={form.strain} onChange={(e) => onStrainChange(e.target.value)} placeholder="Blue Dream" />
                <datalist id="strain-list">{strainNames().map((n) => <option key={n} value={n} />)}</datalist>
                <div style={{ fontSize: 12, color: found ? 'var(--leaf)' : 'var(--muted)', marginTop: 6 }}>
                  {found ? `Matched ${found.display} — info filled in below.` : form.strain ? 'No match in the strain library. Add details manually below.' : 'Start typing; known strains autofill.'}
                </div>
              </Field>
            </div>
            <Field label="Grow type">
              <select className="select" value={form.growType} onChange={(e) => set('growType', e.target.value)}>
                <option value="autoflower">Autoflower</option>
                <option value="photoperiod">Photoperiod</option>
              </select>
            </Field>
            <Field label="Germinated / started">
              <input type="date" className="input" value={form.germinationDate || ''} onChange={(e) => set('germinationDate', e.target.value)} />
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
                {form.germinationDate ? `This plant's Day 1. Drives its progress wheel.` : (germ ? `Blank = uses the project date (${fmtShort(germ)}).` : 'Set this plant\u2019s Day 1 to track its progress wheel.')}
              </div>
            </Field>
            <Field label="Label color">
              <div className="row wrap" style={{ gap: 6 }}>
                {SWATCHES.map((c) => (
                  <button key={c} onClick={() => set('color', c)} aria-label={c}
                    style={{ width: 24, height: 24, borderRadius: 6, background: c, border: form.color === c ? '2px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
                <input type="color" value={form.color} onChange={(e) => set('color', e.target.value)} style={{ width: 28, height: 28, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
              </div>
            </Field>
          </div>

          <div className="between" style={{ marginTop: 6 }}>
            <span className="field-label" style={{ margin: 0 }}>Strain details</span>
            <label className="row" style={{ alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
              <span className={`check ${form.infoManual ? 'on' : ''}`} onClick={() => set('infoManual', !form.infoManual)}><Icon.check width={13} /></span>
              Edit manually
            </label>
          </div>

          {form.infoManual ? (
            <div className="form-grid">
              <Field label="Type"><input className="input" value={form.info.type || ''} onChange={(e) => set('info', { ...form.info, type: e.target.value, source: 'manual' })} placeholder="hybrid / indica / sativa" /></Field>
              <Field label="THC"><input className="input" value={form.info.thc || ''} onChange={(e) => set('info', { ...form.info, thc: e.target.value })} placeholder="18–25%" /></Field>
              <div className="full"><Field label="Effects (comma separated)"><input className="input" value={form.effectsText ?? ''} onChange={(e) => setEffects(e.target.value)} placeholder="relaxed, giggly, creative" /></Field></div>
              <div className="full"><Field label="Taste (comma separated)"><input className="input" value={form.flavorsText ?? ''} onChange={(e) => setFlavors(e.target.value)} placeholder="earthy, citrus, sweet" /></Field></div>
              <div className="full"><Field label="Lineage / cross"><input className="input" value={form.info.lineage || ''} onChange={(e) => set('info', { ...form.info, lineage: e.target.value })} /></Field></div>
              <div className="full"><Field label="Blurb"><textarea className="textarea" value={form.info.blurb || ''} onChange={(e) => set('info', { ...form.info, blurb: e.target.value })} /></Field></div>
            </div>
          ) : (
            <div className="card" style={{ padding: 14, background: 'var(--surface-2)' }}>
              {found ? (
                <div style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.5 }}>
                  <strong>{found.type}{found.lean ? ` · ${found.lean}` : ''}</strong> · THC {found.thc}<br />
                  {found.blurb}<br />
                  <span className="eyebrow">Effects</span> {found.effects.join(', ')} · <span className="eyebrow">Taste</span> {found.flavors.join(', ')}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>No library match. Toggle "Edit manually" to add your own details.</div>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}
