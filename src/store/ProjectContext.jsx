import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { loadState, saveState } from './storage.js'
import { blankProject, seedBudBalcony, SCHEMA_VERSION } from './defaults.js'
import { uid } from '../lib/id.js'

const ProjectContext = createContext(null)

function initialState() {
  const saved = loadState()
  if (saved && Array.isArray(saved.projects) && saved.projects.length) {
    return saved
  }
  const seed = seedBudBalcony()
  return { projects: [seed], activeId: seed.id }
}

export function ProjectProvider({ children }) {
  const [state, setState] = useState(initialState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const project = useMemo(
    () => state.projects.find((p) => p.id === state.activeId) || state.projects[0] || null,
    [state]
  )

  const setActive = useCallback((id) => {
    setState((s) => ({ ...s, activeId: id }))
  }, [])

  const createProject = useCallback((name, { seed = false } = {}) => {
    const p = seed ? seedBudBalcony() : blankProject(name || 'New Project')
    if (!seed && name) p.name = name
    setState((s) => ({ projects: [...s.projects, p], activeId: p.id }))
    return p.id
  }, [])

  const renameProject = useCallback((id, name) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === id ? { ...p, name } : p)),
    }))
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
      const nameTaken = s.projects.some((p) => p.name === copy.name)
      if (nameTaken) copy.name = `${copy.name} (imported)`
      return { projects: [...s.projects, copy], activeId: copy.id }
    })
    return copy.id
  }, [])

  // Apply an updater to the active project and persist.
  const update = useCallback((updater) => {
    setState((s) => ({
      ...s,
      projects: s.projects.map((p) => (p.id === s.activeId ? updater(p) : p)),
    }))
  }, [])

  // Generic collection helpers operating on the active project.
  const addItem = useCallback((collection, item) => {
    update((p) => ({ ...p, [collection]: [...(p[collection] || []), item] }))
  }, [update])

  const updateItem = useCallback((collection, id, patch) => {
    update((p) => ({
      ...p,
      [collection]: (p[collection] || []).map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }))
  }, [update])

  const removeItem = useCallback((collection, id) => {
    update((p) => ({ ...p, [collection]: (p[collection] || []).filter((it) => it.id !== id) }))
  }, [update])

  const setSettings = useCallback((patch) => {
    update((p) => ({ ...p, settings: { ...p.settings, ...patch } }))
  }, [update])

  const value = {
    projects: state.projects,
    activeId: state.activeId,
    project,
    setActive,
    createProject,
    renameProject,
    deleteProject,
    duplicateProject,
    importProject,
    update,
    addItem,
    updateItem,
    removeItem,
    setSettings,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

export function useStore() {
  const ctx = useContext(ProjectContext)
  if (!ctx) throw new Error('useStore must be used inside ProjectProvider')
  return ctx
}
