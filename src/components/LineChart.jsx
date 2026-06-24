// Minimal responsive line chart. No deps. Expects [{x: label, y: number}].
export default function LineChart({ series = [], height = 160, color = 'var(--leaf)' }) {
  if (series.length < 2) {
    return <div className="empty" style={{ padding: 28 }}>Log at least two follower counts to see the trend.</div>
  }
  const W = 600
  const H = height
  const padX = 8
  const padY = 16
  const ys = series.map((s) => s.y)
  const min = Math.min(...ys)
  const max = Math.max(...ys)
  const range = max - min || 1
  const stepX = (W - padX * 2) / (series.length - 1)

  const pts = series.map((s, i) => {
    const x = padX + i * stepX
    const y = padY + (H - padY * 2) * (1 - (s.y - min) / range)
    return [x, y]
  })

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L${pts[pts.length - 1][0].toFixed(1)},${H - padY} L${pts[0][0].toFixed(1)},${H - padY} Z`

  return (
    <svg className="chart-wrap" viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" role="img" aria-label="Follower growth">
      <defs>
        <linearGradient id="fillGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.16" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#fillGrad)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="2.6" fill="var(--surface)" stroke={color} strokeWidth="1.6" />
      ))}
    </svg>
  )
}
