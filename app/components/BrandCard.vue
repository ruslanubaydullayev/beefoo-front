<script setup lang="ts">
import type { BrandListItem } from '~/types/brand'

const props = defineProps<{ brand: BrandListItem }>()

const swatches = computed(() => {
  const color = props.brand.primary_color || '#12202a'
  return [color, soften(color, 0.25), soften(color, 0.5), '#ffffff', '#12202a']
})

function soften(hex: string, amount: number) {
  const value = hex.replace('#', '')
  if (value.length !== 6) return hex
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount)
  return `#${[mix(r), mix(g), mix(b)].map((n) => n.toString(16).padStart(2, '0')).join('')}`
}
</script>

<template>
  <NuxtLink :to="`/brand/${brand.slug}`" class="brand-tile">
    <div class="brand-tile__top">
      <div class="brand-tile__logo">
        <BrandLogoMark
          v-if="brand.primary_logo_url"
          :src="brand.primary_logo_url"
          :alt="`${brand.name} logo`"
          :color="brand.primary_color"
          :size="28"
        />
        <span v-else>{{ brand.name.slice(0, 1) }}</span>
      </div>
      <div>
        <h3 class="brand-tile__name">{{ brand.name }}</h3>
        <p class="brand-tile__meta">
          {{ brand.category?.name || brand.industry || 'Brand' }}
          <span v-if="brand.country"> · {{ brand.country }}</span>
        </p>
      </div>
    </div>
    <div class="palette-strip" aria-hidden="true">
      <span v-for="(swatch, index) in swatches" :key="index" :style="{ background: swatch }" />
    </div>
  </NuxtLink>
</template>
