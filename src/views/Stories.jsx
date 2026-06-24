import { useState } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { todayISO, fmtLong, fmtShort, growDay } from '../lib/date.js'
import { uid } from '../lib/id.js'

const SLOTS = [
  { key: 'morningShot', label: 'Morning plant shot', hint: 'Day number from seed, new leaf growth, weather, watering day. Fun song each time.' },
  { key: 'closeUp', label: 'Close-up detail', hint: 'New node growth, root progress, leaf color, stem thickness.' },
  { key: 'audience', label: 'Audience interaction', hint: 'Poll or question box. "How many grams at harvest?" "Ask me anything."' },
]

export default function Stories() {
  const { project, update } = useStore()
  const germ = project.settings.germinationDate
  const [date, setDate] = useState(todayISO())

  const record = (project.stories || []).find((s) => s.date === date)

  const toggle = (key) => {
    update((p) => {
      const list = p.stories || []
      const existing = list.find((s) => s.date === date)
      if (existing) {
        return { ...p, stories: list.map((s) => (s.date === date ? { ...s, [key]: !s[key] } : s)) }
      }
      return { ...p, stories: [...list, { id: uid('s_'), date, morningShot: false, closeUp: false, audience: false, note: '', [key]: true }] }
    })
  }

  const setNote = (note) => {
    update((p) => {
      const list = p.stories || []
      const existing = list.find((s) => s.date === date)
      if (existing) return { ...p, stories: list.map((s) => (s.date === date ? { ...s, note } : s)) }
      return { ...p, stories: [...list, { id: uid('s_'), date, morningShot: false, closeUp: false, audience: false, note }] }
    })
  }

  const done = SLOTS.filter((s) => record?.[s.key]).length
  const d = growDay(germ, date)

  // History: most recent 14 days that have any activity.
  const history = [...(project.stories || [])]
    .filter((s) => s.morningShot || s.closeUp || s.audience)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 14)

  return (
    <div>
      <div className="page-head">
        <h1>Stories</h1>
        <div className="desc">The daily 3-story habit. Five to ten minutes, every day. Consistency is the whole game.</div>
      </div>

      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="between wrap" style={{ marginBottom: 16, gap: 12 }}>
          <div>
            <div className="eyebrow">{d ? `Grow day ${d}` : 'Set germination date'}</div>
            <div className="serif" style={{ fontSize: 21, marginTop: 2 }}>{fmtLong(date)}</div>
          </div>
          <div className="row" style={{ alignItems: 'center', gap: 10 }}>
            <input type="date" className="input" style={{ width: 'auto' }} value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="mono" style={{ fontSize: 13, color: done === 3 ? 'var(--leaf)' : 'var(--muted)' }}>{done}/3</div>
          </div>
        </div>

        <div className="col">
          {SLOTS.map((slot) => {
            const on = !!record?.[slot.key]
            return (
              <button key={slot.key} className="story-check" onClick={() => toggle(slot.key)} style={{ cursor: 'pointer', textAlign: 'left' }}>
                <span className={`check ${on ? 'on' : ''}`}><Icon.check width={14} /></span>
                <span className="grow">
                  <div style={{ fontWeight: 500, textDecoration: on ? 'line-through' : 'none', color: on ? 'var(--muted)' : 'var(--ink)' }}>{slot.label}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{slot.hint}</div>
                </span>
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 14 }}>
          <span className="field-label">Note for the day</span>
          <input className="input" value={record?.note || ''} onChange={(e) => setNote(e.target.value)} placeholder="Song used, poll question, anything to remember." />
        </div>
      </div>

      <div className="section-head"><h3>Recent days</h3></div>
      {history.length === 0 ? (
        <div className="empty" style={{ padding: 28 }}>No story days logged yet. Today is a good day to start the streak.</div>
      ) : (
        <div className="card">
          <table className="table">
            <thead><tr><th>Date</th><th>Day</th><th>Morning</th><th>Close-up</th><th>Audience</th><th>Note</th></tr></thead>
            <tbody>
              {history.map((s) => (
                <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => setDate(s.date)}>
                  <td className="num">{fmtShort(s.date)}</td>
                  <td className="num">{growDay(germ, s.date) ? `D${growDay(germ, s.date)}` : '—'}</td>
                  {['morningShot', 'closeUp', 'audience'].map((k) => (
                    <td key={k}>{s[k] ? <span style={{ color: 'var(--leaf)' }}><Icon.check width={16} /></span> : <span style={{ color: 'var(--line-strong)' }}>—</span>}</td>
                  ))}
                  <td style={{ color: 'var(--muted)', fontSize: 13 }}>{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
