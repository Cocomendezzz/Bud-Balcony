import { useRef } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { PLATFORMS, PLATFORM_LABEL } from '../store/defaults.js'
import { exportProject, parseImported } from '../store/storage.js'
import { fmtShort, growDay, todayISO } from '../lib/date.js'

export default function Settings() {
  const { project, setSettings, importProject } = useStore()
  const s = project.settings
  const fileRef = useRef(null)
  const growOn = s.modules?.grow !== false

  const togglePlatform = (p) => {
    const has = s.platforms.includes(p)
    setSettings({ platforms: has ? s.platforms.filter((x) => x !== p) : [...s.platforms, p] })
  }

  const onImport = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    try { importProject(parseImported(await file.text())) }
    catch (ex) { alert(ex.message || 'Could not read that file.') }
  }

  const curDay = growDay(s.germinationDate, todayISO())

  return (
    <div>
      <div className="page-head">
        <h1>Settings</h1>
        <div className="desc">Configure this project. Everything here is scoped to {project.name}.</div>
      </div>

      <div className="col" style={{ gap: 18, maxWidth: 720 }}>
        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Series</h3></div>
          <div className="form-grid">
            <label><span className="field-label">Series title</span><input className="input" value={s.seriesTitle || ''} onChange={(e) => setSettings({ seriesTitle: e.target.value })} /></label>
            <label><span className="field-label">Tagline</span><input className="input" value={s.tagline || ''} onChange={(e) => setSettings({ tagline: e.target.value })} /></label>
          </div>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Grow tracking</h3></div>
          <label className="between" style={{ cursor: 'pointer' }}>
            <span>
              <div style={{ fontWeight: 500 }}>Enable grow module</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Turn off for non-grow ventures. Hides Plants, Grow Log, and Milestones.</div>
            </span>
            <span className={`check ${growOn ? 'on' : ''}`} onClick={() => setSettings({ modules: { ...s.modules, grow: !growOn } })}><Icon.check width={14} /></span>
          </label>

          {growOn && (
            <div className="form-grid" style={{ marginTop: 16 }}>
              <label>
                <span className="field-label">Germination date (Day 1)</span>
                <input type="date" className="input" value={s.germinationDate || ''} onChange={(e) => setSettings({ germinationDate: e.target.value || null })} />
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>
                  {s.germinationDate ? `Today is grow day ${curDay}. Germination was ${fmtShort(s.germinationDate)}.` : 'Set this the day your first seed cracks. Every day count flows from it.'}
                </div>
              </label>
              <label>
                <span className="field-label">Height unit</span>
                <select className="select" value={s.heightUnit || 'cm'} onChange={(e) => setSettings({ heightUnit: e.target.value })}>
                  <option value="cm">Centimeters</option>
                  <option value="in">Inches</option>
                </select>
              </label>
            </div>
          )}
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Platforms</h3></div>
          <div className="row wrap" style={{ gap: 10 }}>
            {PLATFORMS.map((p) => {
              const on = s.platforms.includes(p)
              return (
                <button key={p} className={`btn ${on ? 'btn-leaf' : ''}`} onClick={() => togglePlatform(p)}>
                  {on && <Icon.check width={15} />} {PLATFORM_LABEL[p]}
                </button>
              )
            })}
          </div>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Backup & transfer</h3></div>
          <p style={{ margin: '0 0 14px', color: 'var(--ink-soft)', fontSize: 14 }}>
            Your data lives on this device only. Export a project to a file to back it up or move it to another device, then import it there.
          </p>
          <div className="row wrap" style={{ gap: 10 }}>
            <button className="btn btn-primary" onClick={() => exportProject(project)}><Icon.download width={16} /> Export {project.name}</button>
            <button className="btn" onClick={() => fileRef.current?.click()}><Icon.upload width={16} /> Import a project</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
          </div>
        </section>
      </div>
    </div>
  )
}
