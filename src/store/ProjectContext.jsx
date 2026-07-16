import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loadState, saveState } from './storage.js'
import { blankProject, seedBudBalcony, SCHEMA_VERSION } from './defaults.js'
import { uid } from '../lib/id.js'

const ProjectContext = createContext(null)

function initialState() {
  const saved = loadState()
  if (saved && Array.isArray(saved.projects) && saved.projects.length) return saved
  const seed = seedBudBalcony()
  return { projects: [seed], activeId: seed.id }
}

export function ProjectProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => { saveState(state) }, [state])

  const project = useMemo(
    () => state.projects.find((p) => p.id === state.activeId) || state.projects[0] || null,
    [state]
  )

  const setActive = useCallback((id) => setState((s) => ({ ...s, activeId: id })), [])

  const createProject = useCallback((name, { seed = false } = {}) => {
    const p = seed ? seedBudBalcony() : blankProject(name || 'New Project')
    if (!seed && name) p.name = name
    setState((s) => ({ projects: [...s.projects, p], activeId: p.id }))
    return p.id
  }, [])

  const renameProject = useCallback((id, name) => {
    setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)) }))
  }, [])

  const deleteProject = useCallback((id) => {
    setState((s) => {
      const remaining = s.projects.filter((p) => p.id !== id)
      const list = remaining.length ? remaining : [seedBudBalcony()]
      const activeId = s.activeId === id ? list[0].id : s.activeId
      return { projects: list, activeId }
    })
  }, [])

  const duplicateProject = useCallback((id) => {
    setState((s) => {
      const src = s.projects.find((p) => p.id === id)
      if (!src) return s
      const copy = { ...structuredClone(src), id: uid('p_'), name: `${src.name} copy`, createdAt: new Date().toISOString() }
      return { projects: [...s.projects, copy], activeId: copy.id }
    })
  }, [])

  const importProject = useCallback((incoming) => {
    const copy = { ...structuredClone(incoming), id: uid('p_'), schemaVersion: SCHEMA_VERSION }
    setState((s) => {
      if (s.projects.some((p) => p.name === copy.name)) copy.name = `${copy.name} (imported)`
      return { projects: [...s.projects, copy], activeId: copy.id }
    })
    return copy.id
  }, [])

  const update = useCallback((updater) => {
    setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === s.activeId ? updater(p) : p)) }))
  }, [])

  const addItem = useCallback((collection, item, { prepend = false } = {}) => {
    update((p) => ({ ...p, [collection]: prepend ? [item, ...(p[collection] || [])] : [...(p[collection] || []), item] }))
  }, [update])

  const bulkAdd = useCallback((collection, items, { prepend = false } = {}) => {
    update((p) => ({ ...p, [collection]: prepend ? [...items, ...(p[collection] || [])] : [...(p[collection] || []), ...items] }))
  }, [update])

  const updateItem = useCallback((collection, id, patch) => {
    update((p) => ({ ...p, [collection]: (p[collection] || []).map((it) => (it.id === id ? { ...it, ...patch } : it)) }))
  }, [update])

  const removeItem = useCallback((collection, id) => {
    update((p) => ({ ...p, [collection]: (p[collection] || []).filter((it) => it.id !== id) }))
  }, [update])

  // Move item `fromId` to the position of `beforeId` (or end if null), optionally patching it.
  const reorderCollection = useCallback((collection, fromId, beforeId, patch = {}) => {
    update((p) => {
      const list = [...(p[collection] || [])]
      const fromIdx = list.findIndex((x) => x.id === fromId)
      if (fromIdx < 0) return p
      let [moved] = list.splice(fromIdx, 1)
      moved = { ...moved, ...patch }
      if (beforeId == null) {
        list.push(moved)
      } else {
        const beforeIdx = list.findIndex((x) => x.id === beforeId)
        if (beforeIdx < 0) list.push(moved)
        else list.splice(beforeIdx, 0, moved)
      }
      return { ...p, [collection]: list }
    })
  }, [update])

  const setSettings = useCallback((patch) => {
    update((p) => ({ ...p, settings: { ...p.settings, ...patch } }))
  }, [update])

  const setTheme = useCallback((patch) => {
    update((p) => ({ ...p, settings: { ...p.settings, theme: { ...p.settings.theme, ...patch } } }))
  }, [update])

  // Category helpers
  const addCategory = useCallback((label, color) => {
    update((p) => ({ ...p, settings: { ...p.settings, categories: [...(p.settings.categories || []), { id: uid('cat_'), label, color }] } }))
  }, [update])
  const updateCategory = useCallback((id, patch) => {
    update((p) => ({ ...p, settings: { ...p.settings, categories: p.settings.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) } }))
  }, [update])
  const removeCategory = useCallback((id) => {
    update((p) => ({ ...p, settings: { ...p.settings, categories: p.settings.categories.filter((c) => c.id !== id) } }))
  }, [update])

  // Idea column helpers
  const addIdeaColumn = useCallback((label) => {
    update((p) => ({ ...p, settings: { ...p.settings, ideaColumns: [...(p.settings.ideaColumns || []), { id: uid('col_'), label }] } }))
  }, [update])
  const updateIdeaColumn = useCallback((id, patch) => {
    update((p) => ({ ...p, settings: { ...p.settings, ideaColumns: p.settings.ideaColumns.map((c) => (c.id === id ? { ...c, ...patch } : c)) } }))
  }, [update])
  const removeIdeaColumn = useCallback((id, fallbackId) => {
    update((p) => ({
      ...p,
      settings: { ...p.settings, ideaColumns: p.settings.ideaColumns.filter((c) => c.id !== id) },
      ideas: (p.ideas || []).map((i) => (i.columnId === id ? { ...i, columnId: fallbackId } : i)),
    }))
  }, [update])

  const value = {
    projects: state.projects, activeId: state.activeId, project,
    setActive, createProject, renameProject, deleteProject, duplicateProject, importProject,
    update, addItem, bulkAdd, updateItem, removeItem, reorderCollection,
    setSettings, setTheme,
    addCategory, updateCategory, removeCategory,
    addIdeaColumn, updateIdeaColumn, removeIdeaColumn,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useStore() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useStore must be used inside ProjectProvider')
  return ctx
}
