import { tint, readableOn } from '../lib/color.js'

export function categoryById(categories = [], id) {
  return categories.find((c) => c.id === id) || null
}

export function CategoryDot({ color, size = 9 }) {
  return <span className="dot" style={{ background: color, width: size, height: size }} />
}

export function CategoryChip({ category }) {
  if (!category) return <span className="chip" style={{ padding: '2px 8px', opacity: 0.7 }}>Uncategorized</span>
  return (
    <span className="chip" style={{ padding: '2px 8px', background: tint(category.color, 0.82), borderColor: tint(category.color, 0.55), color: category.color }}>
      {category.label}
    </span>
  )
}

// Inline category selector used in tables and modals.
export function CategorySelect({ categories = [], value, onChange, allowNone = true, className = 'select' }) {
  return (
    <select className={className} value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      {allowNone && <option value="">Uncategorized</option>}
      {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
    </select>
  )
}
