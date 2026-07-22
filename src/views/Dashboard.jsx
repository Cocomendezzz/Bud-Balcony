import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import LineChart from '../components/LineChart.jsx'
import ProgressRing from '../components/ProgressRing.jsx'
import { categoryById } from '../components/Category.jsx'
import { PLATFORM_LABEL } from '../store/defaults.js'
import { todayISO, toISO, fromISO, growDay, fmtShort, fmtLong, DOW } from '../lib/date.js'
import { predictPhase } from '../lib/growth.js'
import { colorFor, tint, readableOn } from '../lib/color.js'
import { uid } from '../lib/id.js'

export default function Dashboard({ setView }) {
  const { project, update } = useStore()
  const s = project.settings
  const growOn = s.modules?.grow !== false
  const today = todayISO()
  const gd = growDay(s.germinationDate, today)
  const platforms = s.platforms || []
  const categories = s.categories || []

  const [logOpen, setLogOpen] = useState(false)
  const [form, setForm] = useState(() => ({ date: today, counts: Object.fromEntries(platforms.map((p) => [p, ''])) }))

  const followers = useMemo(() => [...(project.followers || [])].sort((a, b) => (a.date < b.date ? -1 : 1)), [project.followers])
  const totalOf = (rec) => Object.values(rec.counts || {}).reduce((a, n) => a + (Number(n) || 0), 0)
  const latest = followers[followers.length - 1]
  const latestTotal = latest ? totalOf(latest) : 0
  const prevTotal = followers.length > 1 ? totalOf(followers[followers.length - 2]) : null
  const delta = prevTotal != null ? latestTotal - prevTotal : null
  const series = followers.map((f) => ({ x: f.date, y: totalOf(f) }))

  const postsPosted = (project.posts || []).filter((p) => p.status === 'posted')
  const vaultCount = (project.ideas || []).length
  const nextMilestone = (project.milestones || []).find((m) => !m.done)

  // 7-day strip starting today
  const week = useMemo(() => {
    const start = fromISO(today)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      const iso = toISO(d)
      const cal = (project.calendar || []).filter((e) => e.date === iso)
      const posts = (project.posts || []).filter((po) => po.date === iso).map((po) => ({ id: `po_${po.id}`, title: po.hook || 'Untitled post', categoryId: po.categoryId }))
      return { iso, dow: DOW[d.getDay()], day: d.getDate(), gd: growDay(s.germinationDate, iso), events: [...cal, ...posts] }
    })
  }, [today, project.calendar, project.posts, s.germinationDate])

  // latest logged stage per plant, for a quick behind/ahead read
  const latestStage = (plantId) => {
    const entries = (project.growLog || []).filter((e) => e.plantId === plantId || e.plantId === 'all')
    if (!entries.length) return null
    return entries.sort((a, b) => (a.date < b.date ? 1 : -1))[0].stage
  }

  const saveFollowers = () => {
    const counts = Object.fromEntries(Object.entries(form.counts).map(([k, v]) => [k, v === '' ? 0 : Number(v)]))
    update((p) => {
      const list = (p.followers || []).filter((f) => f.date !== form.date)
      return { ...p, followers: [...list, { id: uid('f_'), date: form.date, counts }] }
    })
    setLogOpen(false)
  }

  return (
    <div>
      <div className="dateline">
        <div className="left">
          {growOn && s.germinationDate && <div className={`daynum ${gd < 1 ? 'pre' : ''}`}>{gd}</div>}
          <div className="day-meta">
            <span className="k">{growOn ? (s.germinationDate ? (gd < 1 ? 'Days to germination' : 'Grow day') : 'Not started') : 'Project'}</span>
            <div className="series">{s.seriesTitle || project.name}</div>
          </div>
        </div>
        <div className="right">
          <div className="today">{fmtLong(today)}</div>
          {growOn && !s.germinationDate && <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setView('settings')}>Set germination date</button>}
        </div>
      </div>

      <div className="stats">
        <div className="stat">
          <div className="k"><Icon.users width={13} style={{ verticalAlign: '-2px' }} /> Followers</div>
          <div className="v">{latestTotal.toLocaleString()}</div>
          <div className="sub">{delta != null ? `${delta >= 0 ? '+' : ''}${delta.toLocaleString()} since last log` : 'Log your first count'}</div>
        </div>
        <div className="stat">
          <div className="k"><Icon.film width={13} style={{ verticalAlign: '-2px' }} /> Posted</div>
          <div className="v">{postsPosted.length}</div>
          <div className="sub">{vaultCount} ideas in the vault</div>
        </div>
        <div className="stat">
          <div className="k"><Icon.bulb width={13} style={{ verticalAlign: '-2px' }} /> Vault</div>
          <div className="v">{vaultCount}</div>
          <div className="sub">{(project.calendar || []).length} on the calendar</div>
        </div>
        <div className="stat">
          <div className="k"><Icon.flag width={13} style={{ verticalAlign: '-2px' }} /> Next milestone</div>
          <div className="v" style={{ fontSize: 19, lineHeight: 1.2 }}>{nextMilestone ? nextMilestone.name : 'All hit'}</div>
        </div>
      </div>

      {/* Per-strain progress wheels */}
      {growOn && (project.plants || []).length > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 18 }}>
          <div className="section-head">
            <h3>Strain progress</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => setView('plants')}>Plants →</button>
          </div>
          <div className="ring-grid">
            {(project.plants || []).map((p) => {
              const eGerm = p.germinationDate || s.germinationDate
              const pgd = growDay(eGerm, today)
              const pred = predictPhase(p.growType, pgd)
              const stage = latestStage(p.id)
              const hasDate = !!eGerm
              return (
                <div key={p.id} className="ring-cell">
                  <ProgressRing value={hasDate ? pred.overall : 0} color={p.color} track={tint(p.color, 0.78)}>
                    {hasDate ? (
                      <>
                        <div className="mono" style={{ fontSize: 17, fontWeight: 600, color: p.color }}>{Math.round(pred.overall * 100)}%</div>
                        <div style={{ fontSize: 9.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{pred.phase}</div>
                      </>
                    ) : (
                      <div style={{ fontSize: 9.5, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3, padding: '0 8px' }}>no start<br />date</div>
                    )}
                  </ProgressRing>
                  <div style={{ textAlign: 'center', marginTop: 8 }}>
                    <div style={{ fontWeight: 500, fontSize: 13.5 }}>{p.strain}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {p.growType === 'autoflower' ? 'auto' : 'photo'}
                      {hasDate && pgd != null ? ` · day ${pgd}` : ''}
                      {stage ? ` · logged: ${stage}` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {!s.germinationDate && !(project.plants || []).some((p) => p.germinationDate) && (
            <div style={{ marginTop: 14, fontSize: 12.5, color: 'var(--muted)' }}>
              Add a start date to a plant (on the Plants page) or set the project germination date in Settings to see progress.
            </div>
          )}
        </div>
      )}

      {/* Mini 7-day calendar */}
      <div className="card" style={{ padding: 18, marginBottom: 18 }}>
        <div className="section-head">
          <h3>This week</h3>
          <button className="btn btn-sm btn-ghost" onClick={() => setView('calendar')}>Calendar →</button>
        </div>
        <div className="week-strip">
          {week.map((d, i) => (
            <div key={d.iso} className={`week-day ${i === 0 ? 'is-today' : ''}`} onClick={() => setView('calendar')}>
              <div className="week-dow">{d.dow}</div>
              <div className="week-num">{d.day}</div>
              {d.gd && d.gd > 0 && <div className="week-grow mono">D{d.gd}</div>}
              <div className="week-events">
                {d.events.slice(0, 3).map((e) => {
                  const cat = categoryById(categories, e.categoryId)
                  const color = cat?.color || 'var(--muted)'
                  return <div key={e.id} className="week-event" title={e.title} style={{ background: tint(color, 0.8), color, borderLeft: `2px solid ${color}` }}>{e.title}</div>
                })}
                {d.events.length > 3 && <div className="mono" style={{ fontSize: 9, color: 'var(--muted)' }}>+{d.events.length - 3}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Follower growth (manual), one chart per platform */}
      <div className="card" style={{ padding: 18 }}>
        <div className="section-head">
          <h3>Follower growth</h3>
          <button className="btn btn-sm btn-leaf" onClick={() => { setForm({ date: today, counts: Object.fromEntries(platforms.map((p) => [p, latest?.counts?.[p] ?? ''])) }); setLogOpen(true) }}><Icon.plus width={14} /> Log followers</button>
        </div>
        <div className="pf-charts">
          {platforms.map((p) => {
            const pSeries = followers.map((f) => ({ x: f.date, y: Number(f.counts?.[p]) || 0 }))
            const cur = latest ? Number(latest.counts?.[p]) || 0 : 0
            const prevRec = followers.length > 1 ? followers[followers.length - 2] : null
            const d = prevRec != null ? cur - (Number(prevRec.counts?.[p]) || 0) : null
            return (
              <div key={p} className="pf-chart">
                <div className="between" style={{ marginBottom: 6 }}>
                  <span className="row" style={{ alignItems: 'center', gap: 7 }}>
                    <span className="dot" style={{ background: colorFor(p) }} />
                    <strong style={{ fontSize: 13.5 }}>{PLATFORM_LABEL[p]}</strong>
                  </span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>
                    {cur.toLocaleString()}
                    {d != null && <span style={{ color: d >= 0 ? 'var(--leaf)' : 'var(--danger)', marginLeft: 8, fontWeight: 500 }}>{d >= 0 ? '+' : ''}{d.toLocaleString()}</span>}
                  </span>
                </div>
                <LineChart series={pSeries} height={120} color={colorFor(p)} />
              </div>
            )
          })}
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 12.5, color: 'var(--muted)' }}>Entered by hand. Connecting accounts directly isn't possible in a no-login app like this, so Sunday check-ins keep the lines moving.</p>
      </div>

      {logOpen && (
        <Modal title="Log followers" onClose={() => setLogOpen(false)}
          footer={<>
            <button className="btn" onClick={() => setLogOpen(false)}>Cancel</button>
            <button className="btn btn-leaf" onClick={saveFollowers}>Save snapshot</button>
          </>}>
          <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></Field>
          <div className="form-grid">
            {platforms.map((p) => (
              <Field key={p} label={PLATFORM_LABEL[p]}>
                <input type="number" className="input" value={form.counts[p] ?? ''} onChange={(e) => setForm((f) => ({ ...f, counts: { ...f.counts, [p]: e.target.value } }))} placeholder="0" />
              </Field>
            ))}
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)' }}>One snapshot per date. Logging the same date again overwrites it.</p>
        </Modal>
      )}
    </div>
  )
}
