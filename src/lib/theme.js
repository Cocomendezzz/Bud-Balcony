import { tint, shade } from './color.js'
import { FONT_PAIRINGS, SURFACE_PRESETS } from '../store/defaults.js'

// Apply a project's theme by writing CSS custom properties on :root.
export function applyTheme(theme = {}) {
  const root = document.documentElement
  const accent = theme.accent || '#3e6b4f'
  const accent2 = theme.accent2 || '#bd6a37'

  root.style.setProperty('--leaf', accent)
  root.style.setProperty('--leaf-bright', tint(accent, 0.22))
  root.style.setProperty('--leaf-wash', tint(accent, 0.82))
  root.style.setProperty('--clay', accent2)
  root.style.setProperty('--clay-wash', tint(accent2, 0.82))

  const surf = SURFACE_PRESETS[theme.surface] || SURFACE_PRESETS.paper
  root.style.setProperty('--paper', surf.paper)
  root.style.setProperty('--paper-2', surf.paper2)
  root.style.setProperty('--surface', surf.surface)
  root.style.setProperty('--surface-2', surf.surface2)
  root.style.setProperty('--ink', surf.ink)
  root.style.setProperty('--ink-soft', surf.inkSoft)
  root.style.setProperty('--muted', surf.muted)
  root.style.setProperty('--line', surf.line)
  root.style.setProperty('--line-strong', surf.lineStrong)
  // keep leaf-wash readable on dark surfaces
  if (theme.surface === 'night') {
    root.style.setProperty('--leaf-wash', shade(accent, 0.55))
    root.style.setProperty('--clay-wash', shade(accent2, 0.55))
  }

  const pair = FONT_PAIRINGS[theme.font] || FONT_PAIRINGS.editorial
  root.style.setProperty('--serif', pair.serif)
  root.style.setProperty('--sans', pair.sans)

  root.style.setProperty('color-scheme', theme.surface === 'night' ? 'dark' : 'light')
}
