import { colorDistance, hexToRgb, rgbToHex, rgbToHsl } from '~/utils/color'

const HTML_BYTE_LIMIT = 1_500_000
const CSS_BYTE_LIMIT = 400_000
const MAX_STYLESHEETS = 6
const FETCH_HEADERS = {
  'user-agent': 'Mozilla/5.0 (compatible; BeeFooScanner/1.0; +https://beefoo.art/tools/website-scanner)',
  'accept': 'text/html,text/css,*/*',
}

const GENERIC_FONTS = new Set([
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui',
  'ui-sans-serif', 'ui-serif', 'ui-monospace', 'ui-rounded', 'math',
  'inherit', 'initial', 'unset', 'revert', 'emoji', '-apple-system',
  'blinkmacsystemfont', 'segoe ui', 'segoe ui emoji', 'segoe ui symbol',
  'noto color emoji', 'arial', 'helvetica', 'helvetica neue', 'times',
  'times new roman', 'courier', 'courier new', 'georgia', 'verdana',
  'tahoma', 'trebuchet ms', 'palatino', 'garamond', 'menlo', 'monaco',
  'consolas', 'roboto',
])

function assertSafeUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw.trim())
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw createError({ statusCode: 400, statusMessage: 'Only http(s) URLs are supported' })
  }
  const host = url.hostname.toLowerCase()
  const isPrivateIp
    = /^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)
      || /^172\.(1[6-9]|2\d|3[01])\./.test(host)
      || host === 'localhost' || host === '::1' || host === '[::1]'
      || host.endsWith('.local') || host.endsWith('.internal')
  if (isPrivateIp) {
    throw createError({ statusCode: 400, statusMessage: 'This address cannot be scanned' })
  }
  return url
}

async function fetchText(url: string, byteLimit: number, timeoutMs: number): Promise<string> {
  const response = await fetch(url, {
    headers: FETCH_HEADERS,
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const text = await response.text()
  return text.length > byteLimit ? text.slice(0, byteLimit) : text
}

function extractAttr(tag: string, attr: string): string | null {
  const match = tag.match(new RegExp(`${attr}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
  return match ? (match[1] ?? match[2] ?? null) : null
}

function toAbsolute(href: string, base: URL): string | null {
  try {
    return new URL(href, base).href
  }
  catch {
    return null
  }
}

/** Collect colors from CSS/HTML text as normalized hex, with occurrence counts. */
function collectColors(text: string, counts: Map<string, number>, weight = 1) {
  for (const match of text.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
    const rgb = hexToRgb(match[0])
    if (rgb) counts.set(rgbToHex(rgb), (counts.get(rgbToHex(rgb)) || 0) + weight)
  }
  for (const match of text.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/gi)) {
    const r = Number(match[1])
    const g = Number(match[2])
    const b = Number(match[3])
    if (r <= 255 && g <= 255 && b <= 255) {
      const hex = rgbToHex({ r, g, b })
      counts.set(hex, (counts.get(hex) || 0) + weight)
    }
  }
}

function collectFonts(css: string, fonts: Map<string, number>) {
  for (const match of css.matchAll(/font-family\s*:\s*([^;}]+)/gi)) {
    const families = (match[1] || '').split(',')
    for (const familyRaw of families) {
      const family = familyRaw.trim().replace(/^["']|["']$/g, '').trim()
      if (!family || family.startsWith('var(') || family.length > 60) continue
      if (GENERIC_FONTS.has(family.toLowerCase())) continue
      const key = family.toLowerCase()
      fonts.set(key, (fonts.get(key) || 0) + 1)
    }
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const target = assertSafeUrl(String(query.url || ''))

  let html: string
  try {
    html = await fetchText(target.href, HTML_BYTE_LIMIT, 9000)
  }
  catch {
    throw createError({
      statusCode: 502,
      statusMessage: 'Could not reach that website. Check the URL and try again.',
    })
  }

  const colorCounts = new Map<string, number>()
  const fontCounts = new Map<string, number>()

  // Inline <style> blocks and style="" attributes
  for (const match of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    collectColors(match[1] || '', colorCounts)
    collectFonts(match[1] || '', fontCounts)
  }
  for (const match of html.matchAll(/style\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    collectColors(match[1] ?? match[2] ?? '', colorCounts)
  }

  // theme-color gets a strong boost: sites declare their brand color there
  const themeMatch = html.match(/<meta[^>]+name\s*=\s*["']theme-color["'][^>]*>/i)
  const themeColor = themeMatch ? extractAttr(themeMatch[0], 'content') : null
  if (themeColor) {
    const rgb = hexToRgb(themeColor)
    if (rgb) {
      const hex = rgbToHex(rgb)
      colorCounts.set(hex, (colorCounts.get(hex) || 0) + 25)
    }
  }

  // External stylesheets (first-party and CDN), capped
  const styleSheetUrls: string[] = []
  for (const match of html.matchAll(/<link[^>]+>/gi)) {
    const tag = match[0]
    const rel = (extractAttr(tag, 'rel') || '').toLowerCase()
    if (!rel.includes('stylesheet')) continue
    const href = extractAttr(tag, 'href')
    const abs = href ? toAbsolute(href, target) : null
    if (abs && styleSheetUrls.length < MAX_STYLESHEETS) styleSheetUrls.push(abs)

    // Google Fonts URLs name the families directly
    if (abs && abs.includes('fonts.googleapis.com')) {
      for (const fam of abs.matchAll(/family=([^&:]+)/gi)) {
        const family = decodeURIComponent(fam[1] || '').replace(/\+/g, ' ').trim()
        if (family) fontCounts.set(family.toLowerCase(), (fontCounts.get(family.toLowerCase()) || 0) + 5)
      }
    }
  }

  const sheets = await Promise.allSettled(
    styleSheetUrls.map(url => fetchText(url, CSS_BYTE_LIMIT, 6000)),
  )
  for (const sheet of sheets) {
    if (sheet.status === 'fulfilled') {
      collectColors(sheet.value, colorCounts)
      collectFonts(sheet.value, fontCounts)
    }
  }

  // Logo candidates
  const logos: { url: string, source: string }[] = []
  const seenLogos = new Set<string>()
  const addLogo = (href: string | null, source: string) => {
    const abs = href ? toAbsolute(href, target) : null
    if (abs && !seenLogos.has(abs)) {
      seenLogos.add(abs)
      logos.push({ url: abs, source })
    }
  }
  for (const match of html.matchAll(/<link[^>]+>/gi)) {
    const tag = match[0]
    const rel = (extractAttr(tag, 'rel') || '').toLowerCase()
    if (rel.includes('apple-touch-icon')) addLogo(extractAttr(tag, 'href'), 'apple-touch-icon')
    else if (rel === 'icon' || rel === 'shortcut icon' || rel.includes('mask-icon')) addLogo(extractAttr(tag, 'href'), 'icon')
  }
  const ogImage = html.match(/<meta[^>]+property\s*=\s*["']og:(?:logo|image)["'][^>]*>/i)
  if (ogImage) addLogo(extractAttr(ogImage[0], 'content'), 'og:image')
  const imgLogo = html.match(/<img[^>]+(?:class|id|alt)\s*=\s*["'][^"']*logo[^"']*["'][^>]*>/i)
  if (imgLogo) addLogo(extractAttr(imgLogo[0], 'src'), 'img[logo]')
  addLogo('/favicon.ico', 'favicon')

  // Rank colors: prefer saturated, mid-lightness colors as primary
  const ranked = [...colorCounts.entries()]
    .map(([hex, count]) => {
      const rgb = hexToRgb(hex)!
      const hsl = rgbToHsl(rgb)
      return { hex, count, rgb, hsl }
    })
    .sort((a, b) => b.count - a.count)

  const vivid = ranked.filter(c => c.hsl.s >= 18 && c.hsl.l >= 8 && c.hsl.l <= 92)
  const primary = vivid[0] || ranked[0] || null

  const accents: typeof ranked = []
  for (const candidate of vivid) {
    if (!primary || candidate.hex === primary.hex) continue
    const distinct = accents.every(a => colorDistance(candidate.rgb, a.rgb) > 70)
      && colorDistance(candidate.rgb, primary.rgb) > 70
    if (distinct) accents.push(candidate)
    if (accents.length >= 6) break
  }

  const neutrals = ranked
    .filter(c => c.hsl.s < 18 && c.hex !== primary?.hex)
    .slice(0, 4)

  const fonts = [...fontCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => name.replace(/\b\w/g, ch => ch.toUpperCase()))

  return {
    url: target.href,
    themeColor,
    primary: primary ? { hex: primary.hex, count: primary.count } : null,
    accents: accents.map(c => ({ hex: c.hex, count: c.count })),
    neutrals: neutrals.map(c => ({ hex: c.hex, count: c.count })),
    fonts,
    logos: logos.slice(0, 6),
    stylesheetsScanned: sheets.filter(s => s.status === 'fulfilled').length,
  }
})
