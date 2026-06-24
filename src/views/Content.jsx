import { useState, useMemo } from 'react'
import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from '../components/Icons.jsx'
import { Modal, Field } from '../components/Modal.jsx'
import { POST_STATUS, PLATFORM_LABEL } from '../store/defaults.js'
import { todayISO, fmtShort, growDay } from '../lib/date.js'
import { uid } from '../lib/id.js'

const PLATFORM_DOT = { instagram: '#bd6a37', tiktok: '#1b201a', youtube: '#a8453a' }

export default function Content() {
  const { project, addItem, updateItem, removeItem } = useStore()
  const platforms = project.settings.platforms || []
  const germ = project.settings.germinationDate

  const [editing, setEditing] = useState(null)
  const [pf, setPf] = useState('all')
  const [st, setSt] = useState('all')

  const blank = () => ({ date: todayISO(), platform: platforms[0] || 'instagram', hook: '', covered: '', status: 'idea', url: '', views: '', likes: '', saves: '', shares: '', comments: '' })
  const [form, setForm] = useState(blank())

  const open = (post) => { if (post) { setForm({ ...post }); setEditing(post) } else { setForm(blank()); setEditing('new') } }
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const numOrEmpty = (v) => (v === '' || v == null ? '' : Number(v))
  const save = () => {
    if (!form.hook.trim()) return
    const payload = { ...form, views: numOrEmpty(form.views), likes: numOrEmpty(form.likes), saves: numOrEmpty(form.saves), shares: numOrEmpty(form.shares), comments: numOrEmpty(form.comments) }
    if (editing === 'new') addItem('posts', { ...payload, id: uid('po_') })
    else updateItem('posts', editing.id, payload)
    setEditing(null)
  }

  const rows = useMemo(() => {
    let list = [...(project.posts || [])]
    if (pf !== 'all') list = list.filter((p) => p.platform === pf)
    if (st !== 'all') list = list.filter((p) => p.status === st)
    return list.sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [project.posts, pf, st])

  // Totals across posted content. Saves + shares first, per the playbook.
  const totals = useMemo(() => {
    const posted = (project.posts || []).filter((p) => p.status === 'posted')
    const sum = (k) => posted.reduce((a, p) => a + (Number(p[k]) || 0), 0)
    return { posts: posted.length, saves: sum('saves'), shares: sum('shares'), views: sum('views') }
  }, [project.posts])

  const fmtN = (n) => (n === '' || n == null ? '—' : Number(n).toLocaleString())

  return (
    <div>
      <div className="page-head between">
        <div>
          <h1>Content</h1>
          <div className="desc">Every post, with the numbers that actually grow an account: saves and shares.</div>
        </div>
        <button className="btn btn-leaf" onClick={() => open(null)}><Icon.plus width={16} /> Add post</button>
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
        <div className="empty"><h4>No posts here yet</h4><p>Log content as ideas, then move them through filmed, editing, scheduled, posted.</p></div>
      ) : (
        <div className="card table-scroll">
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Day</th><th>Hook</th><th>Platform</th><th>Status</th><th>Views</th><th>Saves</th><th>Shares</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const d = growDay(germ, p.date)
                return (
                  <tr key={p.id}>
                    <td className="num">{fmtShort(p.date)}</td>
                    <td className="num">{d ? `D${d}` : '—'}</td>
                    <td style={{ maxWidth: 300 }}>
                      <div style={{ fontWeight: 500 }}>{p.hook}</div>
                      {p.covered && <div className="meta" style={{ fontSize: 12, color: 'var(--muted)' }}>{p.covered}</div>}
                    </td>
                    <td><span className="row" style={{ alignItems: 'center', gap: 7 }}><span className="dot" style={{ background: PLATFORM_DOT[p.platform] }} />{PLATFORM_LABEL[p.platform]}</span></td>
                    <td><span className={`status ${p.status}`}>{p.status}</span></td>
                    <td className="num">{fmtN(p.views)}</td>
                    <td className="num">{fmtN(p.saves)}</td>
                    <td className="num">{fmtN(p.shares)}</td>
                    <td><span className="row" style={{ gap: 2 }}>
                      <button className="icon-btn" onClick={() => open(p)} aria-label="Edit"><Icon.edit width={15} /></button>
                      <button className="icon-btn" onClick={() => removeItem('posts', p.id)} aria-label="Delete"><Icon.trash width={15} /></button>
                    </span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add post' : 'Edit post'} onClose={() => setEditing(null)} wide
          footer={<>
            <button className="btn" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-leaf" onClick={save}>Save post</button>
          </>}>
          <div className="form-grid">
            <Field label="Date"><input type="date" className="input" value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
            <Field label="Platform">
              <select className="select" value={form.platform} onChange={(e) => set('platform', e.target.value)}>
                {platforms.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}
              </select>
            </Field>
            <div className="full"><Field label="Hook"><input className="input" autoFocus value={form.hook} onChange={(e) => set('hook', e.target.value)} placeholder="Day 8: Is that a sprout?" /></Field></div>
            <div className="full"><Field label="What's covered"><input className="input" value={form.covered} onChange={(e) => set('covered', e.target.value)} placeholder="Zoom in on sprouts, compare strains" /></Field></div>
            <Field label="Status">
              <select className="select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {POST_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Link (optional)"><input className="input" value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://" /></Field>
            <Field label="Views"><input type="number" className="input" value={form.views} onChange={(e) => set('views', e.target.value)} /></Field>
            <Field label="Likes"><input type="number" className="input" value={form.likes} onChange={(e) => set('likes', e.target.value)} /></Field>
            <Field label="Saves"><input type="number" className="input" value={form.saves} onChange={(e) => set('saves', e.target.value)} /></Field>
            <Field label="Shares"><input type="number" className="input" value={form.shares} onChange={(e) => set('shares', e.target.value)} /></Field>
            <Field label="Comments"><input type="number" className="input" value={form.comments} onChange={(e) => set('comments', e.target.value)} /></Field>
          </div>
        </Modal>
      )}
    </div>
  )
}
