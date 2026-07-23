<script setup lang="ts">
import { contrastRatio, hexToRgb } from '~/utils/color'

const foreground = ref('#12202A')
const background = ref('#F3F6F8')

const ratio = computed(() => {
  const fg = hexToRgb(foreground.value)
  const bg = hexToRgb(background.value)
  if (!fg || !bg) return null
  return contrastRatio(fg, bg)
})

const rounded = computed(() => (ratio.value ? Math.round(ratio.value * 100) / 100 : null))

const checks = computed(() => {
  const r = ratio.value ?? 0
  return [
    { label: 'AA — normal text', min: 4.5, pass: r >= 4.5 },
    { label: 'AA — large text (18pt+)', min: 3, pass: r >= 3 },
    { label: 'AAA — normal text', min: 7, pass: r >= 7 },
    { label: 'AAA — large text (18pt+)', min: 4.5, pass: r >= 4.5 },
  ]
})

function swap() {
  const tmp = foreground.value
  foreground.value = background.value
  background.value = tmp
}

usePageSeo({
  title: 'WCAG Color Contrast Checker',
  description:
    'Check color contrast ratios against WCAG AA and AAA accessibility standards. Free tool for designers building readable interfaces.',
  path: '/tools/contrast-checker',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink to="/tools">Tools</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Contrast checker</span>
      </nav>

      <div class="section__head">
        <div>
          <h2>WCAG contrast checker</h2>
          <p>Test a text and background color pair against accessibility standards.</p>
        </div>
      </div>

      <div class="tool-panel tool-panel--contrast">
        <div class="contrast__inputs">
          <div class="contrast__input">
            <label for="fg">Text color</label>
            <div class="contrast__control">
              <input type="color" :value="foreground" aria-label="Pick text color" @input="foreground = ($event.target as HTMLInputElement).value">
              <input id="fg" v-model="foreground" spellcheck="false">
            </div>
          </div>
          <button type="button" class="btn btn--ghost contrast__swap" @click="swap">
            Swap
          </button>
          <div class="contrast__input">
            <label for="bg">Background color</label>
            <div class="contrast__control">
              <input type="color" :value="background" aria-label="Pick background color" @input="background = ($event.target as HTMLInputElement).value">
              <input id="bg" v-model="background" spellcheck="false">
            </div>
          </div>
        </div>

        <div
          class="contrast__preview"
          :style="{ background, color: foreground }"
        >
          <p class="contrast__sample-lg">Great design is colorful.</p>
          <p class="contrast__sample-sm">
            But readable comes first — body text at this size needs a ratio of at least 4.5:1.
          </p>
        </div>

        <div class="contrast__result">
          <p class="contrast__ratio">
            <template v-if="rounded !== null">{{ rounded }}:1</template>
            <template v-else>—</template>
          </p>
          <ul class="contrast__checks">
            <li
              v-for="check in checks"
              :key="check.label"
              :class="check.pass ? 'is-pass' : 'is-fail'"
            >
              <span>{{ check.pass ? 'Pass' : 'Fail' }}</span>
              {{ check.label }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
