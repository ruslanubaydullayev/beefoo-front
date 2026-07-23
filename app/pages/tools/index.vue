<script setup lang="ts">
const tools = [
  {
    to: '/tools/color-converter',
    icon: 'converter' as const,
    title: 'Color converter',
    text: 'Convert between HEX, RGB, HSL, and CMYK instantly — and see which brands use similar colors.',
  },
  {
    to: '/tools/contrast-checker',
    icon: 'contrast' as const,
    title: 'Contrast checker',
    text: 'Test text and background pairs against WCAG AA and AAA accessibility standards.',
  },
  {
    to: '/tools/website-scanner',
    icon: 'scanner' as const,
    title: 'Website color scanner',
    text: 'Paste any URL and extract its primary color, accent palette, fonts, and logo.',
  },
  {
    to: '/tools/palette-from-image',
    icon: 'palette' as const,
    title: 'Palette from image',
    text: 'Upload a picture and pull out its dominant colors — processed entirely in your browser.',
  },
]

usePageSeo({
  title: 'Free Design Tools',
  description:
    'Free tools for designers from BeeFoo: color converter, contrast checker, website color scanner, and palette extractor from images.',
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
          <ToolIcon :name="tool.icon" />
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.text }}</p>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
