// Local persistence. No server, no accounts. Portability is via JSON export/import.
const KEY = 'budbalcony.v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    return JSON.parse(raw)
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

// Export a single project to a downloadable .json file.
export function exportProject(project) {
  const payload = {
    kind: 'budbalcony-project',
    schemaVersion: project.schemaVersion || 1,
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

// Parse an imported file. Accepts either a wrapped export or a raw project.
export function parseImported(text) {
  const data = JSON.parse(text)
  if (data && data.kind === 'budbalcony-project' && data.project) return data.project
  if (data && data.id && data.name && Array.isArray(data.plants)) return data
  throw new Error('This file does not look like a Bud Balcony project.')
}
