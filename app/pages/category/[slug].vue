<script setup lang="ts">
import { queryBrands, queryCategories } from '~/utils/catalog'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const categories = queryCategories()
const category = computed(() => categories.find((item) => item.slug === slug.value))

if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

const { data, pending, error } = await useAsyncData(
  () => `category-brands-${slug.value}`,
  () =>
    Promise.resolve(
      queryBrands({
        category: slug.value,
        page_size: 48,
      }),
    ),
  { watch: [slug] },
)

const jsonLd = computed(() => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${category.value?.name} Brands`,
  description: category.value?.description,
}))

usePageSeo({
  title: `${category.value.name} Brand Identities`,
  description:
    category.value.description
    || `Browse ${category.value.name} brands with colors, fonts, and logos on BeeFoo.`,
  path: `/category/${category.value.slug}`,
})
</script>

<template>
  <section class="section">
    <JsonLd :data="jsonLd" />
    <div class="page-shell">
      <div class="section__head">
        <div>
          <h2>{{ category?.name }}</h2>
          <p>{{ category?.description }}</p>
        </div>
      </div>

      <div v-if="pending" class="empty-state">
        Loading brands…
      </div>
      <div v-else-if="error" class="error-state">
        Could not load this category.
      </div>
      <div v-else-if="!data?.items?.length" class="empty-state">
        No brands in this category yet.
      </div>
      <div v-else class="brand-grid">
        <BrandCard
          v-for="brand in data.items"
          :key="brand.id"
          :brand="brand"
        />
      </div>
    </div>
  </section>
</template>
