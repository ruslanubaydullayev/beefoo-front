import type {
  BrandDetail,
  BrandListItem,
  BrandListResponse,
  Category,
  SearchResponse,
} from '~/types/brand'
import catalog from '~/data/catalog.json'

type ListParams = {
  page?: number
  page_size?: number
  category?: string
  featured?: boolean | string | number
}

const brands = catalog.brands as BrandDetail[]
const categories = catalog.categories as Category[]

function toListItem(brand: BrandDetail): BrandListItem {
  const colors = [...(brand.colors || [])].sort((a, b) => a.sort_order - b.sort_order)
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    country: brand.country,
    industry: brand.industry,
    is_featured: brand.is_featured,
    category: brand.category,
    colors,
    primary_color:
      brand.primary_color
      ?? colors.find((c) => c.is_primary)?.hex
      ?? colors[0]?.hex
      ?? null,
    primary_logo_url:
      brand.primary_logo_url
      ?? brand.logos.find((l) => l.is_primary)?.image_url
      ?? brand.logos[0]?.image_url
      ?? null,
  }
}

function paginate(items: BrandDetail[], page = 1, pageSize = 24): BrandListResponse {
  const total = items.length
  const pages = total ? Math.max(1, Math.ceil(total / pageSize)) : 0
  const safePage = Math.max(1, page)
  const start = (safePage - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize).map(toListItem),
    total,
    page: safePage,
    page_size: pageSize,
    pages,
  }
}

function filterBrands(params: ListParams = {}): BrandDetail[] {
  let items = [...brands]

  if (params.category) {
    items = items.filter((brand) => brand.category?.slug === params.category)
  }

  const featured = params.featured
  if (featured === true || featured === 'true' || featured === 1 || featured === '1') {
    items = items.filter((brand) => brand.is_featured)
  }

  return items.sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

function matchesQuery(brand: BrandDetail, q: string) {
  const needle = q.trim().toLowerCase()
  if (!needle) return false
  return [
    brand.name,
    brand.description,
    brand.industry,
    brand.country,
    brand.category?.name,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(needle))
}

export function queryBrands(params: ListParams = {}): BrandListResponse {
  return paginate(filterBrands(params), Number(params.page || 1), Number(params.page_size || 24))
}

export function queryBrand(slug: string): BrandDetail | null {
  return brands.find((brand) => brand.slug === slug) ?? null
}

export function querySearch(q: string, page = 1, pageSize = 24): SearchResponse {
  const items = brands
    .filter((brand) => matchesQuery(brand, q))
    .sort((a, b) => a.name.localeCompare(b.name))
  const result = paginate(items, page, pageSize)
  return {
    query: q,
    items: result.items,
    total: result.total,
    page: result.page,
    page_size: result.page_size,
    pages: result.pages,
  }
}

export function queryCategories(): Category[] {
  return categories
}

export function queryAllBrands(): BrandDetail[] {
  return brands
}
