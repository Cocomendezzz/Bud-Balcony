import { uid } from '../lib/id.js'
import { lookupStrain } from '../lib/strains.js'

export const SCHEMA_VERSION = 2
export const PLATFORMS = ['instagram', 'tiktok', 'youtube']
export const PLATFORM_LABEL = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YT Shorts' }

export const POST_STATUS = ['idea', 'filmed', 'editing', 'scheduled', 'posted']
export const PRIORITIES = ['low', 'medium', 'high']
export const GROW_STAGES = ['germination', 'seedling', 'vegetative', 'flowering', 'harvest', 'curing']

// Content categories are shared across Calendar, Content, Ideas, and the dashboard week.
// Fully editable in Settings.
export function defaultCategories() {
  return [
    { id: 'cat_update', label: 'Weed Update', color: '#3e6b4f' },
    { id: 'cat_passive', label: 'Passive Reel', color: '#6e8ca0' },
    { id: 'cat_recap', label: 'Recap', color: '#bd6a37' },
    { id: 'cat_edu', label: 'Educational', color: '#7a5c8c' },
    { id: 'cat_other', label: 'Other', color: '#8a8d80' },
  ]
}

// Idea board columns, editable in the Ideas tab.
export function defaultIdeaColumns() {
  return [
    { id: 'col_vault', label: 'Vault' },
    { id: 'col_planned', label: 'Planned / Edited' },
    { id: 'col_posted', label: 'Posted' },
  ]
}

export function defaultTheme() {
  return { accent: '#3e6b4f', accent2: '#bd6a37', surface: 'paper', font: 'editorial' }
}

// Font pairings map to families loaded in index.html.
export const FONT_PAIRINGS = {
  editorial: { label: 'Editorial', serif: "'Fraunces', Georgia, serif", sans: "'Inter', system-ui, sans-serif" },
  modern: { label: 'Modern', serif: "'Space Grotesk', system-ui, sans-serif", sans: "'Inter', system-ui, sans-serif" },
  classic: { label: 'Classic', serif: "'Newsreader', Georgia, serif", sans: "'Newsreader', Georgia, serif" },
}

// Background/surface presets (includes a dark option).
export const SURFACE_PRESETS = {
  paper:  { label: 'Paper',  paper: '#f3efe6', paper2: '#ece7da', surface: '#fbfaf5', surface2: '#f6f3ea', ink: '#1b201a', inkSoft: '#4c5347', muted: '#8b8d80', line: '#e1dccf', lineStrong: '#d2ccba' },
  bone:   { label: 'Bone',   paper: '#efece4', paper2: '#e6e2d6', surface: '#faf9f4', surface2: '#f2efe7', ink: '#22251f', inkSoft: '#50554a', muted: '#8d8f82', line: '#e0dccf', lineStrong: '#cfcaba' },
  mist:   { label: 'Mist',   paper: '#eceef0', paper2: '#e2e5e8', surface: '#fafbfc', surface2: '#f1f3f5', ink: '#1c2226', inkSoft: '#495159', muted: '#868d94', line: '#dde1e5', lineStrong: '#cbd0d6' },
  night:  { label: 'Night',  paper: '#1b201b', paper2: '#161a16', surface: '#232823', surface2: '#1e231e', ink: '#eef0e9', inkSoft: '#bcc1b4', muted: '#8b9384', line: '#333a32', lineStrong: '#434b41' },
}

// Build the info snapshot stored on a plant from the strain database.
export function strainInfoFor(strain) {
  const s = lookupStrain(strain)
  if (!s) return { type: '', thc: '', effects: [], flavors: [], lineage: '', blurb: '', source: 'manual' }
  return { type: s.type, lean: s.lean, thc: s.thc, effects: s.effects, flavors: s.flavors, lineage: s.lineage, blurb: s.blurb, source: 'db' }
}

export function makePlant(strain, growType = 'photoperiod', color) {
  return { id: uid('pl_'), strain, growType, color: color || '#3e6b4f', info: strainInfoFor(strain), infoManual: false }
}

export function blankProject(name = 'New Project') {
  return {
    id: uid('p_'),
    name,
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    settings: {
      seriesTitle: 'Seed to Smoke',
      germinationDate: null,
      heightUnit: 'cm',
      platforms: [...PLATFORMS],
      modules: { grow: true },
      categories: defaultCategories(),
      ideaColumns: defaultIdeaColumns(),
      theme: defaultTheme(),
    },
    plants: [],
    growLog: [],
    posts: [],
    ideas: [],
    stories: [],
    milestones: [],
    calendar: [],
    followers: [],
    equipment: [],
    shoots: [],
  }
}

export function seedBudBalcony() {
  const p = blankProject('Bud Balcony')
  p.settings.seriesTitle = 'Seed to Smoke'
  p.settings.germinationDate = '2026-05-13'

  const green = '#3e6b4f', clay = '#bd6a37', blue = '#6e8ca0', plum = '#7a5c8c', teal = '#4f7a6b'
  p.plants = [
    makePlant('White Widow', 'autoflower', clay),
    makePlant('Apple Fritter', 'autoflower', green),
    makePlant('Northern Lights A', 'photoperiod', blue),
    makePlant('Northern Lights B', 'photoperiod', teal),
    makePlant('Blue Dream', 'photoperiod', plum),
  ]

  p.milestones = [
    { id: uid('m_'), name: 'Seed arrival', targetDate: '', actualDate: '', done: true, notes: 'Unboxing. Highest-effort hook.' },
    { id: uid('m_'), name: 'Germination success', targetDate: '', actualDate: '2026-05-13', done: true, notes: 'Tap root cracks. Day 1 anchor.' },
    { id: uid('m_'), name: 'First true leaves', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'Transplant to 5 gal', targetDate: '', actualDate: '2026-06-21', done: true, notes: 'Into cloth pots.' },
    { id: uid('m_'), name: 'First training session', targetDate: '', actualDate: '', done: false, notes: 'Topping / LST.' },
    { id: uid('m_'), name: 'Flower formation', targetDate: '', actualDate: '', done: false, notes: 'White Widow first.' },
    { id: uid('m_'), name: 'Harvest reveal', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'Dry weight reveal', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'First smoke review', targetDate: '', actualDate: '', done: false, notes: 'The payoff episode.' },
  ]

  const C = p.settings.categories
  const catId = (label) => (C.find((c) => c.label === label) || C[0]).id
  p.ideas = [
    { id: uid('i_'), hook: 'Weekly recap: seed to sprout', columnId: 'col_planned', categoryId: catId('Recap'), priority: 'high', styleTags: ['timelapse'], gear: '', script: '', notes: 'POV, high quality timelapse.' },
    { id: uid('i_'), hook: 'Visual differences between strains', columnId: 'col_vault', categoryId: catId('Educational'), priority: 'medium', styleTags: ['360'], gear: '360 camera', script: '', notes: 'Seed / strain overview.' },
    { id: uid('i_'), hook: 'I have to abandon my plants for a week', columnId: 'col_vault', categoryId: catId('Weed Update'), priority: 'medium', styleTags: ['story'], gear: '', script: '', notes: 'Vacation gap = bigger reveal payoff.' },
    { id: uid('i_'), hook: 'Match cuts of growth with the Microsoft sound', columnId: 'col_vault', categoryId: catId('Passive Reel'), priority: 'medium', styleTags: ['edit'], gear: '', script: '', notes: 'Short 5s series jumping between growth stages.' },
    { id: uid('i_'), hook: 'Autoflower vs photoperiod, explained', columnId: 'col_vault', categoryId: catId('Educational'), priority: 'medium', styleTags: [], gear: '', script: '', notes: 'An attempt at explaining weed growth.' },
    { id: uid('i_'), hook: 'Serenading my weed plants', columnId: 'col_vault', categoryId: catId('Other'), priority: 'low', styleTags: ['music'], gear: 'mic', script: '', notes: 'Get Aidan or Gigi to sing in front of them.' },
    { id: uid('i_'), hook: 'Making canna butter out of leaves', columnId: 'col_vault', categoryId: catId('Other'), priority: 'low', styleTags: ['cooking'], gear: '', script: '', notes: '' },
    { id: uid('i_'), hook: 'What got me into this', columnId: 'col_vault', categoryId: catId('Other'), priority: 'low', styleTags: ['personal'], gear: '', script: '', notes: 'Make it personal.' },
    { id: uid('i_'), hook: 'Big announcement: growing indoors this winter', columnId: 'col_vault', categoryId: catId('Other'), priority: 'low', styleTags: ['announcement'], gear: '', script: '', notes: '' },
  ]

  p.equipment = [
    { id: uid('e_'), name: 'iPhone + tripod', have: true, notes: 'Main daily driver' },
    { id: uid('e_'), name: '360 camera', have: false, notes: 'For strain comparison reel' },
    { id: uid('e_'), name: 'Macro lens', have: false, notes: 'Close-up node / trichome shots' },
    { id: uid('e_'), name: 'Clip light / LED panel', have: false, notes: 'Evening shots' },
  ]

  const ww = p.plants[0].id, af = p.plants[1].id, bd = p.plants[4].id
  p.growLog = [
    { id: uid('g_'), date: '2026-05-20', plantId: 'all', stage: 'seedling', height: 3, watered: true, fed: false, notes: 'First true leaves on everyone. Cotyledons looking healthy, no stretch.' },
    { id: uid('g_'), date: '2026-06-21', plantId: 'all', stage: 'vegetative', height: 18, watered: true, fed: true, notes: 'Transplant day into 5 gallon cloth pots. Gave them the first real feed of Grow Big. A little transplant droop by evening, expected.' },
    { id: uid('g_'), date: '2026-07-02', plantId: af, stage: 'vegetative', height: 34, watered: true, fed: true, notes: 'Apple Fritter is the bushiest of the group. Topped it above the fifth node to open up the canopy.' },
    { id: uid('g_'), date: '2026-07-08', plantId: bd, stage: 'vegetative', height: 41, watered: true, fed: false, notes: 'Blue Dream stretching tall and lanky like the Haze side. Might need support stakes soon.' },
    { id: uid('g_'), date: '2026-07-12', plantId: ww, stage: 'flowering', height: 46, watered: true, fed: true, notes: 'White Widow (auto) is showing the first white pistils at the top cola. Officially into flower ahead of the rest. Frost incoming.' },
  ]

  p.posts = [
    { id: uid('po_'), date: '2026-05-14', platform: 'instagram', hook: 'Day 1: the seeds are in', categoryId: catId('Weed Update'), status: 'posted', views: 4200, likes: 380, saves: 210, shares: 64, comments: 22, notes: 'Strong hook, unboxing energy.' },
    { id: uid('po_'), date: '2026-06-21', platform: 'instagram', hook: 'Transplant day into 5 gallon pots', categoryId: catId('Weed Update'), status: 'posted', views: 3100, likes: 240, saves: 130, shares: 28, comments: 15, notes: '' },
    { id: uid('po_'), date: '2026-07-06', platform: 'tiktok', hook: 'Autoflower vs photoperiod in 30 seconds', categoryId: catId('Educational'), status: 'posted', views: 8800, likes: 610, saves: 540, shares: 120, comments: 41, notes: 'Best performer so far. Saves are high.' },
    { id: uid('po_'), date: '2026-07-16', platform: 'instagram', hook: 'White Widow is flowering first', categoryId: catId('Weed Update'), status: 'editing', views: '', likes: '', saves: '', shares: '', comments: '', notes: 'Waiting on b-roll.' },
  ]

  p.stories = [
    { id: uid('s_'), date: '2026-07-12', morningShot: true, closeUp: true, audience: true, note: 'Poll: which strain will flower first?' },
    { id: uid('s_'), date: '2026-07-11', morningShot: true, closeUp: true, audience: false, note: 'Used the lofi timelapse audio.' },
    { id: uid('s_'), date: '2026-07-10', morningShot: true, closeUp: false, audience: false, note: '' },
  ]

  p.calendar = [
    { id: uid('c_'), date: '2026-07-14', title: 'Weekly recap reel', categoryId: catId('Recap'), platform: 'instagram', notes: 'Seed to sprout timelapse.', done: false },
    { id: uid('c_'), date: '2026-07-16', title: 'White Widow flower close-up', categoryId: catId('Weed Update'), platform: 'instagram', notes: '', done: false },
    { id: uid('c_'), date: '2026-07-17', title: 'Passive B-roll: morning watering', categoryId: catId('Passive Reel'), platform: 'tiktok', notes: '', done: false },
    { id: uid('c_'), date: '2026-07-19', title: 'Strain differences explainer', categoryId: catId('Educational'), platform: 'youtube', notes: '360 cam.', done: false },
  ]

  return p
}
