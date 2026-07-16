<script setup lang="ts">
const { listBrands, listCategories } = useBrandApi()

const { data: featured } = await listBrands({ featured: true, page_size: 8 })
const { data: latest } = await listBrands({ page_size: 12 })
const { data: categories } = await listCategories()

const searchQuery = ref('')

function goSearch(value: string) {
  if (!value) {
    navigateTo('/search')
    return
  }
  navigateTo({ path: '/search', query: { q: value } })
}

const siteUrl = useRuntimeConfig().public.siteUrl as string

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BeeCoo',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

usePageSeo({
  title: 'BeeCoo — Visual Identity Database',
  description:
    'Find brand colors, fonts, and logos in one searchable visual identity database built for designers and developers.',
  path: '/',
})
</script>

<template>
  <div>
    <JsonLd :data="jsonLd" />
    <section class="hero">
      <div class="page-shell hero__grid">
        <div>
          <p class="hero__brand">BeeCoo</p>
          <h1 class="hero__title">
            The visual identity database for brands that designers actually use.
          </h1>
          <p class="hero__text">
            Instantly find brand colors, color codes, fonts, and logos — built for search traffic and everyday design work.
          </p>
          <div class="hero__actions">
            <SearchForm v-model="searchQuery" @submit="goSearch" />
          </div>
        </div>

        <div class="hero__visual" aria-hidden="true">
          <div class="hero__swatches">
            <span class="hero__swatch" />
            <span class="hero__swatch" />
            <span class="hero__swatch" />
            <span class="hero__swatch" />
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Browse by category</h2>
            <p>Start from industries that matter for brand research.</p>
          </div>
          <NuxtLink class="btn btn--ghost" to="/brands">
            View all brands
          </NuxtLink>
        </div>

        <div class="category-row">
          <NuxtLink
            v-for="category in categories || []"
            :key="category.id"
            class="chip"
            :to="`/category/${category.slug}`"
          >
            {{ category.name }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Featured brands</h2>
            <p>High-signal identities to explore first.</p>
          </div>
        </div>
        <div class="brand-grid">
          <BrandCard
            v-for="brand in featured?.items || []"
            :key="brand.id"
            :brand="brand"
          />
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Latest in the database</h2>
            <p>{{ latest?.total || 0 }} brands indexed and growing.</p>
          </div>
        </div>
        <div class="brand-grid">
          <BrandCard
            v-for="brand in latest?.items || []"
            :key="brand.id"
            :brand="brand"
          />
        </div>
      </div>
    </section>
  </div>
</template>
