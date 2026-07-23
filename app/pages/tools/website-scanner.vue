<script setup lang="ts">
type ScanResult = {
  url: string
  themeColor: string | null
  primary: { hex: string, count: number } | null
  accents: { hex: string, count: number }[]
  neutrals: { hex: string, count: number }[]
  fonts: string[]
  logos: { url: string, source: string }[]
  stylesheetsScanned: number
}

const input = ref('')
const loading = ref(false)
const errorMessage = ref('')
const result = ref<ScanResult | null>(null)
const { copy } = useCopy()

async function scan() {
  let url = input.value.trim()
  if (!url) return
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`

  loading.value = true
  errorMessage.value = ''
  result.value = null
  try {
    result.value = await $fetch<ScanResult>('/api/tools/scan-site', {
      query: { url },
    })
  }
  catch (error: unknown) {
    const statusMessage = (error as { statusMessage?: string })?.statusMessage
    errorMessage.value = statusMessage || 'Could not scan that website. Check the URL and try again.'
  }
  finally {
    loading.value = false
  }
}

function onLogoError(event: Event) {
  const el = event.target as HTMLImageElement
  el.closest('.scanner__logo')?.remove()
}

usePageSeo({
  title: 'Website Color Scanner — Extract Brand Colors & Fonts from Any URL',
  description:
    'Paste any website URL and instantly extract its primary color, accent palette, fonts, and logo. Free brand identity scanner for designers.',
  path: '/tools/website-scanner',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink to="/tools">Tools</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Website scanner</span>
      </nav>

      <div class="section__head">
        <div>
          <h2>Website color scanner</h2>
          <p>Paste a URL — we'll pull its colors, fonts, and logo candidates.</p>
        </div>
      </div>

      <form class="scanner__form" @submit.prevent="scan">
        <input
          v-model="input"
          type="text"
          inputmode="url"
          placeholder="stripe.com or https://example.com"
          aria-label="Website URL"
          spellcheck="false"
          autocomplete="off"
        >
        <button class="btn btn--primary" type="submit" :disabled="loading || !input.trim()">
          {{ loading ? 'Scanning…' : 'Scan website' }}
        </button>
      </form>

      <div v-if="loading" class="empty-state" style="margin-top: 1.5rem;">
        Fetching the page and reading its stylesheets…
      </div>
      <div v-else-if="errorMessage" class="error-state" style="margin-top: 1.5rem;">
        {{ errorMessage }}
      </div>

      <template v-else-if="result">
        <div class="tool-panel scanner__results">
          <div v-if="result.primary">
            <h3 class="scanner__label">Primary color</h3>
            <button
              type="button"
              class="scanner__primary"
              :style="{ background: result.primary.hex }"
              @click="copy(result.primary.hex)"
            >
              <code>{{ result.primary.hex }}</code>
            </button>
          </div>

          <div v-if="result.accents.length">
            <h3 class="scanner__label">Accent colors</h3>
            <div class="scanner__swatch-row">
              <button
                v-for="color in result.accents"
                :key="color.hex"
                type="button"
                class="scanner__swatch"
                :style="{ background: color.hex }"
                :title="`Copy ${color.hex}`"
                @click="copy(color.hex)"
              >
                <code>{{ color.hex }}</code>
              </button>
            </div>
          </div>

          <div v-if="result.neutrals.length">
            <h3 class="scanner__label">Neutrals</h3>
            <div class="scanner__swatch-row">
              <button
                v-for="color in result.neutrals"
                :key="color.hex"
                type="button"
                class="scanner__swatch"
                :style="{ background: color.hex }"
                :title="`Copy ${color.hex}`"
                @click="copy(color.hex)"
              >
                <code>{{ color.hex }}</code>
              </button>
            </div>
          </div>

          <div v-if="result.fonts.length">
            <h3 class="scanner__label">Fonts</h3>
            <div class="meta-row">
              <span v-for="font in result.fonts" :key="font" class="chip">{{ font }}</span>
            </div>
          </div>

          <div v-if="result.logos.length">
            <h3 class="scanner__label">Logo candidates</h3>
            <div class="scanner__logos">
              <a
                v-for="logo in result.logos"
                :key="logo.url"
                class="scanner__logo"
                :href="logo.url"
                target="_blank"
                rel="noopener nofollow"
                :title="logo.source"
              >
                <img :src="logo.url" :alt="`Logo candidate (${logo.source})`" loading="lazy" @error="onLogoError">
                <small>{{ logo.source }}</small>
              </a>
            </div>
          </div>

          <p class="scanner__note">
            Scanned {{ result.stylesheetsScanned }} stylesheet{{ result.stylesheetsScanned === 1 ? '' : 's' }}
            from {{ result.url }}. Colors are ranked by how often they appear — JavaScript-rendered
            styles aren't included, so results are an approximation.
          </p>
        </div>
      </template>
    </div>
  </section>
</template>
