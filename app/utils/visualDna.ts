import type { BrandDetail, BrandListItem } from '~/types/brand'
import {
  colorDistance,
  contrastRatio,
  hexToRgb,
  rgbToHsl,
  type HSL,
  type RGB,
} from '~/utils/color'
import { queryAllBrands } from '~/utils/catalog'

export type AccessibilityGrade = 'AAA' | 'AA' | 'A' | 'Fail'

export interface VisualDna {
  primaryHex: string
  primaryName: string
  style: string
  energy: number
  minimalism: number
  warmth: number
  accessibility: AccessibilityGrade
  accessibilityRatio: number
  industry: string
  dominantShape: string
  typography: string
}

export interface VisualSimilarity {
  brand: BrandListItem
  score: number
}

function clampScore(value: number) {
  return Math.round(Math.min(10, Math.max(0, value)) * 10) / 10
}

function primaryColorOf(brand: Pick<BrandDetail, 'colors' | 'primary_color'>) {
  const sorted = [...(brand.colors || [])].sort((a, b) => a.sort_order - b.sort_order)
  const primary = sorted.find((color) => color.is_primary) || sorted[0]
  return {
    hex: (primary?.hex || brand.primary_color || '#12202A').toUpperCase(),
    name: primary?.name || hueLabel(rgbToHsl(hexToRgb(primary?.hex || brand.primary_color || '#12202A') || { r: 18, g: 32, b: 42 })),
  }
}

function hueLabel(hsl: HSL): string {
  if (hsl.s < 12) {
    if (hsl.l < 20) return 'Black'
    if (hsl.l > 85) return 'White'
    return 'Gray'
  }
  const h = ((hsl.h % 360) + 360) % 360
  if (h < 15 || h >= 345) return 'Red'
  if (h < 45) return 'Orange'
  if (h < 70) return 'Yellow'
  if (h < 160) return 'Green'
  if (h < 200) return 'Teal'
  if (h < 255) return 'Blue'
  if (h < 290) return 'Purple'
  if (h < 345) return 'Pink'
  return 'Color'
}

function paletteStats(brand: Pick<BrandDetail, 'colors' | 'primary_color'>) {
  const colors = (brand.colors || [])
    .map((color) => {
      const rgb = hexToRgb(color.hex)
      if (!rgb) return null
      return { rgb, hsl: rgbToHsl(rgb), hex: color.hex.toUpperCase(), isPrimary: color.is_primary }
    })
    .filter((item): item is { rgb: RGB, hsl: HSL, hex: string, isPrimary: boolean } => Boolean(item))

  if (!colors.length) {
    const fallback = hexToRgb(brand.primary_color || '#12202A') || { r: 18, g: 32, b: 42 }
    colors.push({
      rgb: fallback,
      hsl: rgbToHsl(fallback),
      hex: (brand.primary_color || '#12202A').toUpperCase(),
      isPrimary: true,
    })
  }

  const primary = colors.find((c) => c.isPrimary) || colors[0]!
  const avgSat = colors.reduce((sum, c) => sum + c.hsl.s, 0) / colors.length
  const avgLight = colors.reduce((sum, c) => sum + c.hsl.l, 0) / colors.length
  const lightSpread = Math.max(...colors.map((c) => c.hsl.l)) - Math.min(...colors.map((c) => c.hsl.l))
  const chromaSpread = Math.max(...colors.map((c) => c.hsl.s)) - Math.min(...colors.map((c) => c.hsl.s))
  const warmShare = colors.filter((c) => {
    const h = c.hsl.h
    return c.hsl.s >= 12 && ((h >= 0 && h < 70) || h >= 330)
  }).length / colors.length

  return { colors, primary, avgSat, avgLight, lightSpread, chromaSpread, warmShare, count: colors.length }
}

function accessibilityGrade(primary: RGB): { grade: AccessibilityGrade, ratio: number } {
  const onWhite = contrastRatio(primary, { r: 255, g: 255, b: 255 })
  const onBlack = contrastRatio(primary, { r: 0, g: 0, b: 0 })
  const ratio = Math.max(onWhite, onBlack)
  const rounded = Math.round(ratio * 100) / 100
  if (ratio >= 7) return { grade: 'AAA', ratio: rounded }
  if (ratio >= 4.5) return { grade: 'AA', ratio: rounded }
  if (ratio >= 3) return { grade: 'A', ratio: rounded }
  return { grade: 'Fail', ratio: rounded }
}

function styleLabel(stats: ReturnType<typeof paletteStats>): string {
  const { avgSat, avgLight, count, lightSpread } = stats
  if (count <= 2 && avgSat < 25 && (avgLight < 25 || avgLight > 75)) return 'Minimal'
  if (avgSat > 55 && lightSpread > 40) return 'Bold'
  if (avgSat > 45 && avgLight > 35 && avgLight < 65) return 'Modern'
  if (avgSat < 30 && avgLight > 55) return 'Soft'
  if (avgLight < 35 && avgSat < 40) return 'Classic'
  if (avgSat > 40 && stats.warmShare > 0.45) return 'Vibrant'
  return 'Contemporary'
}

function shapeLabel(stats: ReturnType<typeof paletteStats>, style: string): string {
  if (style === 'Minimal' || style === 'Classic') return 'Geometric'
  if (style === 'Soft' || stats.warmShare > 0.55) return 'Rounded'
  if (style === 'Bold' && stats.avgSat > 60) return 'Rounded'
  if (stats.lightSpread > 55) return 'Sharp'
  return 'Rounded'
}

function typographyLabel(style: string, stats: ReturnType<typeof paletteStats>): string {
  if (style === 'Minimal' || style === 'Classic') return 'Neo-Grotesque'
  if (style === 'Soft') return 'Humanist Sans'
  if (style === 'Bold' || style === 'Vibrant') return 'Geometric Sans'
  if (stats.avgSat < 25) return 'Grotesque Sans'
  return 'Geometric Sans'
}

/** Build a deterministic Visual DNA fingerprint from catalog color data. */
export function buildVisualDna(brand: BrandDetail): VisualDna {
  const stats = paletteStats(brand)
  const primaryMeta = primaryColorOf(brand)
  const energy = clampScore(
    (stats.avgSat / 100) * 6.5
    + (stats.lightSpread / 100) * 2.5
    + Math.min(stats.count, 5) * 0.25,
  )
  const minimalism = clampScore(
    10
    - Math.min(stats.count, 6) * 0.9
    - (stats.avgSat / 100) * 2.2
    - (stats.chromaSpread / 100) * 1.5,
  )
  const warmth = clampScore(
    stats.warmShare * 8.5
    + (stats.primary.hsl.s / 100) * (stats.warmShare > 0.3 ? 1.5 : 0.4),
  )
  const style = styleLabel(stats)
  const access = accessibilityGrade(stats.primary.rgb)

  return {
    primaryHex: primaryMeta.hex,
    primaryName: primaryMeta.name || hueLabel(stats.primary.hsl),
    style,
    energy,
    minimalism,
    warmth,
    accessibility: access.grade,
    accessibilityRatio: access.ratio,
    industry: brand.industry || brand.category?.name || 'Brand',
    dominantShape: shapeLabel(stats, style),
    typography: brand.fonts?.[0]?.name
      ? brand.fonts.map((font) => font.name).slice(0, 2).join(' · ')
      : typographyLabel(style, stats),
  }
}

function brandVector(brand: BrandDetail) {
  const stats = paletteStats(brand)
  const dna = buildVisualDna(brand)
  return {
    primary: stats.primary.rgb,
    palette: stats.colors.map((c) => c.rgb),
    energy: dna.energy,
    minimalism: dna.minimalism,
    warmth: dna.warmth,
    industry: (brand.industry || '').toLowerCase(),
    category: brand.category?.slug || '',
  }
}

function similarityScore(a: ReturnType<typeof brandVector>, b: ReturnType<typeof brandVector>) {
  const primaryDist = colorDistance(a.primary, b.primary)
  // redmean distance is roughly 0–765; map near colors to high %
  const primaryScore = Math.max(0, 100 - (primaryDist / 7.65))

  let paletteBonus = 0
  if (a.palette.length && b.palette.length) {
    const pairwise = a.palette.map((colorA) =>
      Math.min(...b.palette.map((colorB) => colorDistance(colorA, colorB))),
    )
    const avg = pairwise.reduce((sum, n) => sum + n, 0) / pairwise.length
    paletteBonus = Math.max(0, 12 - avg / 40)
  }

  const traitDelta =
    Math.abs(a.energy - b.energy)
    + Math.abs(a.minimalism - b.minimalism)
    + Math.abs(a.warmth - b.warmth)
  const traitScore = Math.max(0, 10 - traitDelta)

  const industryBonus = a.industry && a.industry === b.industry ? 8 : 0
  const categoryBonus = a.category && a.category === b.category ? 6 : 0

  return Math.round(
    Math.min(99, Math.max(1, primaryScore * 0.72 + paletteBonus + traitScore * 0.6 + industryBonus + categoryBonus)),
  )
}

function toListItem(brand: BrandDetail): BrandListItem {
  const colors = [...(brand.colors || [])].sort((a, b) => a.sort_order - b.sort_order)
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    country: brand.country,
    industry: brand.industry,
    is_featured: brand.is_featured,
    category: brand.category,
    colors,
    primary_color:
      brand.primary_color
      ?? colors.find((c) => c.is_primary)?.hex
      ?? colors[0]?.hex
      ?? null,
    primary_logo_url:
      brand.primary_logo_url
      ?? brand.logos.find((l) => l.is_primary)?.image_url
      ?? brand.logos[0]?.image_url
      ?? null,
  }
}

/** Rank other brands by Visual DNA similarity. */
export function findSimilarBrands(brand: BrandDetail, limit = 3): VisualSimilarity[] {
  const source = brandVector(brand)
  return queryAllBrands()
    .filter((item) => item.slug !== brand.slug)
    .map((item) => ({
      brand: toListItem(item),
      score: similarityScore(source, brandVector(item)),
    }))
    .sort((a, b) => b.score - a.score || a.brand.name.localeCompare(b.brand.name))
    .slice(0, limit)
}
