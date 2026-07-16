import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { POST_STATUS, PLATFORM_LABEL } from '../store/defaults.js'
import { CategorySelect, categoryById } from '../components/Category.jsx'
import { todayISO, fmtShort, growDay } from '../lib/date.js'
import { tint } from '../lib/color.js'
import { uid } from '../lib/id.js'

export default function Content() {
  const { project, addItem, bulkAdd, updateItem, removeItem } = useStore()
  const platforms = project.settings.platforms || []
  const categories = project.settings.categories || []
  const germ = project.settings.germinationDate

  const [pf, setPf] = useState('all')
  const [st, setSt] = useState('all')

  const newRow = () => ({ id: uid('po_'), date: todayISO(), platform: platforms[0] || 'instagram', hook: '', covered: '', categoryId: null, status: 'idea', url: '', views: '', likes: '', saves: '', shares: '', comments: '', notes: '' })
  const addRow = () => addItem('posts', newRow(), { prepend: true })
  const addTen = () => bulkAdd('posts', Array.from({ length: 10 }, () => ({ ...newRow(), hook: '' })), { prepend: true })

  const rows = useMemo(() => {
    let list = [...(project.posts || [])]
    if (pf !== 'all') list = list.filter((p) => p.platform === pf)
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
          <div className="desc">Edit any cell directly, like a spreadsheet. Plan ahead with placeholder rows.</div>
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
        <div className="card table-scroll">
          <table className="table sheet">
            <thead>
              <tr>
                <th style={{ minWidth: 130 }}>Date</th><th>Day</th><th style={{ minWidth: 200 }}>Hook</th>
                <th style={{ minWidth: 130 }}>Category</th><th style={{ minWidth: 120 }}>Platform</th><th style={{ minWidth: 120 }}>Status</th>
                <th>Views</th><th>Saves</th><th>Shares</th><th style={{ minWidth: 180 }}>Notes</th><th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const d = growDay(germ, p.date)
                const cat = categoryById(categories, p.categoryId)
                return (
                  <tr key={p.id} style={cat ? { boxShadow: `inset 3px 0 0 ${cat.color}` } : undefined}>
                    <td><input type="date" className="cell" value={p.date} onChange={(e) => upd(p.id, { date: e.target.value })} /></td>
                    <td className="num">{d ? `D${d}` : '—'}</td>
                    <td><input className="cell" value={p.hook} placeholder="Untitled" onChange={(e) => upd(p.id, { hook: e.target.value })} /></td>
                    <td><CategorySelect className="cell" categories={categories} value={p.categoryId} onChange={(v) => upd(p.id, { categoryId: v })} /></td>
                    <td>
                      <select className="cell" value={p.platform} onChange={(e) => upd(p.id, { platform: e.target.value })}>
                        {platforms.map((x) => <option key={x} value={x}>{PLATFORM_LABEL[x]}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className={`cell status-cell ${p.status}`} value={p.status} onChange={(e) => upd(p.id, { status: e.target.value })}>
                        {POST_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><input type="number" className="cell num" value={p.views} onChange={(e) => upd(p.id, { views: e.target.value })} /></td>
                    <td><input type="number" className="cell num" value={p.saves} onChange={(e) => upd(p.id, { saves: e.target.value })} /></td>
                    <td><input type="number" className="cell num" value={p.shares} onChange={(e) => upd(p.id, { shares: e.target.value })} /></td>
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
