// Every color is a paint recipe: parts of red / yellow / blue / white / black.
// Mixing two colors just pours the recipes together, so any pair works.
const RECIPES = {
  red:     { r: 1 },
  orange:  { r: 1, y: 1 },
  yellow:  { y: 1 },
  lime:    { y: 3, b: 1 },
  green:   { y: 1, b: 1 },
  teal:    { y: 2, b: 3, w: 1 },
  blue:    { b: 1 },
  skyblue: { b: 1, w: 2 },
  purple:  { r: 1, b: 1 },
  magenta: { r: 3, b: 1, w: 1 },
  pink:    { r: 1, w: 2 },
  peach:   { r: 1, y: 1, w: 3 },
  brown:   { r: 2, y: 1, k: 1 },
  grey:    { w: 2, k: 1 },
  white:   { w: 1 },
  black:   { k: 1 },
}

// The order they appear in the palette, with the names a kid hears for them.
const PALETTE = [
  ['red', 'Red', '#e63946'],
  ['orange', 'Orange', '#ff8c1a'],
  ['yellow', 'Yellow', '#ffd60a'],
  ['lime', 'Lime', '#a8e02a'],
  ['green', 'Green', '#2fb457'],
  ['teal', 'Teal', '#14a3a3'],
  ['skyblue', 'Sky Blue', '#7ec8f2'],
  ['blue', 'Blue', '#1d75d6'],
  ['purple', 'Purple', '#8a4fd3'],
  ['magenta', 'Magenta', '#d62b8f'],
  ['pink', 'Pink', '#ff8fb1'],
  ['peach', 'Peach', '#ffc79b'],
  ['brown', 'Brown', '#8a5a3b'],
  ['grey', 'Grey', '#9a9a9a'],
  ['white', 'White', '#ffffff'],
  ['black', 'Black', '#1b1b1b'],
]

// A few pairs where paint-pot wisdom beats the math.
const OVERRIDES = {
  'red+green': { name: 'Brown', hex: '#8a5a3b' },
  'orange+blue': { name: 'Brown', hex: '#7a6248' },
  'green+magenta': { name: 'Brown', hex: '#8a6a55' },
  'lime+purple': { name: 'Brown', hex: '#87775a' },
  'red+teal': { name: 'Brown', hex: '#8a6357' },
  'green+blue': { name: 'Teal', hex: '#177f96' },
}

// Corners of the red/yellow/blue color cube, blended the painterly way.
const CORNERS = {
  none: [255, 255, 255],
  r: [255, 0, 0],
  y: [255, 255, 0],
  b: [0, 0, 255],
  ry: [255, 128, 0],
  rb: [128, 0, 128],
  yb: [0, 200, 0],
  ryb: [60, 32, 10],
}

function rybToRgb(r, y, b) {
  const weights = [
    [CORNERS.none, (1 - r) * (1 - y) * (1 - b)],
    [CORNERS.r, r * (1 - y) * (1 - b)],
    [CORNERS.y, (1 - r) * y * (1 - b)],
    [CORNERS.b, (1 - r) * (1 - y) * b],
    [CORNERS.ry, r * y * (1 - b)],
    [CORNERS.rb, r * (1 - y) * b],
    [CORNERS.yb, (1 - r) * y * b],
    [CORNERS.ryb, r * y * b],
  ]
  return [0, 1, 2].map((i) =>
    weights.reduce((sum, [corner, weight]) => sum + corner[i] * weight, 0)
  )
}

function normalize(recipe) {
  const parts = { r: 0, y: 0, b: 0, w: 0, k: 0, ...recipe }
  const total = Object.values(parts).reduce((a, b) => a + b, 0)
  return Object.fromEntries(
    Object.entries(parts).map(([key, value]) => [key, value / total])
  )
}

function blend(recipeA, recipeB) {
  const a = normalize(recipeA)
  const b = normalize(recipeB)
  return Object.fromEntries(
    Object.keys(a).map((key) => [key, (a[key] + b[key]) / 2])
  )
}

function toHex(recipe) {
  const { r, y, b, w, k } = normalize(recipe)
  const strongest = Math.max(r, y, b)
  const base = strongest
    ? rybToRgb(r / strongest, y / strongest, b / strongest)
    : [255, 255, 255]
  // Stir in the white, then dull it down with the black.
  const rgb = base.map((channel) =>
    (channel + (255 - channel) * (w / (1 - k || 1))) * (1 - k)
  )
  return (
    '#' +
    rgb
      .map((channel) =>
        Math.round(Math.min(255, Math.max(0, channel)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

function toHsl(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const light = (max + min) / 2
  const span = max - min
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) * 255
  if (!span) return { hue: 0, sat: 0, luma, light }
  const sat = span / (1 - Math.abs(2 * light - 1))
  const hue =
    max === r
      ? ((g - b) / span + 6) % 6
      : max === g
        ? (b - r) / span + 2
        : (r - g) / span + 4
  return { hue: hue * 60, sat, luma, light }
}

const HUES = [
  [10, 'Red'],
  [45, 'Orange'],
  [64, 'Yellow'],
  [90, 'Lime'],
  [155, 'Green'],
  [195, 'Teal'],
  [215, 'Sky Blue'],
  [258, 'Blue'],
  [310, 'Purple'],
  [330, 'Magenta'],
  [358, 'Pink'],
  [360, 'Red'],
]

const LIGHT_NAMES = {
  Red: 'Pink',
  Orange: 'Peach',
  Yellow: 'Cream',
  Green: 'Mint',
  Blue: 'Sky Blue',
  'Sky Blue': 'Sky Blue',
  Purple: 'Lavender',
  Magenta: 'Pink',
  Pink: 'Pink',
}

const DARK_NAMES = { Blue: 'Navy', 'Sky Blue': 'Navy', Teal: 'Dark Teal' }

// Colors that are already dark when they are at their brightest.
const DARK_FLOOR = { Blue: 24, 'Sky Blue': 24, Purple: 30, Magenta: 40 }

// Turn any mixed-up color into a name a four-year-old would recognise.
function nameOf(hex) {
  const { hue, sat, luma, light } = toHsl(hex)

  if (sat < 0.14) {
    if (luma > 235) return 'White'
    if (luma < 30) return 'Black'
    return luma > 170 ? 'Light Grey' : luma < 80 ? 'Dark Grey' : 'Grey'
  }

  const base = HUES.find(([edge]) => hue < edge)[1]

  if (luma < 145 && hue >= 15 && hue < 58) return 'Brown'
  if (luma < 145 && hue >= 58 && hue < 100) return 'Olive'
  if (light > 0.66) return LIGHT_NAMES[base] || `Light ${base}`
  if (luma < (DARK_FLOOR[base] || 62)) return DARK_NAMES[base] || `Dark ${base}`
  return base
}

export const COLORS = PALETTE.map(([id, name, hex]) => ({ id, name, hex }))

export const colorById = (id) => COLORS.find((c) => c.id === id)

const ORDER = COLORS.map((c) => c.id)

export function mix(aId, bId) {
  const [first, second] = [aId, bId].sort(
    (x, y) => ORDER.indexOf(x) - ORDER.indexOf(y)
  )
  const override = OVERRIDES[`${first}+${second}`]
  if (override) return override
  if (first === second) return { name: colorById(first).name, hex: colorById(first).hex }
  const hex = toHex(blend(RECIPES[first], RECIPES[second]))
  return { name: nameOf(hex), hex }
}
