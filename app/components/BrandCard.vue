<script setup lang="ts">
import type { BrandListItem } from '~/types/brand'

const props = defineProps<{ brand: BrandListItem }>()

const swatches = computed(() => {
  const fromPalette = (props.brand.colors || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((color) => color.hex)
    .filter(Boolean)

  if (fromPalette.length) return fromPalette
  if (props.brand.primary_color) return [props.brand.primary_color]
  return ['#12202a']
})
</script>

<template>
  <NuxtLink :to="`/brand/${brand.slug}`" class="brand-tile">
    <div class="brand-tile__top">
      <div class="brand-tile__logo">
        <BrandLogoMark
          :src="brand.primary_logo_url || `/logos/${brand.slug}.svg`"
          :alt="`${brand.name} logo`"
          :color="brand.primary_color"
          :size="28"
        />
      </div>
      <div>
        <h3 class="brand-tile__name">{{ brand.name }}</h3>
        <p class="brand-tile__meta">
          {{ brand.category?.name || brand.industry || 'Brand' }}
          <span v-if="brand.country"> · {{ brand.country }}</span>
        </p>
      </div>
    </div>
    <div
      class="palette-strip"
      :style="{ gridTemplateColumns: `repeat(${swatches.length}, minmax(0, 1fr))` }"
      aria-hidden="true"
    >
      <span v-for="(swatch, index) in swatches" :key="index" :style="{ background: swatch }" />
    </div>
  </NuxtLink>
</template>
