import { useState, useEffect } from 'react'
import { useStore } from './store/ProjectContext.jsx'
import Sidebar from './components/Sidebar.jsx'
import { Icon } from './components/Icons.jsx'
import Dashboard from './views/Dashboard.jsx'
import GrowLog from './views/GrowLog.jsx'
import Plants from './views/Plants.jsx'
import Calendar from './views/Calendar.jsx'
import Content from './views/Content.jsx'
import Ideas from './views/Ideas.jsx'
import Stories from './views/Stories.jsx'
import Milestones from './views/Milestones.jsx'
import Settings from './views/Settings.jsx'

const GROW_VIEWS = ['grow', 'plants', 'milestones']

export default function App() {
  const { project } = useStore()
  const [view, setView] = useState('dashboard')
  const [navOpen, setNavOpen] = useState(false)
  const growOn = project?.settings?.modules?.grow !== false

  // If grow module is off, never sit on a grow-only view.
  useEffect(() => {
    if (!growOn && GROW_VIEWS.includes(view)) setView('dashboard')
  }, [growOn, view])

  const render = () => {
    switch (view) {
      case 'dashboard': return <Dashboard setView={setView} />
      case 'grow': return <GrowLog />
      case 'plants': return <Plants />
      case 'calendar': return <Calendar />
      case 'content': return <Content />
      case 'ideas': return <Ideas />
      case 'stories': return <Stories />
      case 'milestones': return <Milestones />
      case 'settings': return <Settings />
      default: return <Dashboard setView={setView} />
    }
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="main">
        <div className="mobile-bar">
          <button className="icon-btn" onClick={() => setNavOpen(true)} aria-label="Open menu"><Icon.menu /></button>
          <span className="mark">Bud Balcony</span>
        </div>
        <div className="content">{render()}</div>
      </div>
    </div>
  )
}
