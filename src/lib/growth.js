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

// Progress bands per stage as a fraction of the whole seed-to-smoke lifecycle.
// Generic (not tied to plant type) so the wheel only depends on the logged stage
// plus, optionally, day count for sub-position within the current stage.
const STAGE_BANDS = {
  germination: [0.0, 0.08],
  seedling: [0.08, 0.25],
  vegetative: [0.25, 0.55],
  flowering: [0.55, 0.9],
  harvest: [0.9, 0.98],
  curing: [0.98, 1.0],
}

// Drive the wheel from the latest grow-log stage. growDay (from the plant's official
// start date) only nudges position WITHIN the logged stage's band; it can never push
// the wheel past the stage you've actually logged.
export function progressFromLog(stage, growDay) {
  if (!stage) return { phase: null, overall: 0, hasStage: false }
  const band = STAGE_BANDS[stage] || [0, 0]
  const [lo, hi] = band
  let overall
  if (growDay == null) {
    overall = (lo + hi) / 2
  } else {
    const frac = Math.max(0, Math.min(1, growDay / 100)) // nominal 100-day cycle
    overall = Math.max(lo, Math.min(hi, frac))
  }
  return { phase: stage, overall, hasStage: true }
}
