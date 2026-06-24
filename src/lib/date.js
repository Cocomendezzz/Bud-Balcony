// All dates stored as YYYY-MM-DD strings (local, no timezone drift).

export function todayISO() {
  return toISO(new Date())
}

export function toISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(s) {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Day 1 = germination date. Returns null if no germ date set.
export function growDay(germISO, onISO = todayISO()) {
  if (!germISO) return null
  const a = fromISO(germISO)
  const b = fromISO(onISO)
  const diff = Math.round((b - a) / 86400000)
  return diff + 1 // germ date itself is Day 1
}

export function daysBetween(aISO, bISO) {
  if (!aISO || !bISO) return null
  return Math.round((fromISO(bISO) - fromISO(aISO)) / 86400000)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function fmtShort(iso) {
  const d = fromISO(iso)
  if (!d) return ''
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function fmtLong(iso) {
  const d = fromISO(iso)
  if (!d) return ''
  return `${DOW[d.getDay()]}, ${MONTHS_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

export function monthLabel(year, monthIdx) {
  return `${MONTHS_LONG[monthIdx]} ${year}`
}

// Build a 6-row month grid (array of {iso, inMonth, dow}) starting Sunday.
export function monthGrid(year, monthIdx) {
  const first = new Date(year, monthIdx, 1)
  const startDow = first.getDay()
  const start = new Date(year, monthIdx, 1 - startDow)
  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    cells.push({ iso: toISO(d), inMonth: d.getMonth() === monthIdx, dow: d.getDay(), day: d.getDate() })
  }
  return cells
}

export { DOW, MONTHS_LONG }
