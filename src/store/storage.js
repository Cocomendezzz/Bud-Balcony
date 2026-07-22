// Local persistence. No server, no accounts. Portability is via JSON export/import.
import { SCHEMA_VERSION, defaultCategories, defaultIdeaColumns, defaultTheme, strainInfoFor } from './defaults.js'
import { growDay } from '../lib/date.js'

const KEY = 'budbalcony.v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const state = JSON.parse(raw)
    if (state && Array.isArray(state.projects)) {
      state.projects = state.projects.map(migrateProject)
    }
    return state
  } catch (e) {
    console.error('Failed to load saved data:', e)
    return null
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch (e) {
    console.error('Failed to save data:', e)
    return false
  }
}

// Upgrade older projects to the current schema without losing data.
export function migrateProject(p) {
  if (!p || typeof p !== 'object') return p
  const s = p.settings || {}

  // Settings additions
  if (!s.categories) s.categories = defaultCategories()
  if (!s.ideaColumns) s.ideaColumns = defaultIdeaColumns()
  if (!s.theme) s.theme = defaultTheme()
  delete s.tagline
  p.settings = s

  // Collections that may not exist on v1
  if (!Array.isArray(p.equipment)) p.equipment = []
  if (!Array.isArray(p.shoots)) p.shoots = []

  // Plants: merge name/strain -> strain, add growType/color/info, drop soil/pot/notes
  if (Array.isArray(p.plants)) {
    p.plants = p.plants.map((pl) => {
      if (pl.strain && pl.growType && pl.info) return { ...pl, germinationDate: pl.germinationDate || '' } // already v2/v3
      const strain = pl.strain || pl.name || 'Unknown'
      const growType = pl.growType || pl.type || 'photoperiod'
      const color = pl.color || '#3e6b4f'
      const { soil, pot, notes, name, type, ...rest } = pl
      return { ...rest, strain, growType, color, germinationDate: pl.germinationDate || '', info: pl.info || strainInfoFor(strain), infoManual: pl.infoManual || false }
    })
  }

  // Ideas: status -> columnId, add categoryId/gear/script
  if (Array.isArray(p.ideas)) {
    const map = { backlog: 'col_vault', planned: 'col_planned', posted: 'col_posted' }
    p.ideas = p.ideas.map((i) => ({
      ...i,
      columnId: i.columnId || map[i.status] || 'col_vault',
      categoryId: i.categoryId || null,
      gear: i.gear || '',
      script: i.script || '',
    }))
  }

  // Posts, calendar: ensure categoryId + notes field exist
  if (Array.isArray(p.posts)) p.posts = p.posts.map((x) => ({ ...x, categoryId: x.categoryId ?? null, notes: x.notes ?? '' }))
  if (Array.isArray(p.calendar)) p.calendar = p.calendar.map((x) => ({ ...x, categoryId: x.categoryId ?? null }))

  // v3: single platform -> platforms array on posts + calendar; editable day numbers on posts + stories
  const germ = s.germinationDate || null
  const toArr = (x) => {
    if (Array.isArray(x.platforms)) return x.platforms
    if (x.platform) return [x.platform]
    return []
  }
  if (Array.isArray(p.posts)) {
    p.posts = p.posts.map((x) => {
      const { platform, ...rest } = x
      return { ...rest, platforms: toArr(x), day: x.day ?? (growDay(germ, x.date) ?? '') }
    })
  }
  if (Array.isArray(p.calendar)) {
    p.calendar = p.calendar.map((x) => {
      const { platform, ...rest } = x
      return { ...rest, platforms: toArr(x) }
    })
  }
  if (Array.isArray(p.stories)) {
    p.stories = p.stories.map((x) => ({ ...x, day: x.day ?? (growDay(germ, x.date) ?? '') }))
  }

  p.schemaVersion = SCHEMA_VERSION
  return p
}

export function exportProject(project) {
  const payload = {
    kind: 'budbalcony-project',
    schemaVersion: project.schemaVersion || SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    project,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safe = (project.name || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  a.href = url
  a.download = `${safe || 'project'}.budbalcony.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function parseImported(text) {
  const data = JSON.parse(text)
  if (data && data.kind === 'budbalcony-project' && data.project) return migrateProject(data.project)
  if (data && data.id && data.name && Array.isArray(data.plants)) return migrateProject(data)
  throw new Error('This file does not look like a Bud Balcony project.')
}
