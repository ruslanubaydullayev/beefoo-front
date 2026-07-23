<script setup lang="ts">
import {
  cmykToRgb,
  colorDistance,
  formatCmyk,
  formatHsl,
  formatRgb,
  hexToRgb,
  hslToRgb,
  parseCmykString,
  parseHslString,
  parseRgbString,
  rgbToCmyk,
  rgbToHex,
  rgbToHsl,
  type RGB,
} from '~/utils/color'
import { queryAllBrands } from '~/utils/catalog'

const rgb = ref<RGB>({ r: 216, g: 154, b: 18 })

const hexField = ref('')
const rgbField = ref('')
const hslField = ref('')
const cmykField = ref('')
const invalid = reactive<Record<string, boolean>>({})

function syncFields(except?: string) {
  const value = rgb.value
  if (except !== 'hex') hexField.value = rgbToHex(value)
  if (except !== 'rgb') rgbField.value = formatRgb(value)
  if (except !== 'hsl') hslField.value = formatHsl(rgbToHsl(value))
  if (except !== 'cmyk') cmykField.value = formatCmyk(rgbToCmyk(value))
}
syncFields()

function onInput(kind: 'hex' | 'rgb' | 'hsl' | 'cmyk') {
  let next: RGB | null = null
  if (kind === 'hex') next = hexToRgb(hexField.value)
  if (kind === 'rgb') next = parseRgbString(rgbField.value)
  if (kind === 'hsl') {
    const hsl = parseHslString(hslField.value)
    next = hsl ? hslToRgb(hsl) : null
  }
  if (kind === 'cmyk') {
    const cmyk = parseCmykString(cmykField.value)
    next = cmyk ? cmykToRgb(cmyk) : null
  }
  invalid[kind] = !next
  if (next) {
    rgb.value = next
    syncFields(kind)
  }
}

function onPickerInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  const next = hexToRgb(value)
  if (next) {
    rgb.value = next
    Object.keys(invalid).forEach(k => (invalid[k] = false))
    syncFields()
  }
}

const { copy } = useCopy()

// Brands in the catalog using colors closest to the current one
const brandMatches = computed(() => {
  const target = rgb.value
  const seen = new Set<number>()
  const matches: {
    id: number
    name: string
    slug: string
    colorName: string
    hex: string
    distance: number
  }[] = []

  for (const brand of queryAllBrands()) {
    let best: { name: string, hex: string, distance: number } | null = null
    for (const color of brand.colors || []) {
      const parsed = hexToRgb(color.hex)
      if (!parsed) continue
      const distance = colorDistance(target, parsed)
      if (!best || distance < best.distance) {
        best = { name: color.name, hex: color.hex, distance }
      }
    }
    if (best && !seen.has(brand.id)) {
      seen.add(brand.id)
      matches.push({
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        colorName: best.name,
        hex: best.hex,
        distance: best.distance,
      })
    }
  }

  return matches.sort((a, b) => a.distance - b.distance).slice(0, 8)
})

const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  'name': 'HEX RGB HSL CMYK Color Converter',
  'applicationCategory': 'DesignApplication',
  'operatingSystem': 'Web',
  'offers': { '@type': 'Offer', 'price': '0' },
}))

usePageSeo({
  title: 'HEX to RGB, HSL & CMYK Color Converter',
  description:
    'Free color converter for designers: convert between HEX, RGB, HSL, and CMYK instantly, and discover brands that use similar colors.',
  path: '/tools/color-converter',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <JsonLd :data="jsonLd" />
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink to="/tools">Tools</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Color converter</span>
      </nav>

      <div class="section__head">
        <div>
          <h2>HEX ↔ RGB ↔ HSL ↔ CMYK converter</h2>
          <p>Type in any field — the rest update instantly. Click a value to copy it.</p>
        </div>
      </div>

      <div class="tool-panel">
        <div class="converter__preview">
          <label class="converter__picker" :style="{ background: rgbToHex(rgb) }">
            <input
              type="color"
              :value="rgbToHex(rgb)"
              aria-label="Pick a color"
              @input="onPickerInput"
            >
          </label>
          <p class="converter__hint">Tap the swatch to open a color picker</p>
        </div>

        <div class="converter__fields">
          <div class="converter__field" :class="{ 'is-invalid': invalid.hex }">
            <label for="cc-hex">HEX</label>
            <input id="cc-hex" v-model="hexField" spellcheck="false" @input="onInput('hex')">
            <button type="button" class="converter__copy" @click="copy(hexField)">Copy</button>
          </div>
          <div class="converter__field" :class="{ 'is-invalid': invalid.rgb }">
            <label for="cc-rgb">RGB</label>
            <input id="cc-rgb" v-model="rgbField" spellcheck="false" @input="onInput('rgb')">
            <button type="button" class="converter__copy" @click="copy(rgbField)">Copy</button>
          </div>
          <div class="converter__field" :class="{ 'is-invalid': invalid.hsl }">
            <label for="cc-hsl">HSL</label>
            <input id="cc-hsl" v-model="hslField" spellcheck="false" @input="onInput('hsl')">
            <button type="button" class="converter__copy" @click="copy(hslField)">Copy</button>
          </div>
          <div class="converter__field" :class="{ 'is-invalid': invalid.cmyk }">
            <label for="cc-cmyk">CMYK</label>
            <input id="cc-cmyk" v-model="cmykField" spellcheck="false" @input="onInput('cmyk')">
            <button type="button" class="converter__copy" @click="copy(cmykField)">Copy</button>
          </div>
        </div>
      </div>

      <div class="section__head" style="margin-top: 2.5rem;">
        <div>
          <h2>Brands using similar colors</h2>
          <p>The closest matches from the BeeFoo database.</p>
        </div>
      </div>
      <div class="match-grid">
        <NuxtLink
          v-for="match in brandMatches"
          :key="match.id"
          class="match-card"
          :to="`/brand/${match.slug}`"
        >
          <span class="match-card__swatch" :style="{ background: match.hex }" />
          <span class="match-card__body">
            <strong>{{ match.name }}</strong>
            <small>{{ match.colorName }} · {{ match.hex }}</small>
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
