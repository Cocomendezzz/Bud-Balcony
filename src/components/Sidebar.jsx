import { useStore } from '../store/ProjectContext.jsx'
import { Icon } from './Icons.jsx'
import ProjectSwitcher from './ProjectSwitcher.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'grow', label: 'Grow Log', icon: 'sprout', grow: true },
  { id: 'plants', label: 'Plants', icon: 'leaf', grow: true },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'content', label: 'Content', icon: 'film' },
  { id: 'ideas', label: 'Ideas', icon: 'bulb' },
  { id: 'stories', label: 'Stories', icon: 'stories' },
  { id: 'milestones', label: 'Milestones', icon: 'flag', grow: true },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

export default function Sidebar({ view, setView, open, onClose }) {
  const { project } = useStore()
  const growOn = project?.settings?.modules?.grow !== false

  const items = NAV.filter((n) => !n.grow || growOn)

  return (
    <>
      <div className={`scrim ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="mark">Bud Balcony</div>
          <div className="sub">Seed to Smoke</div>
        </div>

        <nav className="nav">
          {items.map((n) => {
            const Ico = Icon[n.icon]
            return (
              <button key={n.id} className={`nav-item ${view === n.id ? 'active' : ''}`}
                onClick={() => { setView(n.id); onClose?.() }}>
                <span className="nav-ico"><Ico /></span>
                {n.label}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <ProjectSwitcher />
        </div>
      </aside>
    </>
  )
}
