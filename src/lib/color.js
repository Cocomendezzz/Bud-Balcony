// Deterministic accent colors so each plant/strain reads consistently.
const PALETTE = ['#3e6b4f', '#bd6a37', '#6e7f8c', '#8a7a4a', '#7a5c8c', '#4f7a6b', '#a85a52', '#5a6b8a']

export function colorFor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
