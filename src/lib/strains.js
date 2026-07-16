// Offline strain reference. Data paraphrased from public strain databases (Leafly and
// similar). THC ranges are typical batch averages, not guarantees. This powers the
// auto-fill on the Plants tab so it works with no server. Unknown strains fall back to
// manual entry. type: 'indica' | 'sativa' | 'hybrid'.

export const STRAINS = {
  'white widow': {
    display: 'White Widow', type: 'hybrid', lean: 'sativa-leaning', thc: '18–25%',
    effects: ['energetic', 'talkative', 'creative', 'euphoric'],
    flavors: ['earthy', 'woody', 'spicy', 'pine'],
    lineage: 'Brazilian sativa × South Indian indica',
    blurb: 'A 1990s Dutch classic, frosted in resin. Quick cerebral lift with steady daytime energy.',
  },
  'apple fritter': {
    display: 'Apple Fritter', type: 'hybrid', lean: 'balanced', thc: '22–28%',
    effects: ['relaxed', 'happy', 'euphoric', 'giggly'],
    flavors: ['sweet', 'apple pastry', 'vanilla', 'earthy'],
    lineage: 'Sour Apple × Animal Cookies',
    blurb: 'Dessert-sweet true hybrid. Upbeat headspace up front, calm body to finish, and it hits hard.',
  },
  'northern lights': {
    display: 'Northern Lights', type: 'indica', lean: 'near-pure indica', thc: '16–21%',
    effects: ['relaxed', 'sleepy', 'euphoric', 'happy'],
    flavors: ['earthy', 'pine', 'sweet', 'spicy'],
    lineage: 'Afghani × Thai landraces',
    blurb: 'Legendary heavy indica. Deep body relaxation, ideal for evenings and sleep.',
  },
  'blue dream': {
    display: 'Blue Dream', type: 'hybrid', lean: 'sativa-leaning', thc: '17–24%',
    effects: ['uplifted', 'creative', 'relaxed', 'happy'],
    flavors: ['blueberry', 'sweet', 'berry', 'herbal'],
    lineage: 'Blueberry × Haze',
    blurb: 'West Coast icon. Sweet berry nose and a balanced daytime high that stays clear-headed.',
  },
  'og kush': {
    display: 'OG Kush', type: 'hybrid', lean: 'balanced', thc: '19–26%',
    effects: ['relaxed', 'happy', 'euphoric', 'hungry'],
    flavors: ['earthy', 'pine', 'lemon', 'diesel'],
    lineage: 'Chemdawg × Hindu Kush (disputed)',
    blurb: 'Backbone of West Coast genetics. Piney, gassy, and heavy-hitting.',
  },
  'sour diesel': {
    display: 'Sour Diesel', type: 'sativa', lean: 'sativa', thc: '19–25%',
    effects: ['energetic', 'uplifted', 'creative', 'happy'],
    flavors: ['diesel', 'citrus', 'pungent', 'earthy'],
    lineage: 'Chemdawg × Super Skunk (disputed)',
    blurb: 'Fast-acting sativa. Loud fuel smell and a dreamy, energetic head high.',
  },
  'girl scout cookies': {
    display: 'Girl Scout Cookies', type: 'hybrid', lean: 'indica-leaning', thc: '19–28%',
    effects: ['euphoric', 'relaxed', 'happy', 'giggly'],
    flavors: ['sweet', 'earthy', 'mint', 'cookie'],
    lineage: 'OG Kush × Durban Poison',
    blurb: 'Sweet, minty cookie flavor with a strong full-body high.',
  },
  'gorilla glue': {
    display: 'Gorilla Glue #4', type: 'hybrid', lean: 'balanced', thc: '25–30%',
    effects: ['relaxed', 'euphoric', 'sleepy', 'happy'],
    flavors: ['earthy', 'pine', 'diesel', 'coffee'],
    lineage: 'Chem Sister × Sour Dubb × Chocolate Diesel',
    blurb: 'Sticky, potent, couch-locking. Chocolatey diesel funk.',
  },
  'granddaddy purple': {
    display: 'Granddaddy Purple', type: 'indica', lean: 'indica', thc: '17–23%',
    effects: ['relaxed', 'sleepy', 'happy', 'euphoric'],
    flavors: ['grape', 'berry', 'sweet'],
    lineage: 'Purple Urkle × Big Bud',
    blurb: 'Purple grape-candy indica. Dreamy body high and deep relaxation.',
  },
  'gelato': {
    display: 'Gelato', type: 'hybrid', lean: 'balanced', thc: '20–25%',
    effects: ['relaxed', 'happy', 'euphoric', 'creative'],
    flavors: ['sweet', 'dessert', 'berry', 'citrus'],
    lineage: 'Sunset Sherbet × Thin Mint GSC',
    blurb: 'Dessert-sweet Cookies descendant. Balanced, strong, and flavorful.',
  },
  'wedding cake': {
    display: 'Wedding Cake', type: 'hybrid', lean: 'indica-leaning', thc: '22–25%',
    effects: ['relaxed', 'happy', 'euphoric', 'hungry'],
    flavors: ['sweet', 'vanilla', 'earthy', 'tangy'],
    lineage: 'Triangle Kush × Animal Mints',
    blurb: 'Rich vanilla-cake flavor. Relaxing, indica-leaning hybrid.',
  },
  'runtz': {
    display: 'Runtz', type: 'hybrid', lean: 'balanced', thc: '19–29%',
    effects: ['euphoric', 'relaxed', 'happy', 'uplifted'],
    flavors: ['sweet', 'fruity', 'candy', 'tropical'],
    lineage: 'Zkittlez × Gelato',
    blurb: 'Candy-sweet and potent, with colorful buds and an even, euphoric high.',
  },
}

function normalize(name = '') {
  return name.toLowerCase().replace(/#?\d+$/, '').replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim()
}

// Look up strain info. Handles minor variations ("Northern Lights A" -> "northern lights").
export function lookupStrain(name = '') {
  const key = normalize(name)
  if (STRAINS[key]) return STRAINS[key]
  // try progressively shorter matches (e.g. "northern lights auto")
  const words = key.split(' ')
  for (let n = words.length; n >= 2; n--) {
    const sub = words.slice(0, n).join(' ')
    if (STRAINS[sub]) return STRAINS[sub]
  }
  return null
}

export function strainNames() {
  return Object.values(STRAINS).map((s) => s.display)
}
