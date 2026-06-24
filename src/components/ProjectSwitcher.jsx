import { useRef, useState, useEffect } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from './Icons.jsx'
import { Modal, Field } from './Modal.jsx'
import { exportProject, parseImported } from '../store/storage.js'
import { initials } from '../lib/color.js'

export default function ProjectSwitcher() {
  const { projects, project, activeId, setActive, createProject, renameProject, deleteProject, duplicateProject, importProject } = useStore()
  const [open, setOpen] = useState(false)
  const [modal, setModal] = useState(null) // 'create' | 'rename' | 'delete'
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const fileRef = useRef(null)
  const wrapRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false) }
    window.addEventListener('mousedown', onClick)
    return () => window.removeEventListener('mousedown', onClick)
  }, [])

  if (!project) return null

  const onImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const text = await file.text()
      const proj = parseImported(text)
      importProject(proj)
      setOpen(false)
    } catch (ex) {
      alert(ex.message || 'Could not read that file.')
    }
  }

  return (
    <div className="proj-switch" ref={wrapRef}>
      <button className="proj-trigger" onClick={() => setOpen((o) => !o)}>
        <span className="proj-avatar">{initials(project.name)}</span>
        <span className="meta">
          <span className="label">Project</span>
          <span className="name">{project.name}</span>
        </span>
        <Icon.chevron width={16} style={{ color: 'var(--muted)' }} />
      </button>

      {open && (
        <div className="menu">
          <div className="menu-section">Switch project</div>
          {projects.map((p) => (
            <button key={p.id} className={`menu-item ${p.id === activeId ? 'active' : ''}`} onClick={() => { setActive(p.id); setOpen(false) }}>
              <span className="proj-avatar" style={{ width: 24, height: 24, fontSize: 12, borderRadius: 6 }}>{initials(p.name)}</span>
              <span className="grow" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              {p.id === activeId && <Icon.check width={15} style={{ color: 'var(--leaf)' }} />}
            </button>
          ))}
          <div className="menu-divider" />
          <button className="menu-item" onClick={() => { setName(''); setErr(''); setModal('create'); setOpen(false) }}><Icon.plus width={16} /> New project</button>
          <button className="menu-item" onClick={() => fileRef.current?.click()}><Icon.upload width={16} /> Import from file</button>
          <button className="menu-item" onClick={() => { exportProject(project); setOpen(false) }}><Icon.download width={16} /> Export this project</button>
          <button className="menu-item" onClick={() => { duplicateProject(activeId); setOpen(false) }}><Icon.copy width={16} /> Duplicate</button>
          <div className="menu-divider" />
          <button className="menu-item" onClick={() => { setName(project.name); setModal('rename'); setOpen(false) }}><Icon.edit width={16} /> Rename</button>
          <button className="menu-item" style={{ color: 'var(--danger)' }} onClick={() => { setModal('delete'); setOpen(false) }}><Icon.trash width={16} /> Delete</button>
        </div>
      )}

      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImportFile} />

      {modal === 'create' && (
        <Modal title="New project" onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={() => {
              if (!name.trim()) { setErr('Give it a name first.'); return }
              createProject(name.trim()); setModal(null)
            }}>Create</button>
          </>}>
          <Field label="Project name">
            <input className="input" autoFocus value={name} onChange={(e) => { setName(e.target.value); setErr('') }} placeholder="e.g. Indoor Winter Grow" />
          </Field>
          {err && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{err}</div>}
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Starts empty. Grow tracking is on by default; you can turn it off in Settings for non-grow ventures.</p>
        </Modal>
      )}

      {modal === 'rename' && (
        <Modal title="Rename project" onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={() => { if (name.trim()) renameProject(activeId, name.trim()); setModal(null) }}>Save</button>
          </>}>
          <Field label="Project name">
            <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
        </Modal>
      )}

      {modal === 'delete' && (
        <Modal title="Delete project" onClose={() => setModal(null)}
          footer={<>
            <button className="btn" onClick={() => setModal(null)}>Keep it</button>
            <button className="btn btn-danger" onClick={() => { deleteProject(activeId); setModal(null) }}>Delete forever</button>
          </>}>
          <p style={{ margin: 0 }}>Delete <strong>{project.name}</strong> and all of its grow log, posts, ideas, and milestones? This can't be undone. Export it first if you want a backup.</p>
        </Modal>
      )}
    </div>
  )
}
