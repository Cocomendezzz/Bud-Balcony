import { uid } from '../lib/id.js'

export const SCHEMA_VERSION = 1
export const PLATFORMS = ['instagram', 'tiktok', 'youtube']
export const PLATFORM_LABEL = { instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YT Shorts' }

export const POST_STATUS = ['idea', 'filmed', 'editing', 'scheduled', 'posted']
export const IDEA_STATUS = ['backlog', 'planned', 'posted']
export const PRIORITIES = ['low', 'medium', 'high']
export const GROW_STAGES = ['germination', 'seedling', 'vegetative', 'flowering', 'harvest', 'curing']
export const CAL_TYPES = ['reel', 'story', 'post', 'grow', 'note']

// A blank project skeleton. modules.grow can be turned off for non-grow ventures.
export function blankProject(name = 'New Project') {
  return {
    id: uid('p_'),
    name,
    createdAt: new Date().toISOString(),
    schemaVersion: SCHEMA_VERSION,
    settings: {
      seriesTitle: 'Seed to Smoke',
      tagline: 'One balcony. One seed. One harvest.',
      germinationDate: null, // Day 1 anchor, set manually
      heightUnit: 'cm',
      platforms: [...PLATFORMS],
      modules: { grow: true },
    },
    plants: [],
    growLog: [],
    posts: [],
    ideas: [],
    stories: [],
    milestones: [],
    calendar: [],
    followers: [], // { id, date, platform, count }
  }
}

// Pre-filled starter that mirrors the real balcony grow + the sheet.
export function seedBudBalcony() {
  const p = blankProject('Bud Balcony')
  p.settings.seriesTitle = 'Seed to Smoke'
  p.settings.tagline = 'One balcony. One seed. One harvest.'

  p.plants = [
    { id: uid('pl_'), name: 'White Widow', strain: 'White Widow', type: 'autoflower', soil: 'Fox Farm Ocean Forest', pot: '5 gal cloth', notes: 'Autoflower. Fastest to flower.' },
    { id: uid('pl_'), name: 'Apple Fritter', strain: 'Apple Fritter', type: 'autoflower', soil: 'Fox Farm Ocean Forest', pot: '5 gal cloth', notes: 'Autoflower.' },
    { id: uid('pl_'), name: 'Northern Lights A', strain: 'Northern Lights', type: 'photoperiod', soil: 'ProMix', pot: '5 gal cloth', notes: 'Photoperiod. Flip on light schedule later.' },
    { id: uid('pl_'), name: 'Northern Lights B', strain: 'Northern Lights', type: 'photoperiod', soil: 'ProMix', pot: '5 gal cloth', notes: 'Photoperiod.' },
    { id: uid('pl_'), name: 'Blue Dream', strain: 'Blue Dream', type: 'photoperiod', soil: 'Fox Farm Ocean Forest', pot: '5 gal cloth', notes: 'Photoperiod. The stretchy one.' },
  ]

  p.milestones = [
    { id: uid('m_'), name: 'Seed arrival', targetDate: '', actualDate: '', done: true, notes: 'Unboxing. Highest-effort hook.' },
    { id: uid('m_'), name: 'Germination success', targetDate: '', actualDate: '', done: false, notes: 'Tap root cracks. Day 1 anchor.' },
    { id: uid('m_'), name: 'First true leaves', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'First training session', targetDate: '', actualDate: '', done: false, notes: 'Topping / LST.' },
    { id: uid('m_'), name: 'Flower formation', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'Harvest reveal', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'Dry weight reveal', targetDate: '', actualDate: '', done: false, notes: '' },
    { id: uid('m_'), name: 'First smoke review', targetDate: '', actualDate: '', done: false, notes: 'The payoff episode.' },
  ]

  p.ideas = [
    { id: uid('i_'), hook: 'Weekly recap: seed to sprout', priority: 'high', status: 'planned', styleTags: ['recap', 'timelapse'], notes: 'POV, high quality timelapse.' },
    { id: uid('i_'), hook: 'What are the visual differences between strains?', priority: 'medium', status: 'backlog', styleTags: ['educational', '360'], notes: 'Seed / strain overview, 360 camera.' },
    { id: uid('i_'), hook: 'I have to abandon my plants for a week', priority: 'medium', status: 'backlog', styleTags: ['story'], notes: 'Vacation gap = bigger reveal payoff.' },
    { id: uid('i_'), hook: 'Match cuts of growth with the Microsoft sound', priority: 'medium', status: 'backlog', styleTags: ['edit'], notes: 'Short 5s series jumping between growth stages.' },
    { id: uid('i_'), hook: 'Autoflower vs photoperiod, explained', priority: 'medium', status: 'backlog', styleTags: ['educational'], notes: 'An attempt at explaining weed growth.' },
    { id: uid('i_'), hook: 'Serenading my weed plants', priority: 'low', status: 'backlog', styleTags: ['personality', 'music'], notes: 'Get Aidan or Gigi to sing in front of them.' },
    { id: uid('i_'), hook: 'Making canna butter out of leaves', priority: 'low', status: 'backlog', styleTags: ['cooking'], notes: '' },
    { id: uid('i_'), hook: 'What got me into this', priority: 'low', status: 'backlog', styleTags: ['personal'], notes: 'Make it personal.' },
    { id: uid('i_'), hook: 'Big announcement: growing indoors this winter', priority: 'low', status: 'backlog', styleTags: ['announcement'], notes: '' },
  ]

  return p
}
