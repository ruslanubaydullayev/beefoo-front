<script setup lang="ts">
import type { BrandDetail } from '~/types/brand'
import { canonicalComparePath } from '~/utils/compare'
import { buildVisualDna, findSimilarBrands } from '~/utils/visualDna'

const props = defineProps<{ brand: BrandDetail }>()

const dna = computed(() => buildVisualDna(props.brand))
const similar = computed(() => findSimilarBrands(props.brand, 3))

function meterWidth(score: number) {
  return `${Math.min(100, Math.max(0, score * 10))}%`
}
</script>

<template>
  <section class="section visual-dna">
    <div class="page-shell">
      <div class="section__head">
        <div>
          <h2>Visual DNA</h2>
          <p>A fingerprint of {{ brand.name }}’s colors, contrast, and vibe — plus brands that feel similar.</p>
        </div>
      </div>

      <div class="visual-dna__panel">
        <div class="visual-dna__primary">
          <span
            class="visual-dna__swatch"
            :style="{ background: dna.primaryHex }"
            aria-hidden="true"
          />
          <div>
            <p class="visual-dna__kicker">Primary color</p>
            <strong>{{ dna.primaryName }}</strong>
            <code>{{ dna.primaryHex }}</code>
          </div>
        </div>

        <dl class="visual-dna__grid">
          <div class="visual-dna__row">
            <dt>Style</dt>
            <dd>{{ dna.style }}</dd>
          </div>

          <div class="visual-dna__row visual-dna__row--meter">
            <dt>Energy</dt>
            <dd>
              <div class="visual-dna__meter" aria-hidden="true">
                <span :style="{ width: meterWidth(dna.energy) }" />
              </div>
              <span>{{ dna.energy.toFixed(1) }}/10</span>
            </dd>
          </div>

          <div class="visual-dna__row visual-dna__row--meter">
            <dt>Minimalism</dt>
            <dd>
              <div class="visual-dna__meter" aria-hidden="true">
                <span :style="{ width: meterWidth(dna.minimalism) }" />
              </div>
              <span>{{ dna.minimalism.toFixed(1) }}/10</span>
            </dd>
          </div>

          <div class="visual-dna__row visual-dna__row--meter">
            <dt>Warmth</dt>
            <dd>
              <div class="visual-dna__meter visual-dna__meter--warm" aria-hidden="true">
                <span :style="{ width: meterWidth(dna.warmth) }" />
              </div>
              <span>{{ dna.warmth.toFixed(1) }}/10</span>
            </dd>
          </div>

          <div class="visual-dna__row">
            <dt>Accessibility</dt>
            <dd>
              <span class="chip" :class="`visual-dna__a11y--${dna.accessibility.toLowerCase()}`">
                {{ dna.accessibility }}
              </span>
              <span class="visual-dna__muted">{{ dna.accessibilityRatio }}:1</span>
            </dd>
          </div>

          <div class="visual-dna__row">
            <dt>Industry</dt>
            <dd>{{ dna.industry }}</dd>
          </div>

          <div class="visual-dna__row">
            <dt>Dominant shape</dt>
            <dd>{{ dna.dominantShape }}</dd>
          </div>

          <div class="visual-dna__row">
            <dt>Typography</dt>
            <dd>{{ dna.typography }}</dd>
          </div>
        </dl>

        <div v-if="similar.length" class="visual-dna__similar">
          <h3>Visual similarity</h3>
          <ul>
            <li v-for="item in similar" :key="item.brand.slug">
              <NuxtLink :to="`/brand/${item.brand.slug}`" class="visual-dna__match">
                <BrandLogoMark
                  :src="item.brand.primary_logo_url || `/logos/${item.brand.slug}.svg`"
                  :alt="`${item.brand.name} logo`"
                  :color="item.brand.primary_color"
                  :size="28"
                />
                <span class="visual-dna__match-copy">
                  <strong>{{ item.brand.name }}</strong>
                  <small>{{ item.score }}% similar</small>
                </span>
                <span
                  class="visual-dna__dot"
                  :style="{ background: item.brand.primary_color || dna.primaryHex }"
                  aria-hidden="true"
                />
              </NuxtLink>
              <NuxtLink
                class="visual-dna__compare"
                :to="canonicalComparePath(brand.slug, item.brand.slug)"
              >
                Compare
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
