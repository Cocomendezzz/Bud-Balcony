// Rough predicted lifecycle by plant type, measured in days from germination (Day 1).
// These are estimates for a visual "how far along" read, not agronomic truth. Photoperiod
// timelines vary a lot outdoors since flowering is light-triggered; treat as a guide.

const TIMELINES = {
  autoflower: [
    { phase: 'germination', end: 7 },
    { phase: 'seedling', end: 21 },
    { phase: 'vegetative', end: 42 },
    { phase: 'flowering', end: 77 },
    { phase: 'harvest', end: 84 },
  ],
  photoperiod: [
    { phase: 'germination', end: 7 },
    { phase: 'seedling', end: 28 },
    { phase: 'vegetative', end: 84 },
    { phase: 'flowering', end: 140 },
    { phase: 'harvest', end: 150 },
  ],
}

export function lifecycle(type) {
  return TIMELINES[type] || TIMELINES.photoperiod
}

export function totalDays(type) {
  const tl = lifecycle(type)
  return tl[tl.length - 1].end
}

// Given type + current grow day, return predicted phase, overall progress 0..1,
// and progress within the current phase.
export function predictPhase(type, day) {
  const tl = lifecycle(type)
  const total = totalDays(type)
  if (day == null) return { phase: 'unknown', overall: 0, phaseProgress: 0, total, day: null }
  const clamped = Math.max(0, day)
  let phase = tl[tl.length - 1].phase
  let phaseStart = 0
  let phaseEnd = total
  for (let i = 0; i < tl.length; i++) {
    if (clamped <= tl[i].end) {
      phase = tl[i].phase
      phaseStart = i === 0 ? 0 : tl[i - 1].end
      phaseEnd = tl[i].end
      break
    }
  }
  const overall = Math.min(1, clamped / total)
  const phaseProgress = phaseEnd > phaseStart ? Math.min(1, Math.max(0, (clamped - phaseStart) / (phaseEnd - phaseStart))) : 1
  const done = day > total
  return { phase: done ? 'harvest' : phase, overall: done ? 1 : overall, phaseProgress: done ? 1 : phaseProgress, total, day }
}

// Order used to compare "actual logged stage" against predicted, for ahead/behind.
export const STAGE_ORDER = ['germination', 'seedling', 'vegetative', 'flowering', 'harvest', 'curing']
