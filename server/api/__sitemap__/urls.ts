import { queryAllBrands, queryCategories } from '~/utils/catalog'

export default defineEventHandler(() => [
  ...queryCategories().map(category => ({
    loc: `/category/${category.slug}`,
    priority: 0.8,
  })),
  ...queryAllBrands().map(brand => ({
    loc: `/brand/${brand.slug}`,
    priority: 0.6,
    lastmod: brand.updated_at,
  })),
])
