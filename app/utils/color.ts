export type RGB = { r: number, g: number, b: number }
export type HSL = { h: number, s: number, l: number }
export type CMYK = { c: number, m: number, y: number, k: number }

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export function hexToRgb(hex: string): RGB | null {
  let value = hex.trim().replace(/^#/, '')
  if (/^[0-9a-f]{3}$/i.test(value)) {
    value = value.split('').map(ch => ch + ch).join('')
  }
  if (!/^[0-9a-f]{6}$/i.test(value)) return null
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16),
  }
}

export function rgbToHex({ r, g, b }: RGB): string {
  const to2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase()
}

export function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6
  else if (max === gn) h = ((bn - rn) / d + 2) / 6
  else h = ((rn - gn) / d + 4) / 6

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

export function hslToRgb({ h, s, l }: HSL): RGB {
  const hn = (((h % 360) + 360) % 360) / 360
  const sn = clamp(s, 0, 100) / 100
  const ln = clamp(l, 0, 100) / 100

  if (sn === 0) {
    const v = Math.round(ln * 255)
    return { r: v, g: v, b: v }
  }

  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn
  const p = 2 * ln - q
  const channel = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  return {
    r: Math.round(channel(hn + 1 / 3) * 255),
    g: Math.round(channel(hn) * 255),
    b: Math.round(channel(hn - 1 / 3) * 255),
  }
}

export function rgbToCmyk({ r, g, b }: RGB): CMYK {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const k = 1 - Math.max(rn, gn, bn)
  if (k >= 1) return { c: 0, m: 0, y: 0, k: 100 }
  return {
    c: Math.round(((1 - rn - k) / (1 - k)) * 100),
    m: Math.round(((1 - gn - k) / (1 - k)) * 100),
    y: Math.round(((1 - bn - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  }
}

export function cmykToRgb({ c, m, y, k }: CMYK): RGB {
  const cn = clamp(c, 0, 100) / 100
  const mn = clamp(m, 0, 100) / 100
  const yn = clamp(y, 0, 100) / 100
  const kn = clamp(k, 0, 100) / 100
  return {
    r: Math.round(255 * (1 - cn) * (1 - kn)),
    g: Math.round(255 * (1 - mn) * (1 - kn)),
    b: Math.round(255 * (1 - yn) * (1 - kn)),
  }
}

export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

export function formatHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`
}

export function formatCmyk(cmyk: CMYK): string {
  return `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`
}

export function parseRgbString(input: string): RGB | null {
  const match = input.match(/(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/)
  if (!match) return null
  const [r, g, b] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if ([r, g, b].some(n => n > 255)) return null
  return { r, g, b }
}

export function parseHslString(input: string): HSL | null {
  const match = input.match(/(-?\d{1,3})\s*[, ]\s*(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?/)
  if (!match) return null
  const [h, s, l] = [Number(match[1]), Number(match[2]), Number(match[3])]
  if (s > 100 || l > 100) return null
  return { h, s, l }
}

export function parseCmykString(input: string): CMYK | null {
  const match = input.match(/(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?\s*[, ]\s*(\d{1,3})%?/)
  if (!match) return null
  const [c, m, y, k] = [Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4])]
  if ([c, m, y, k].some(n => n > 100)) return null
  return { c, m, y, k }
}

/** Perceptual-ish distance between two colors (0 = identical). */
export function colorDistance(a: RGB, b: RGB): number {
  // Weighted Euclidean distance ("redmean" approximation)
  const rMean = (a.r + b.r) / 2
  const dr = a.r - b.r
  const dg = a.g - b.g
  const db = a.b - b.b
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db,
  )
}

/** WCAG relative luminance. */
export function relativeLuminance({ r, g, b }: RGB): number {
  const lin = (v: number) => {
    const s = v / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** WCAG contrast ratio between two colors (1–21). */
export function contrastRatio(a: RGB, b: RGB): number {
  const l1 = relativeLuminance(a)
  const l2 = relativeLuminance(b)
  const [dark, light] = l1 < l2 ? [l1, l2] : [l2, l1]
  return (light + 0.05) / (dark + 0.05)
}
