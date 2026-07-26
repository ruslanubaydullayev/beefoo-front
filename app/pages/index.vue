<script setup lang="ts">
const { listBrands, listCategories } = useBrandCatalog()

const { data: featured } = await listBrands({ featured: true, page_size: 8 })
const { data: latest } = await listBrands({ page_size: 12 })
const { data: categories } = await listCategories()

const searchQuery = ref('')
const showKinetic = ref(false)

function goSearch(value: string) {
  if (!value) {
    navigateTo('/search')
    return
  }
  navigateTo({ path: '/search', query: { q: value } })
}

let kineticMedia: MediaQueryList | null = null
function syncKinetic() {
  showKinetic.value = Boolean(kineticMedia?.matches)
}

onMounted(() => {
  kineticMedia = window.matchMedia('(min-width: 860px)')
  syncKinetic()
  kineticMedia.addEventListener('change', syncKinetic)
})

onBeforeUnmount(() => {
  kineticMedia?.removeEventListener('change', syncKinetic)
})

const siteUrl = useRuntimeConfig().public.siteUrl as string

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'BeeFoo',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

usePageSeo({
  title: 'BeeFoo — Brand Identities & Free Design Tools',
  description:
    'Browse brand colors, fonts, and logos — plus free design tools: color converter, contrast checker, website scanner, brand comparison, and unusual fonts.',
  path: '/',
})

const homeTools = [
  {
    to: '/tools/color-converter',
    icon: 'converter' as const,
    title: 'Color converter',
    text: 'HEX, RGB, HSL, and CMYK in one place.',
  },
  {
    to: '/tools/compare-brands',
    icon: 'compare' as const,
    title: 'Compare brands',
    text: 'Side-by-side colors, logos, and brand facts.',
  },
  {
    to: '/tools/unusual-fonts',
    icon: 'fonts' as const,
    title: 'Unusual fonts',
    text: 'Turn any username into stylish Unicode text.',
  },
  {
    to: '/tools/website-scanner',
    icon: 'scanner' as const,
    title: 'Website scanner',
    text: 'Pull colors and fonts from any URL.',
  },
]
</script>

<template>
  <div>
    <JsonLd :data="jsonLd" />
    <section class="hero">
      <div class="page-shell hero__grid">
        <div>
          <p class="hero__brand">BeeFoo</p>
          <h1 class="hero__title">
            Brand identities and free tools designers actually use.
          </h1>
          <p class="hero__text">
            Search brand colors, fonts, and logos — then open free tools for converters,
            contrast checks, unusual fonts, comparisons, and more.
          </p>
          <div class="hero__actions">
            <SearchForm v-model="searchQuery" @submit="goSearch" />
            <NuxtLink class="btn btn--ghost" to="/tools">
              Explore tools
            </NuxtLink>
          </div>
        </div>

        <div v-if="showKinetic" class="hero__visual" aria-hidden="true">
          <ClientOnly>
            <KineticText />
          </ClientOnly>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>Free design tools</h2>
            <p>Not only a brand database — everyday utilities for color, type, and identity work.</p>
          </div>
          <NuxtLink class="btn btn--ghost" to="/tools">
            All tools
          </NuxtLink>
        </div>

        <div class="tool-grid">
          <NuxtLink
            v-for="tool in homeTools"
            :key="tool.to"
            class="tool-card"
            :to="tool.to"
          >
            <ToolIcon :name="tool.icon" />
            <h3>{{ tool.title }}</h3>
            <p>{{ tool.text }}</p>
          </NuxtLink>
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
