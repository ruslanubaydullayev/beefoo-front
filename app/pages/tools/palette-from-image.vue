<script setup lang="ts">
import { colorDistance, rgbToHex, type RGB } from '~/utils/color'

type Swatch = { hex: string, share: number }

const swatches = ref<Swatch[]>([])
const previewUrl = ref('')
const dragging = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const { copy } = useCopy()

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|bmp|avif|svg)$/i

function isImageFile(file: File) {
  if (file.type.startsWith('image/')) return true
  // Some OSes / drag sources leave type empty — fall back to extension
  return !file.type && IMAGE_EXT.test(file.name)
}

function onDrop(event: DragEvent) {
  dragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onPick(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
  // Allow re-selecting the same file
  input.value = ''
}

async function handleFile(file: File) {
  if (!isImageFile(file)) {
    errorMessage.value = 'Please choose an image file (PNG, JPG, WebP, GIF…).'
    return
  }

  errorMessage.value = ''
  loading.value = true
  swatches.value = []

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  previewUrl.value = URL.createObjectURL(file)

  try {
    swatches.value = await extractPaletteFromFile(file)
    if (!swatches.value.length) {
      errorMessage.value = 'No opaque colors found in this image.'
    }
  }
  catch (error) {
    console.error('[palette-from-image]', error)
    errorMessage.value = 'Could not read this image. Try PNG or JPG.'
    swatches.value = []
  }
  finally {
    loading.value = false
  }
}

/** Decode via createImageBitmap, with Image-element fallback for older browsers / odd formats. */
async function decodeImage(file: File): Promise<{ width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, close?: () => void }> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file)
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
        close: () => bitmap.close(),
      }
    }
    catch {
      // fall through to Image()
    }
  }

  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Image decode failed'))
      el.src = url
    })
    return {
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      draw: (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
    }
  }
  finally {
    URL.revokeObjectURL(url)
  }
}

async function extractPaletteFromFile(file: File): Promise<Swatch[]> {
  const image = await decodeImage(file)
  try {
    const maxSide = 180
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height, 1))
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas unavailable')

    image.draw(context, width, height)
    const { data } = context.getImageData(0, 0, width, height)
    return quantize(data)
  }
  finally {
    image.close?.()
  }
}

function quantize(data: Uint8ClampedArray): Swatch[] {
  const buckets = new Map<number, { r: number, g: number, b: number, n: number }>()
  let opaque = 0

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]!
    if (alpha < 128) continue
    opaque++
    const r = data[i]!
    const g = data[i + 1]!
    const b = data[i + 2]!
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4)
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.r += r
      bucket.g += g
      bucket.b += b
      bucket.n++
    }
    else {
      buckets.set(key, { r, g, b, n: 1 })
    }
  }
  if (!opaque) return []

  const averaged = [...buckets.values()]
    .map(bucket => ({
      rgb: {
        r: Math.round(bucket.r / bucket.n),
        g: Math.round(bucket.g / bucket.n),
        b: Math.round(bucket.b / bucket.n),
      } as RGB,
      n: bucket.n,
    }))
    .sort((a, b) => b.n - a.n)

  const merged: { rgb: RGB, n: number }[] = []
  for (const bucket of averaged) {
    const near = merged.find(m => colorDistance(m.rgb, bucket.rgb) < 45)
    if (near) near.n += bucket.n
    else merged.push({ ...bucket })
  }

  return merged
    .sort((a, b) => b.n - a.n)
    .slice(0, 8)
    .map(m => ({
      hex: rgbToHex(m.rgb),
      share: Math.round((m.n / opaque) * 100),
    }))
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

usePageSeo({
  title: 'Palette from Image — Extract Colors from Any Picture',
  description:
    'Upload an image and instantly extract its dominant color palette with HEX codes. Free in-browser tool for designers — your image never leaves your device.',
  path: '/tools/palette-from-image',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink to="/tools">Tools</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Palette from image</span>
      </nav>

      <div class="section__head">
        <div>
          <h2>Palette from image</h2>
          <p>Drop a picture — get its dominant colors. Everything runs in your browser.</p>
        </div>
      </div>

      <label
        class="dropzone"
        :class="{ 'is-dragging': dragging, 'is-loading': loading }"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
      >
        <input
          ref="fileInput"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,image/avif,.png,.jpg,.jpeg,.webp,.gif"
          @change="onPick"
        >
        <template v-if="previewUrl">
          <img :src="previewUrl" alt="Uploaded image preview" class="dropzone__preview">
          <span>{{ loading ? 'Extracting colors…' : 'Drop another image or click to replace' }}</span>
        </template>
        <template v-else>
          <strong>{{ loading ? 'Extracting colors…' : 'Drop an image here' }}</strong>
          <span>or click to browse — PNG, JPG, WebP, GIF</span>
        </template>
      </label>

      <div v-if="errorMessage" class="error-state" style="margin-top: 1rem;">
        {{ errorMessage }}
      </div>

      <div v-if="swatches.length" class="palette-result">
        <button
          v-for="swatch in swatches"
          :key="swatch.hex"
          type="button"
          class="palette-result__swatch"
          :title="`Copy ${swatch.hex}`"
          @click="copy(swatch.hex)"
        >
          <span :style="{ background: swatch.hex }" />
          <code>{{ swatch.hex }}</code>
          <small>{{ swatch.share }}%</small>
        </button>
      </div>

      <p v-if="swatches.length" class="scanner__note">
        Click any swatch to copy its HEX code. Your image is processed locally and never uploaded.
      </p>
    </div>
  </section>
</template>
