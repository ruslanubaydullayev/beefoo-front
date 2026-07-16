<script setup lang="ts">
import type { BrandListResponse } from '~/types/brand'

const route = useRoute()
const { listCategories } = useBrandApi()

const page = computed(() => Number(route.query.page || 1))
const category = computed(() => {
  const value = route.query.category
  return typeof value === 'string' && value.length > 0 ? value : undefined
})

const { data, pending, error } = await useAsyncData<BrandListResponse>(
  () => `brands-${category.value || 'all'}-page-${page.value}`,
  () => {
    const query: Record<string, string | number> = {
      page: page.value,
      page_size: 24,
    }
    if (category.value) {
      query.category = category.value
    }
    return $fetch<BrandListResponse>(apiUrl('/brands'), { query })
  },
  { watch: [page, category] },
)

const { data: categories } = await listCategories()

const activeCategoryName = computed(
  () => categories.value?.find((item) => item.slug === category.value)?.name,
)

usePageSeo({
  title: activeCategoryName.value
    ? `${activeCategoryName.value} Brands`
    : 'Browse Brand Identities',
  description:
    'Browse BeeCoo brand pages with colors, fonts, and logos across technology, fashion, sports, finance, and more.',
  path: '/brands',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <div class="section__head">
        <div>
          <h2>{{ activeCategoryName || 'All brands' }}</h2>
          <p>
            <template v-if="data">{{ data.total }} brands</template>
            <template v-else>Clean pages for every visual identity in the database.</template>
          </p>
        </div>
      </div>

      <div class="category-row">
        <NuxtLink
          class="chip"
          :class="{ 'is-active': !category }"
          :to="{ path: '/brands' }"
        >
          All
        </NuxtLink>
        <NuxtLink
          v-for="item in categories || []"
          :key="item.id"
          class="chip"
          :class="{ 'is-active': category === item.slug }"
          :to="{ path: '/brands', query: { category: item.slug } }"
        >
          {{ item.name }}
        </NuxtLink>
      </div>

      <div v-if="pending" class="empty-state">
        Loading brands…
      </div>
      <div v-else-if="error" class="error-state">
        Could not load brands. Is the API running on port 8000?
      </div>
      <div v-else-if="!data?.items?.length" class="empty-state">
        No brands found for this filter.
      </div>
      <div v-else class="brand-grid">
        <BrandCard
          v-for="brand in data.items"
          :key="brand.id"
          :brand="brand"
        />
      </div>

      <div v-if="data && data.pages > 1" class="pagination">
        <NuxtLink
          v-if="page > 1"
          class="btn btn--ghost"
          :to="{ path: '/brands', query: { ...route.query, page: page - 1 } }"
        >
          Previous
        </NuxtLink>
        <span>Page {{ data.page }} of {{ data.pages }}</span>
        <NuxtLink
          v-if="page < data.pages"
          class="btn btn--ghost"
          :to="{ path: '/brands', query: { ...route.query, page: page + 1 } }"
        >
          Next
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
