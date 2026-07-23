<script setup lang="ts">
import type { BrandListItem } from '~/types/brand'
import { queryBrand } from '~/utils/catalog'
import {
  canonicalComparePath,
  queryCuratedComparePairs,
} from '~/utils/compare'

const left = ref<BrandListItem | null>(null)
const right = ref<BrandListItem | null>(null)

const canCompare = computed(
  () => Boolean(left.value && right.value && left.value.slug !== right.value.slug),
)

const sameBrand = computed(
  () => Boolean(left.value && right.value && left.value.slug === right.value.slug),
)

function swap() {
  const tmp = left.value
  left.value = right.value
  right.value = tmp
}

function goCompare() {
  if (!left.value || !right.value || left.value.slug === right.value.slug) return
  navigateTo(canonicalComparePath(left.value.slug, right.value.slug))
}

const popular = computed(() =>
  queryCuratedComparePairs()
    .slice(0, 12)
    .flatMap(([a, b]) => {
      const brandA = queryBrand(a)
      const brandB = queryBrand(b)
      if (!brandA || !brandB) return []
      return [{
        path: canonicalComparePath(a, b),
        left: brandA,
        right: brandB,
        label: `${brandA.name} vs ${brandB.name}`,
      }]
    }),
)

usePageSeo({
  title: 'Compare Brands — Colors, Fonts & Logos',
  description:
    'Pick any two brands and compare their colors, fonts, logos, industry, and country side by side. Free brand identity comparison tool from BeeFoo.',
  path: '/tools/compare-brands',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink to="/tools">Tools</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Compare brands</span>
      </nav>

      <div class="section__head">
        <div>
          <h2>Compare brands</h2>
          <p>Pick two brands and see colors, fonts, logos, and brand facts side by side.</p>
        </div>
      </div>

      <div class="tool-panel tool-panel--compare">
        <div class="compare-tool__pickers">
          <BrandPicker
            v-model="left"
            label="Brand A"
            input-id="compare-brand-a"
            placeholder="Search first brand…"
            :exclude-slug="right?.slug"
          />

          <button
            type="button"
            class="btn btn--ghost compare-tool__swap"
            :disabled="!left && !right"
            @click="swap"
          >
            Swap
          </button>

          <BrandPicker
            v-model="right"
            label="Brand B"
            input-id="compare-brand-b"
            placeholder="Search second brand…"
            :exclude-slug="left?.slug"
          />
        </div>

        <p v-if="sameBrand" class="compare-tool__hint">
          Choose two different brands to compare.
        </p>

        <button
          type="button"
          class="btn btn--primary compare-tool__submit"
          :disabled="!canCompare"
          @click="goCompare"
        >
          Compare brands
        </button>
      </div>

      <div v-if="popular.length" class="compare-tool__popular">
        <div class="section__head">
          <div>
            <h2>Popular comparisons</h2>
            <p>High-intent rival matchups already in the catalog.</p>
          </div>
        </div>
        <div class="compare-more">
          <NuxtLink
            v-for="item in popular"
            :key="item.path"
            :to="item.path"
            class="compare-more__link"
          >
            <BrandLogoMark
              :src="item.left.primary_logo_url || `/logos/${item.left.slug}.svg`"
              :alt="`${item.left.name} logo`"
              :color="item.left.primary_color"
              :size="24"
            />
            <span>{{ item.label }}</span>
            <BrandLogoMark
              :src="item.right.primary_logo_url || `/logos/${item.right.slug}.svg`"
              :alt="`${item.right.name} logo`"
              :color="item.right.primary_color"
              :size="24"
            />
          </NuxtLink>
        </div>
      </div>
    </div>
  </section>
</template>
