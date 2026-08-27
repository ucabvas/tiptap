// The 8 colors a kid can pick from.
export const COLORS = [
  { id: 'red',    name: 'Red',    hex: '#e63946' },
  { id: 'orange', name: 'Orange', hex: '#ff8c1a' },
  { id: 'yellow', name: 'Yellow', hex: '#ffd60a' },
  { id: 'green',  name: 'Green',  hex: '#2fb457' },
  { id: 'blue',   name: 'Blue',   hex: '#1d75d6' },
  { id: 'purple', name: 'Purple', hex: '#8a4fd3' },
  { id: 'white',  name: 'White',  hex: '#ffffff' },
  { id: 'black',  name: 'Black',  hex: '#1b1b1b' },
]

export const colorById = (id) => COLORS.find((c) => c.id === id)

// Paint-style mixes, the way a 4-year-old expects them (blue + yellow = green).
const MIXES = {
  'red+red': ['Red', '#e63946'],
  'red+orange': ['Red Orange', '#f4661c'],
  'red+yellow': ['Orange', '#ff8c1a'],
  'red+green': ['Brown', '#8a5a3b'],
  'red+blue': ['Purple', '#8a4fd3'],
  'red+purple': ['Berry', '#b3327f'],
  'red+white': ['Pink', '#ff9fb2'],
  'red+black': ['Dark Red', '#7d1f28'],

  'orange+orange': ['Orange', '#ff8c1a'],
  'orange+yellow': ['Golden', '#ffb300'],
  'orange+green': ['Olive', '#8f9a2e'],
  'orange+blue': ['Brown', '#8a6a45'],
  'orange+purple': ['Brown', '#95584f'],
  'orange+white': ['Peach', '#ffc79b'],
  'orange+black': ['Dark Brown', '#6b4416'],

  'yellow+yellow': ['Yellow', '#ffd60a'],
  'yellow+green': ['Lime', '#9ede3a'],
  'yellow+blue': ['Green', '#2fb457'],
  'yellow+purple': ['Brown', '#9b7a4a'],
  'yellow+white': ['Cream', '#fff0a8'],
  'yellow+black': ['Olive', '#7d7420'],

  'green+green': ['Green', '#2fb457'],
  'green+blue': ['Teal', '#1c9c9c'],
  'green+purple': ['Muddy Green', '#5e7350'],
  'green+white': ['Mint', '#a8e6bd'],
  'green+black': ['Dark Green', '#18542c'],

  'blue+blue': ['Blue', '#1d75d6'],
  'blue+purple': ['Indigo', '#5a5fd0'],
  'blue+white': ['Sky Blue', '#9ecdf5'],
  'blue+black': ['Navy', '#123a6b'],

  'purple+purple': ['Purple', '#8a4fd3'],
  'purple+white': ['Lavender', '#cfb3f0'],
  'purple+black': ['Dark Purple', '#432469'],

  'white+white': ['White', '#ffffff'],
  'white+black': ['Grey', '#9a9a9a'],

  'black+black': ['Black', '#1b1b1b'],
}

const ORDER = COLORS.map((c) => c.id)

export function mix(aId, bId) {
  const [first, second] = [aId, bId].sort(
    (x, y) => ORDER.indexOf(x) - ORDER.indexOf(y)
  )
  const [name, hex] = MIXES[`${first}+${second}`]
  return { name, hex }
}
