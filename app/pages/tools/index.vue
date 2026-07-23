<script setup lang="ts">
const tools = [
  {
    to: '/tools/color-converter',
    title: 'Color converter',
    text: 'Convert between HEX, RGB, HSL, and CMYK instantly — and see which brands use similar colors.',
    swatches: ['#D89A12', '#0F6E6A', '#E4002B', '#4285F4'],
  },
  {
    to: '/tools/contrast-checker',
    title: 'Contrast checker',
    text: 'Test text and background pairs against WCAG AA and AAA accessibility standards.',
    swatches: ['#12202A', '#F3F6F8', '#000000', '#FFC72C'],
  },
]

usePageSeo({
  title: 'Free Design Tools',
  description:
    'Free tools for designers from BeeFoo: color format converter, WCAG contrast checker, and more on the way.',
  path: '/tools',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <div class="section__head">
        <div>
          <h2>Tools</h2>
          <p>Small, fast utilities for everyday design work. Free, no sign-up.</p>
        </div>
      </div>

      <div class="tool-grid">
        <NuxtLink v-for="tool in tools" :key="tool.to" class="tool-card" :to="tool.to">
          <span class="tool-card__swatches" aria-hidden="true">
            <span
              v-for="(swatch, i) in tool.swatches"
              :key="i"
              :style="{ background: swatch }"
            />
          </span>
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.text }}</p>
        </NuxtLink>

        <div class="tool-card tool-card--soon" aria-disabled="true">
          <h3>Palette from image</h3>
          <p>Extract a brand-ready palette from any picture. Coming soon.</p>
        </div>
      </div>
    </div>
  </section>
</template>
