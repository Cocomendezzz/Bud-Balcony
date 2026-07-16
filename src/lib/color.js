// Deterministic accent colors so each plant/strain reads consistently.
const PALETTE = ['#3e6b4f', '#bd6a37', '#6e7f8c', '#8a7a4a', '#7a5c8c', '#4f7a6b', '#a85a52', '#5a6b8a']

export function colorFor(seed = '') {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

export const SWATCHES = ['#3e6b4f', '#5a8a64', '#bd6a37', '#c99a3f', '#6e8ca0', '#4f7a6b', '#7a5c8c', '#a85a52', '#5a6b8a', '#8a7a4a', '#b0656f', '#4a7c86']

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// --- hex helpers for theming ---
function toRgb(hex) {
  const h = (hex || '#000000').replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)]
}
function toHex([r, g, b]) {
  return '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')).join('')
}
// mix color with white (amt 0..1 toward white)
export function tint(hex, amt) {
  const [r, g, b] = toRgb(hex)
  return toHex([r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt])
}
// mix color with black (amt 0..1 toward black)
export function shade(hex, amt) {
  const [r, g, b] = toRgb(hex)
  return toHex([r * (1 - amt), g * (1 - amt), b * (1 - amt)])
}
// readable text color (black/white) for a given background
export function readableOn(hex) {
  const [r, g, b] = toRgb(hex)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.6 ? '#1b201a' : '#fbfaf5'
}
