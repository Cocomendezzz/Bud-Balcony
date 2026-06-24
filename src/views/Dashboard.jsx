import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import LineChart from '../components/LineChart.jsx'
import { PLATFORM_LABEL } from '../store/defaults.js'
import { todayISO, growDay, fmtShort, fmtLong, daysBetween } from '../lib/date.js'
import { colorFor } from '../lib/color.js'
import { uid } from '../lib/id.js'

export default function Dashboard({ setView }) {
  const { project, update } = useStore()
  const s = project.settings
  const growOn = s.modules?.grow !== false
  const today = todayISO()
  const gd = growDay(s.germinationDate, today)
  const platforms = s.platforms || []

  const [logOpen, setLogOpen] = useState(false)
  const [form, setForm] = useState(() => ({ date: today, counts: Object.fromEntries(platforms.map((p) => [p, ''])) }))

  const followers = useMemo(
    () => [...(project.followers || [])].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [project.followers]
  )
  const totalOf = (rec) => Object.values(rec.counts || {}).reduce((a, n) => a + (Number(n) || 0), 0)
  const latest = followers[followers.length - 1]
  const latestTotal = latest ? totalOf(latest) : 0
  const prevTotal = followers.length > 1 ? totalOf(followers[followers.length - 2]) : null
  const delta = prevTotal != null ? latestTotal - prevTotal : null

  const series = followers.map((f) => ({ x: f.date, y: totalOf(f) }))

  const postsPosted = (project.posts || []).filter((p) => p.status === 'posted')
  const topPosts = [...postsPosted]
    .sort((a, b) => ((Number(b.saves) || 0) + (Number(b.shares) || 0)) - ((Number(a.saves) || 0) + (Number(a.shares) || 0)))
    .slice(0, 4)

  const nextMilestone = (project.milestones || []).find((m) => !m.done)

  // Upcoming calendar events in the next 7 days.
  const upcoming = (project.calendar || [])
    .filter((e) => { const d = daysBetween(today, e.date); return d != null && d >= 0 && d <= 7 })
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(0, 6)

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
      {/* Signature dateline masthead */}
      <div className="dateline">
        <div className="left">
          {growOn && s.germinationDate && (
            <div className={`daynum ${gd < 1 ? 'pre' : ''}`}>{gd}</div>
          )}
          <div className="day-meta">
            <span className="k">{growOn ? (s.germinationDate ? (gd < 1 ? 'Days to germination' : 'Grow day') : 'Not started') : 'Project'}</span>
            <div className="series">{s.seriesTitle || project.name}</div>
            <div className="tag">{s.tagline}</div>
          </div>
        </div>
        <div className="right">
          <div className="today">{fmtLong(today)}</div>
          {growOn && !s.germinationDate && (
            <button className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setView('settings')}>Set germination date</button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat">
          <div className="k"><Icon.users width={13} style={{ verticalAlign: '-2px' }} /> Followers</div>
          <div className="v">{latestTotal.toLocaleString()}</div>
          <div className="sub">{delta != null ? `${delta >= 0 ? '+' : ''}${delta.toLocaleString()} since last log` : 'Log your first count'}</div>
        </div>
        {growOn && (
          <div className="stat">
            <div className="k"><Icon.leaf width={13} style={{ verticalAlign: '-2px' }} /> Plants</div>
            <div className="v">{(project.plants || []).length}</div>
            <div className="sub">{(project.growLog || []).length} log entries</div>
          </div>
        )}
        <div className="stat">
          <div className="k"><Icon.film width={13} style={{ verticalAlign: '-2px' }} /> Posted</div>
          <div className="v">{postsPosted.length}</div>
          <div className="sub">{(project.ideas || []).filter((i) => i.status !== 'posted').length} ideas waiting</div>
        </div>
        <div className="stat">
          <div className="k"><Icon.flag width={13} style={{ verticalAlign: '-2px' }} /> Next milestone</div>
          <div className="v" style={{ fontSize: 19, lineHeight: 1.2 }}>{nextMilestone ? nextMilestone.name : 'All hit'}</div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Follower growth */}
        <div className="card" style={{ padding: 18 }}>
          <div className="section-head">
            <h3>Follower growth</h3>
            <button className="btn btn-sm btn-leaf" onClick={() => { setForm({ date: today, counts: Object.fromEntries(platforms.map((p) => [p, latest?.counts?.[p] ?? ''])) }); setLogOpen(true) }}><Icon.plus width={14} /> Log followers</button>
          </div>
          <LineChart series={series} />
          {latest && (
            <div className="row wrap" style={{ gap: 14, marginTop: 12 }}>
              {platforms.map((p) => (
                <div key={p} className="row" style={{ alignItems: 'center', gap: 7 }}>
                  <span className="dot" style={{ background: colorFor(p) }} />
                  <span style={{ fontSize: 13 }}>{PLATFORM_LABEL[p]}</span>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600 }}>{(latest.counts?.[p] || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* This week */}
        <div className="card" style={{ padding: 18 }}>
          <div className="section-head">
            <h3>Next 7 days</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => setView('calendar')}>Calendar →</button>
          </div>
          {upcoming.length === 0 ? (
            <div className="empty" style={{ padding: 22, fontSize: 13 }}>Nothing scheduled. Plan a few reels on the calendar.</div>
          ) : (
            <div className="list">
              {upcoming.map((e) => (
                <div key={e.id} className="list-row" style={{ padding: '10px 0' }}>
                  <div style={{ textAlign: 'center', minWidth: 42 }}>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{fmtShort(e.date)}</div>
                  </div>
                  <div className="grow">
                    <div style={{ fontWeight: 500, fontSize: 14, textDecoration: e.done ? 'line-through' : 'none', color: e.done ? 'var(--muted)' : 'var(--ink)' }}>{e.title}</div>
                    <div className="meta" style={{ fontSize: 12 }}>{e.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top posts */}
      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div className="section-head">
          <h3>Top posts by saves + shares</h3>
          <button className="btn btn-sm btn-ghost" onClick={() => setView('content')}>All content →</button>
        </div>
        {topPosts.length === 0 ? (
          <div className="empty" style={{ padding: 22, fontSize: 13 }}>No posted content yet. The saves and shares are what grow the account, so log them as they come in.</div>
        ) : (
          <div className="list">
            {topPosts.map((p, i) => (
              <div key={p.id} className="list-row">
                <div className="serif" style={{ fontSize: 22, color: 'var(--muted)', minWidth: 28 }}>{i + 1}</div>
                <div className="grow">
                  <div style={{ fontWeight: 500 }}>{p.hook}</div>
                  <div className="meta">{PLATFORM_LABEL[p.platform]} · {fmtShort(p.date)}</div>
                </div>
                <div className="row" style={{ gap: 16 }}>
                  <span className="mono" style={{ fontSize: 13 }} title="Saves"><Icon.bookmark width={14} style={{ verticalAlign: '-2px', color: 'var(--leaf)' }} /> {(Number(p.saves) || 0).toLocaleString()}</span>
                  <span className="mono" style={{ fontSize: 13 }} title="Shares"><Icon.share width={14} style={{ verticalAlign: '-2px', color: 'var(--clay)' }} /> {(Number(p.shares) || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
          <p style={{ margin: 0, fontSize: 12.5, color: 'var(--muted)' }}>One snapshot per date. Logging the same date again overwrites it. Sunday is the playbook's metrics day.</p>
        </Modal>
      )}
    </div>
  )
}
