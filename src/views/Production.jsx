import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { todayISO, fmtShort } from '../lib/date.js'
import { uid } from '../lib/id.js'

const SHOOT_STATUS = ['planned', 'shot', 'backed up', 'edited', 'posted']

export default function Production() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const equipment = project.equipment || []
  const shoots = [...(project.shoots || [])].sort((a, b) => (a.date < b.date ? 1 : -1))

  const addGear = () => addItem('equipment', { id: uid('e_'), name: '', have: false, notes: '' }, { prepend: true })
  const addShoot = () => addItem('shoots', { id: uid('sh_'), name: '', date: todayISO(), location: '', status: 'planned', notes: '' }, { prepend: true })
  const ge = (id, patch) => updateItem('equipment', id, patch)
  const sh = (id, patch) => updateItem('shoots', id, patch)

  const haveCount = equipment.filter((e) => e.have).length

  return (
    <div>
      <div className="page-head">
        <h1>Production</h1>
        <div className="desc">Gear you need and where your footage lives. Keep the shoots organized so nothing gets lost.</div>
      </div>

      <div className="between" style={{ marginBottom: 12 }}>
        <div className="section-head" style={{ margin: 0 }}><h3>Equipment</h3><span className="mono" style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 8 }}>{haveCount}/{equipment.length} ready</span></div>
        <button className="btn btn-sm btn-leaf" onClick={addGear}><Icon.plus width={15} /> Add gear</button>
      </div>
      {equipment.length === 0 ? (
        <div className="empty" style={{ padding: 24, marginBottom: 26 }}>No gear listed. Add what you need for the series.</div>
      ) : (
        <div className="card" style={{ marginBottom: 26 }}>
          <div className="list" style={{ padding: '4px 16px' }}>
            {equipment.map((e) => (
              <div key={e.id} className="list-row">
                <button className={`check ${e.have ? 'on' : ''}`} onClick={() => ge(e.id, { have: !e.have })} aria-label="Have it"><Icon.check width={13} /></button>
                <input className="cell grow" style={{ fontWeight: 500 }} value={e.name} placeholder="Gear name" onChange={(ev) => ge(e.id, { name: ev.target.value })} />
                <input className="cell" style={{ flex: 2, color: 'var(--muted)' }} value={e.notes} placeholder="What it's for" onChange={(ev) => ge(e.id, { notes: ev.target.value })} />
                <button className="icon-btn" onClick={() => removeItem('equipment', e.id)} aria-label="Delete"><Icon.trash width={15} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="between" style={{ marginBottom: 12 }}>
        <div className="section-head" style={{ margin: 0 }}><h3>Shoots &amp; footage</h3></div>
        <button className="btn btn-sm btn-leaf" onClick={addShoot}><Icon.plus width={15} /> Add shoot</button>
      </div>
      {shoots.length === 0 ? (
        <div className="empty" style={{ padding: 24 }}>No shoots logged. Track each filming session and where the files ended up.</div>
      ) : (
        <div className="card table-scroll">
          <table className="table sheet">
            <thead>
              <tr><th style={{ minWidth: 160 }}>Shoot</th><th style={{ minWidth: 140 }}>Date</th><th style={{ minWidth: 200 }}>Footage location</th><th style={{ minWidth: 130 }}>Status</th><th style={{ minWidth: 180 }}>Notes</th><th></th></tr>
            </thead>
            <tbody>
              {shoots.map((s) => (
                <tr key={s.id}>
                  <td><input className="cell" style={{ fontWeight: 500 }} value={s.name} placeholder="Week 3 timelapse" onChange={(e) => sh(s.id, { name: e.target.value })} /></td>
                  <td><input type="date" className="cell" value={s.date} onChange={(e) => sh(s.id, { date: e.target.value })} /></td>
                  <td><input className="cell" value={s.location} placeholder="iCloud / SSD / Frame.io…" onChange={(e) => sh(s.id, { location: e.target.value })} /></td>
                  <td>
                    <select className={`cell status-cell ${s.status === 'posted' ? 'posted' : s.status === 'edited' ? 'scheduled' : s.status === 'planned' ? 'idea' : 'filmed'}`} value={s.status} onChange={(e) => sh(s.id, { status: e.target.value })}>
                      {SHOOT_STATUS.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </td>
                  <td><input className="cell" value={s.notes} placeholder="—" onChange={(e) => sh(s.id, { notes: e.target.value })} /></td>
                  <td><button className="icon-btn" onClick={() => removeItem('shoots', s.id)} aria-label="Delete"><Icon.trash width={15} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
