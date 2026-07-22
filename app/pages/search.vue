<script setup lang="ts">
import type { SearchResponse } from '~/types/brand'
import { querySearch } from '~/utils/catalog'

const route = useRoute()
const query = ref(String(route.query.q || ''))
const page = computed(() => Number(route.query.page || 1))
const debouncedQuery = useDebouncedRef(query, 350)

watch(debouncedQuery, (value) => {
  const next = value.trim()
  const current = String(route.query.q || '')
  if (next === current) return
  navigateTo({
    path: '/search',
    query: next ? { q: next } : {},
  })
})

watch(
  () => route.query.q,
  (value) => {
    const next = String(value || '')
    if (next !== query.value) query.value = next
  },
)

const { data, pending, error } = await useAsyncData<SearchResponse | null>(
  () => `search-page-${String(route.query.q || '')}-${page.value}`,
  () => {
    const q = String(route.query.q || '').trim()
    if (!q) return Promise.resolve(null)
    return Promise.resolve(querySearch(q, page.value, 24))
  },
  { watch: [() => route.query.q, page] },
)

async function onSubmit(value: string) {
  const next = value.trim()
  query.value = next
  await navigateTo({
    path: '/search',
    query: next ? { q: next } : {},
  })
}

usePageSeo({
  title: query.value ? `Search: ${query.value}` : 'Search Brands',
  description: 'Search BeeFoo for brand colors, fonts, logos, industries, and countries.',
  path: '/search',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <div class="section__head">
        <div>
          <h2>Search</h2>
          <p>Find brands by name, industry, country, or category.</p>
        </div>
      </div>

      <SearchForm v-model="query" @submit="onSubmit" />

      <div v-if="!query.trim()" class="empty-state" style="margin-top: 1.5rem;">
        Start typing a brand name like Spotify, Nike, or Stripe.
      </div>
      <div v-else-if="pending" class="empty-state" style="margin-top: 1.5rem;">
        Searching…
      </div>
      <div v-else-if="error" class="error-state" style="margin-top: 1.5rem;">
        Search failed. Try again.
      </div>
      <div v-else>
        <p style="margin: 1.5rem 0; color: var(--muted);">
          {{ data?.total || 0 }} result{{ (data?.total || 0) === 1 ? '' : 's' }} for “{{ query }}”
        </p>
        <div v-if="data?.items?.length" class="brand-grid">
          <BrandCard
            v-for="brand in data.items"
            :key="brand.id"
            :brand="brand"
          />
        </div>
        <div v-else class="empty-state">
          No brands matched that query.
        </div>
      </div>
    </div>
  </section>
</template>
