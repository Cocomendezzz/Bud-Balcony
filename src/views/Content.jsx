import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { POST_STATUS, PLATFORM_LABEL } from '../store/defaults.js'
import { CategorySelect, categoryById } from '../components/Category.jsx'
import { todayISO, toISO, fromISO, growDay } from '../lib/date.js'
import { uid } from '../lib/id.js'

const PLATFORM_SHORT = { instagram: 'IG', tiktok: 'TT', youtube: 'YT' }

function nextDate(iso) {
  const d = fromISO(iso)
  if (!d) return todayISO()
  d.setDate(d.getDate() + 1)
  return toISO(d)
}

export default function Content() {
  const { project, addItem, bulkAdd, updateItem, removeItem } = useStore()
  const platforms = project.settings.platforms || []
  const categories = project.settings.categories || []
  const germ = project.settings.germinationDate

  const [pf, setPf] = useState('all')
  const [st, setSt] = useState('all')

  const autoDay = (date) => growDay(germ, date) ?? ''

  // New rows land at the bottom, dated one day after the last row (unless you change it).
  const newRow = (date) => ({ id: uid('po_'), date, day: autoDay(date), platforms: platforms.slice(0, 1), hook: '', categoryId: null, status: 'idea', url: '', views: '', likes: '', saves: '', shares: '', comments: '', notes: '' })
  const lastDate = () => {
    const list = project.posts || []
    return list.length ? list[list.length - 1].date : null
  }
  const addRow = () => {
    const base = lastDate()
    addItem('posts', newRow(base ? nextDate(base) : todayISO()))
  }
  const addTen = () => {
    let d = lastDate()
    const rows = Array.from({ length: 10 }, () => {
      d = d ? nextDate(d) : todayISO()
      return newRow(d)
    })
    bulkAdd('posts', rows)
  }

  // Changing the date recalculates the day number; you can still type over the day after.
  const setDate = (id, date) => updateItem('posts', id, { date, day: autoDay(date) })
  const togglePlatform = (post, p) => {
    const has = (post.platforms || []).includes(p)
    updateItem('posts', post.id, { platforms: has ? post.platforms.filter((x) => x !== p) : [...(post.platforms || []), p] })
  }

  const rows = useMemo(() => {
    let list = [...(project.posts || [])]
    if (pf !== 'all') list = list.filter((p) => (p.platforms || []).includes(pf))
    if (st !== 'all') list = list.filter((p) => p.status === st)
    return list
  }, [project.posts, pf, st])

  const totals = useMemo(() => {
    const posted = (project.posts || []).filter((p) => p.status === 'posted')
    const sum = (k) => posted.reduce((a, p) => a + (Number(p[k]) || 0), 0)
    return { posts: posted.length, saves: sum('saves'), shares: sum('shares'), views: sum('views') }
  }, [project.posts])

  const upd = (id, patch) => updateItem('posts', id, patch)

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Content</h1>
          <div className="desc">Edit any cell directly. Dated posts show up on the Calendar automatically.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn" onClick={addTen}>+ 10 rows</button>
          <button className="btn btn-leaf" onClick={addRow}><Icon.plus width={16} /> Add post</button>
        </div>
      </div>

      <div className="stats" style={{ marginBottom: 18 }}>
        <div className="stat"><div className="k">Posted</div><div className="v">{totals.posts}</div></div>
        <div className="stat"><div className="k">Saves</div><div className="v">{totals.saves.toLocaleString()}</div></div>
        <div className="stat"><div className="k">Shares</div><div className="v">{totals.shares.toLocaleString()}</div></div>
        <div className="stat"><div className="k">Views</div><div className="v">{totals.views.toLocaleString()}</div></div>
      </div>

      <div className="between wrap" style={{ marginBottom: 14, gap: 10 }}>
        <div className="seg">
          <button className={pf === 'all' ? 'on' : ''} onClick={() => setPf('all')}>All</button>
          {platforms.map((p) => <button key={p} className={pf === p ? 'on' : ''} onClick={() => setPf(p)}>{PLATFORM_LABEL[p]}</button>)}
        </div>
        <div className="seg">
          <button className={st === 'all' ? 'on' : ''} onClick={() => setSt('all')}>Any status</button>
          {POST_STATUS.map((s) => <button key={s} className={st === s ? 'on' : ''} onClick={() => setSt(s)}>{s}</button>)}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty"><h4>No posts here yet</h4><p>Add a post or drop in ten placeholder rows to plan the month.</p></div>
      ) : (
        <div className="card">
          <table className="table sheet fit">
            <colgroup>
              <col style={{ width: '10%' }} /><col style={{ width: '5%' }} /><col style={{ width: '19%' }} />
              <col style={{ width: '12%' }} /><col style={{ width: '9%' }} /><col style={{ width: '10%' }} />
              <col style={{ width: '6%' }} /><col style={{ width: '6%' }} /><col style={{ width: '6%' }} />
              <col style={{ width: '13%' }} /><col style={{ width: '4%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Date</th><th className="ctr">Day</th><th>Hook</th>
                <th>Category</th><th>Platforms</th><th>Status</th>
                <th className="ctr">Views</th><th className="ctr">Saves</th><th className="ctr">Shares</th><th>Notes</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cat = categoryById(categories, p.categoryId)
                return (
                  <tr key={p.id} style={cat ? { boxShadow: `inset 3px 0 0 ${cat.color}` } : undefined}>
                    <td><input type="date" className="cell" value={p.date} onChange={(e) => setDate(p.id, e.target.value)} /></td>
                    <td><input inputMode="numeric" className="cell num ctr" value={p.day ?? ''} placeholder="—" onChange={(e) => upd(p.id, { day: e.target.value.replace(/[^0-9]/g, '') === '' ? '' : Number(e.target.value.replace(/[^0-9]/g, '')) })} /></td>
                    <td><input className="cell" value={p.hook} placeholder="Untitled" onChange={(e) => upd(p.id, { hook: e.target.value })} /></td>
                    <td><CategorySelect className="cell" categories={categories} value={p.categoryId} onChange={(v) => upd(p.id, { categoryId: v })} /></td>
                    <td>
                      <div className="pf-toggles">
                        {platforms.map((x) => {
                          const on = (p.platforms || []).includes(x)
                          return <button key={x} className={`pf-chip ${on ? 'on' : ''}`} title={PLATFORM_LABEL[x]} onClick={() => togglePlatform(p, x)}>{PLATFORM_SHORT[x] || x.slice(0, 2).toUpperCase()}</button>
                        })}
                      </div>
                    </td>
                    <td>
                      <select className={`cell status-cell ${p.status}`} value={p.status} onChange={(e) => upd(p.id, { status: e.target.value })}>
                        {POST_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><input inputMode="numeric" className="cell num ctr" value={p.views} placeholder="—" onChange={(e) => upd(p.id, { views: e.target.value.replace(/[^0-9]/g, '') })} /></td>
                    <td><input inputMode="numeric" className="cell num ctr" value={p.saves} placeholder="—" onChange={(e) => upd(p.id, { saves: e.target.value.replace(/[^0-9]/g, '') })} /></td>
                    <td><input inputMode="numeric" className="cell num ctr" value={p.shares} placeholder="—" onChange={(e) => upd(p.id, { shares: e.target.value.replace(/[^0-9]/g, '') })} /></td>
                    <td><input className="cell" value={p.notes} placeholder="—" onChange={(e) => upd(p.id, { notes: e.target.value })} /></td>
                    <td><button className="icon-btn" onClick={() => removeItem('posts', p.id)} aria-label="Delete"><Icon.trash width={15} /></button></td>
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
