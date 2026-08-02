import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { NEW_BRANDS } from './new-brands-data.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const CATALOG_PATH = path.join(ROOT, 'app/data/catalog.json')

const SIMPLE_ICONS_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons'
const TIMESTAMP = '2026-08-02T09:00:00.000000+00:00'

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
}

function hexToHsl(hex) {
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h
  let s
  const l = (max + min) / 2
  if (max === min) {
    h = 0
    s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      default:
        h = ((r - g) / d + 4) / 6
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
}

function hexToCmyk(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const k = 1 - Math.max(r, g, b)
  if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)'
  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)
  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`
}

function createBrand(id, brand, category) {
  const hex = brand.color
  const logoUrl = brand.icon
    ? `${SIMPLE_ICONS_BASE}/${brand.icon}.svg`
    : `/logos/${brand.slug}.svg`

  const industry = category.name
  return {
    id,
    name: brand.name,
    slug: brand.slug,
    description: `${brand.name} visual identity — brand colors, fonts, and logos on BeeFoo.`,
    website_url: null,
    country: brand.country,
    industry,
    founded_year: null,
    is_featured: Boolean(brand.featured),
    meta_title: `${brand.name} Brand Colors, Fonts & Logos | BeeFoo`,
    meta_description: `Explore ${brand.name} visual identity: brand colors, HEX/RGB/HSL/CMYK codes, fonts, and logos on BeeFoo.`,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    category: { ...category },
    colors: [
      {
        id: id * 100,
        name: brand.colorName || `${brand.name} Primary`,
        hex,
        rgb: hexToRgb(hex),
        hsl: hexToHsl(hex),
        cmyk: hexToCmyk(hex),
        is_primary: true,
        sort_order: 0,
      },
    ],
    fonts: [],
    logos: [
      {
        id: id * 10,
        name: `${brand.name} Logo`,
        image_url: logoUrl,
        format: 'svg',
        variant: 'icon',
        is_primary: true,
        sort_order: 0,
      },
    ],
    primary_color: hex,
    primary_logo_url: logoUrl,
  }
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'))
const existingSlugs = new Set(catalog.brands.map((b) => b.slug))
const categoryBySlug = Object.fromEntries(catalog.categories.map((c) => [c.slug, c]))

let nextId = Math.max(...catalog.brands.map((b) => b.id)) + 1
const toAdd = NEW_BRANDS.filter((b) => !existingSlugs.has(b.slug))

if (toAdd.length === 0) {
  console.log('No new brands to add.')
  process.exit(0)
}

const added = []
for (const brand of toAdd) {
  const category = categoryBySlug[brand.category]
  if (!category) {
    console.warn(`Unknown category "${brand.category}" for ${brand.slug}`)
    continue
  }
  catalog.brands.push(createBrand(nextId, brand, category))
  added.push(brand.slug)
  nextId += 1
}

fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`)
console.log(`Added ${added.length} brands (total: ${catalog.brands.length})`)
console.log('By category:', added.reduce((acc, slug) => {
  const b = NEW_BRANDS.find((x) => x.slug === slug)
  acc[b.category] = (acc[b.category] || 0) + 1
  return acc
}, {}))
