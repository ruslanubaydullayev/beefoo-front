<script setup lang="ts">
import type { BrandDetail, BrandListResponse } from '~/types/brand'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
// Resolve in setup — composables are unavailable after await inside useAsyncData.
const brandsEndpoint = apiUrl('/brands')

const { data: pageData, error } = await useAsyncData(
  `brand-page-${slug.value}`,
  async () => {
    const currentSlug = slug.value
    if (!currentSlug) return null

    const brand = await $fetch<BrandDetail>(`${brandsEndpoint}/${currentSlug}`)
    let related: BrandListResponse | null = null

    if (brand.category?.slug) {
      related = await $fetch<BrandListResponse>(brandsEndpoint, {
        query: {
          category: brand.category.slug,
          page_size: 12,
        },
      })
    }

    return { brand, related }
  },
)

const brand = computed(() => pageData.value?.brand ?? null)

if (error.value || !brand.value) {
  throw createError({
    statusCode: (error.value as { statusCode?: number } | null)?.statusCode || 404,
    statusMessage: 'Brand not found',
  })
}

const relatedBrands = computed(() =>
  (pageData.value?.related?.items || [])
    .filter((item) => item.slug !== slug.value)
    .slice(0, 4),
)

const primaryLogo = computed(
  () => brand.value?.logos.find((logo) => logo.is_primary) || brand.value?.logos[0],
)

const primaryColor = computed(
  () => brand.value?.colors.find((color) => color.is_primary)?.hex
    || brand.value?.colors[0]?.hex
    || null,
)

const title = computed(
  () => brand.value?.meta_title || `${brand.value?.name} Brand Colors, Fonts & Logos`,
)
const description = computed(
  () =>
    brand.value?.meta_description
    || `Explore ${brand.value?.name} visual identity: brand colors, HEX/RGB/HSL/CMYK codes, fonts, and logos on BeeCoo.`,
)

const siteUrl = useRuntimeConfig().public.siteUrl as string

const jsonLd = computed(() => {
  if (!brand.value) return []
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Brands', item: `${siteUrl}/brands` },
        {
          '@type': 'ListItem',
          position: 3,
          name: brand.value.name,
          item: `${siteUrl}/brand/${brand.value.slug}`,
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Brand',
      name: brand.value.name,
      description: brand.value.description,
      url: brand.value.website_url || undefined,
      logo: primaryLogo.value?.image_url,
    },
  ]
})

usePageSeo({
  title: title.value,
  description: description.value,
  path: `/brand/${brand.value.slug}`,
  image: primaryLogo.value?.image_url,
  type: 'article',
})

const toast = useToast()

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${value}`)
  }
  catch {
    toast.error('Could not copy to clipboard')
  }
}
</script>

<template>
  <div v-if="brand">
    <JsonLd :data="jsonLd" />
    <section class="brand-hero">
      <div class="page-shell">
        <nav class="meta-row" aria-label="Breadcrumb" style="margin-bottom: 1rem;">
          <NuxtLink class="chip" to="/">Home</NuxtLink>
          <NuxtLink class="chip" to="/brands">Brands</NuxtLink>
          <NuxtLink
            v-if="brand.category"
            class="chip"
            :to="`/category/${brand.category.slug}`"
          >
            {{ brand.category.name }}
          </NuxtLink>
        </nav>

        <div class="brand-hero__panel">
          <div>
            <div class="brand-hero__identity">
              <div class="brand-hero__logo">
                <BrandLogoMark
                  v-if="primaryLogo"
                  :src="primaryLogo.image_url"
                  :alt="`${brand.name} logo`"
                  :color="primaryColor"
                  :size="44"
                />
              </div>
              <div>
                <h1>{{ brand.name }}</h1>
                <div class="meta-row" style="margin-top: 0.75rem;">
                  <span v-if="brand.industry" class="chip">{{ brand.industry }}</span>
                  <span v-if="brand.country" class="chip">{{ brand.country }}</span>
                  <span v-if="brand.founded_year" class="chip">Est. {{ brand.founded_year }}</span>
                </div>
              </div>
            </div>
            <p>{{ brand.description }}</p>
          </div>

          <div>
            <div class="palette-strip" aria-hidden="true">
              <span
                v-for="color in brand.colors.slice(0, 5)"
                :key="color.id"
                :style="{ background: color.hex }"
              />
            </div>
            <p style="margin: 1rem 0 0; color: var(--muted);">
              {{ brand.colors.length }} colors · {{ brand.fonts.length }} fonts · {{ brand.logos.length }} logos
            </p>
            <a
              v-if="brand.website_url"
              class="btn btn--ghost"
              style="margin-top: 1rem;"
              :href="brand.website_url"
              target="_blank"
              rel="noopener"
            >
              Visit website
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Brand colors</h2>
            <p>HEX, RGB, HSL, and CMYK ready for production use.</p>
          </div>
        </div>

        <div class="color-grid">
          <article v-for="color in brand.colors" :key="color.id" class="color-card">
            <div class="color-card__swatch" :style="{ background: color.hex }" />
            <div class="color-card__body">
              <h3>{{ color.name || color.hex }}</h3>
              <ul class="color-codes">
                <li>
                  HEX
                  <button type="button" class="chip" style="margin-left: 0.4rem;" @click="copyText(color.hex)">
                    <code>{{ color.hex }}</code>
                  </button>
                </li>
                <li v-if="color.rgb">RGB <code>{{ color.rgb }}</code></li>
                <li v-if="color.hsl">HSL <code>{{ color.hsl }}</code></li>
                <li v-if="color.cmyk">CMYK <code>{{ color.cmyk }}</code></li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Fonts</h2>
            <p>Typefaces associated with this brand system.</p>
          </div>
        </div>
        <div v-if="brand.fonts.length" class="font-list">
          <article v-for="font in brand.fonts" :key="font.id" class="font-item">
            <h3>{{ font.name }}</h3>
            <p>
              <span v-if="font.role">{{ font.role }}</span>
              <span v-if="font.family"> · {{ font.family }}</span>
            </p>
            <p v-if="font.fallback">Fallback: {{ font.fallback }}</p>
          </article>
        </div>
        <div v-else class="empty-state">
          No fonts recorded yet.
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Logos</h2>
            <p>Primary marks and variants currently available.</p>
          </div>
        </div>
        <div v-if="brand.logos.length" class="logo-grid">
          <article v-for="logo in brand.logos" :key="logo.id" class="logo-item">
            <div class="logo-item__preview">
              <BrandLogoMark
                :src="logo.image_url"
                :alt="logo.name || `${brand.name} logo`"
                :color="primaryColor"
                :size="64"
              />
            </div>
            <h3>{{ logo.name || 'Logo' }}</h3>
            <p>
              <span v-if="logo.variant">{{ logo.variant }}</span>
              <span v-if="logo.format"> · {{ logo.format.toUpperCase() }}</span>
              <span v-if="primaryColor"> · {{ primaryColor }}</span>
            </p>
          </article>
        </div>
        <div v-else class="empty-state">
          No logos recorded yet.
        </div>
      </div>
    </section>

    <section v-if="relatedBrands.length" class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Similar brands</h2>
            <p>More identities from the same category.</p>
          </div>
        </div>
        <div class="brand-grid">
          <BrandCard
            v-for="item in relatedBrands"
            :key="item.id"
            :brand="item"
          />
        </div>
      </div>
    </section>
  </div>
</template>
