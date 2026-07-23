import { queryAllBrands, queryCategories } from '~/utils/catalog'
import { canonicalComparePath, queryCuratedComparePairs } from '~/utils/compare'

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
  ...queryCuratedComparePairs().map(([a, b]) => ({
    loc: canonicalComparePath(a, b),
    priority: 0.5,
  })),
])
