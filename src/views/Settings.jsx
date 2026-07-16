import { useRef } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { PLATFORMS, PLATFORM_LABEL, FONT_PAIRINGS, SURFACE_PRESETS } from '../store/defaults.js'
import { exportProject, parseImported } from '../store/storage.js'
import { fmtShort, growDay, todayISO } from '../lib/date.js'

const ACCENT_SWATCHES = ['#3e6b4f', '#2f6b6b', '#4a5b8a', '#7a5c8c', '#a8503f', '#b06a2e', '#5a6b3a', '#1b201a']

export default function Settings() {
  const { project, setSettings, setTheme, importProject, addCategory, updateCategory, removeCategory } = useStore()
  const s = project.settings
  const theme = s.theme || {}
  const fileRef = useRef(null)
  const growOn = s.modules?.grow !== false

  const togglePlatform = (p) => {
    const has = s.platforms.includes(p)
    setSettings({ platforms: has ? s.platforms.filter((x) => x !== p) : [...s.platforms, p] })
  }
  const onImport = async (e) => {
    const file = e.target.files?.[0]; e.target.value = ''
    if (!file) return
    try { importProject(parseImported(await file.text())) } catch (ex) { alert(ex.message || 'Could not read that file.') }
  }
  const curDay = growDay(s.germinationDate, todayISO())

  return (
    <div>
      <div className="page-head">
        <h1>Settings</h1>
        <div className="desc">Everything here is scoped to {project.name}.</div>
      </div>

      <div className="col" style={{ gap: 18, maxWidth: 760 }}>
        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Series</h3></div>
          <label><span className="field-label">Series title</span><input className="input" style={{ maxWidth: 360 }} value={s.seriesTitle || ''} onChange={(e) => setSettings({ seriesTitle: e.target.value })} /></label>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3><Icon.palette width={16} style={{ verticalAlign: '-3px' }} /> Appearance</h3></div>

          <div className="field-label">Accent color</div>
          <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
            {ACCENT_SWATCHES.map((c) => (
              <button key={c} onClick={() => setTheme({ accent: c })} aria-label={c}
                style={{ width: 28, height: 28, borderRadius: 7, background: c, border: theme.accent === c ? '2px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
            <input type="color" value={theme.accent || '#3e6b4f'} onChange={(e) => setTheme({ accent: e.target.value })} style={{ width: 32, height: 32, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
          </div>

          <div className="field-label">Secondary accent</div>
          <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
            {['#bd6a37', '#c99a3f', '#a8503f', '#6e8ca0', '#7a5c8c', '#4f7a6b'].map((c) => (
              <button key={c} onClick={() => setTheme({ accent2: c })} aria-label={c}
                style={{ width: 28, height: 28, borderRadius: 7, background: c, border: theme.accent2 === c ? '2px solid var(--ink)' : '2px solid transparent', cursor: 'pointer' }} />
            ))}
            <input type="color" value={theme.accent2 || '#bd6a37'} onChange={(e) => setTheme({ accent2: e.target.value })} style={{ width: 32, height: 32, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }} />
          </div>

          <div className="field-label">Background</div>
          <div className="row wrap" style={{ gap: 8, marginBottom: 16 }}>
            {Object.entries(SURFACE_PRESETS).map(([key, p]) => (
              <button key={key} className={`btn ${theme.surface === key ? 'btn-leaf' : ''}`} onClick={() => setTheme({ surface: key })}>
                <span className="dot" style={{ background: p.paper, border: '1px solid var(--line-strong)' }} /> {p.label}
              </button>
            ))}
          </div>

          <div className="field-label">Font</div>
          <div className="row wrap" style={{ gap: 8 }}>
            {Object.entries(FONT_PAIRINGS).map(([key, p]) => (
              <button key={key} className={`btn ${theme.font === key ? 'btn-leaf' : ''}`} onClick={() => setTheme({ font: key })} style={{ fontFamily: p.serif }}>
                {p.label}
              </button>
            ))}
          </div>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Content categories</h3></div>
          <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 13.5 }}>These color-code your reels across the Calendar, Content, and Ideas. Edit names and colors, add your own.</p>
          <div className="col" style={{ gap: 8 }}>
            {(s.categories || []).map((c) => (
              <div key={c.id} className="row" style={{ gap: 8, alignItems: 'center' }}>
                <input type="color" value={c.color} onChange={(e) => updateCategory(c.id, { color: e.target.value })} style={{ width: 30, height: 30, padding: 0, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0 }} />
                <input className="input" value={c.label} onChange={(e) => updateCategory(c.id, { label: e.target.value })} />
                <button className="icon-btn" onClick={() => removeCategory(c.id)} aria-label="Delete"><Icon.trash width={15} /></button>
              </div>
            ))}
            <button className="btn" onClick={() => addCategory('New category', '#6e8ca0')}><Icon.plus width={15} /> Add category</button>
          </div>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Grow tracking</h3></div>
          <label className="between" style={{ cursor: 'pointer' }}>
            <span>
              <div style={{ fontWeight: 500 }}>Show the grow tabs</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>When on, you get Plants, Grow Log, and Milestones. Turn it off for a project that's only about content (no plants to track).</div>
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
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>The grow log shows the other unit automatically.</div>
              </label>
            </div>
          )}
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Platforms you track</h3></div>
          <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 13.5 }}>Which platforms show up in your dropdowns and follower log. This doesn't connect to your accounts &mdash; posting and metrics stay manual for now.</p>
          <div className="row wrap" style={{ gap: 10 }}>
            {PLATFORMS.map((p) => {
              const on = s.platforms.includes(p)
              return <button key={p} className={`btn ${on ? 'btn-leaf' : ''}`} onClick={() => togglePlatform(p)}>{on && <Icon.check width={15} />} {PLATFORM_LABEL[p]}</button>
            })}
          </div>
        </section>

        <section className="card" style={{ padding: 20 }}>
          <div className="section-head"><h3>Backup &amp; transfer</h3></div>
          <p style={{ margin: '0 0 14px', color: 'var(--ink-soft)', fontSize: 14 }}>Your data lives on this device only. Export to a file to back up or move to another device, then import it there.</p>
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
