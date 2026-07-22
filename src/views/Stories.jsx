import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { todayISO, growDay, fmtShort } from '../lib/date.js'
import { uid } from '../lib/id.js'

const SLOTS = [
  { key: 'morningShot', label: 'Morning shot' },
  { key: 'closeUp', label: 'Close-up' },
  { key: 'audience', label: 'Audience' },
]

export default function Stories() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const germ = project.settings.germinationDate

  const rows = [...(project.stories || [])].sort((a, b) => (a.date < b.date ? 1 : -1))

  const addDay = () => {
    const existing = new Set((project.stories || []).map((s) => s.date))
    let date = todayISO()
    // if today already logged, step back a day until we find a free date
    let guard = 0
    while (existing.has(date) && guard < 60) {
      const d = new Date(date); d.setDate(d.getDate() - 1); date = d.toISOString().slice(0, 10); guard++
    }
    addItem('stories', { id: uid('s_'), date, day: growDay(germ, date) ?? '', morningShot: false, closeUp: false, audience: false, note: '' }, { prepend: true })
  }

  const upd = (id, patch) => updateItem('stories', id, patch)
  // Changing the date refreshes the day number; the day stays editable on its own.
  const setDate = (id, date) => updateItem('stories', id, { date, day: growDay(germ, date) ?? '' })
  const doneCount = (s) => SLOTS.filter((x) => s[x.key]).length

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Stories</h1>
          <div className="desc">The daily 3-story habit as a running sheet. Check them off. These stay off the calendar.</div>
        </div>
        <button className="btn btn-leaf" onClick={addDay}><Icon.plus width={16} /> Add day</button>
      </div>

      {rows.length === 0 ? (
        <div className="empty"><h4>No days yet</h4><p>Add a day and start the streak. Morning shot, close-up, audience interaction.</p></div>
      ) : (
        <div className="card table-scroll">
          <table className="table sheet">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>Date</th><th>Day</th>
                {SLOTS.map((s) => <th key={s.key} style={{ textAlign: 'center' }}>{s.label}</th>)}
                <th style={{ textAlign: 'center' }}>Done</th>
                <th style={{ minWidth: 220 }}>Note</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => {
                const done = doneCount(s)
                return (
                  <tr key={s.id}>
                    <td><input type="date" className="cell" value={s.date} onChange={(e) => setDate(s.id, e.target.value)} /></td>
                    <td><input type="number" className="cell num" style={{ width: 64 }} value={s.day ?? ''} placeholder="—" onChange={(e) => upd(s.id, { day: e.target.value === '' ? '' : Number(e.target.value) })} /></td>
                    {SLOTS.map((slot) => (
                      <td key={slot.key} style={{ textAlign: 'center' }}>
                        <button className={`check ${s[slot.key] ? 'on' : ''}`} style={{ margin: '0 auto' }} onClick={() => upd(s.id, { [slot.key]: !s[slot.key] })} aria-label={slot.label}><Icon.check width={13} /></button>
                      </td>
                    ))}
                    <td className="num" style={{ textAlign: 'center', color: done === 3 ? 'var(--leaf)' : 'var(--muted)' }}>{done}/3</td>
                    <td><input className="cell" value={s.note} placeholder="Song used, poll question…" onChange={(e) => upd(s.id, { note: e.target.value })} /></td>
                    <td><button className="icon-btn" onClick={() => removeItem('stories', s.id)} aria-label="Delete"><Icon.trash width={15} /></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
