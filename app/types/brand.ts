export interface Category {
  id: number
  name: string
  slug: string
  description?: string | null
}

export interface BrandColor {
  id: number
  name?: string | null
  hex: string
  rgb?: string | null
  hsl?: string | null
  cmyk?: string | null
  is_primary: boolean
  sort_order: number
}

export interface BrandFont {
  id: number
  name: string
  role?: string | null
  family?: string | null
  fallback?: string | null
  source_url?: string | null
  sort_order: number
}

export interface BrandLogo {
  id: number
  name?: string | null
  image_url: string
  format?: string | null
  variant?: string | null
  is_primary: boolean
  sort_order: number
}

export interface BrandListItem {
  id: number
  name: string
  slug: string
  description?: string | null
  country?: string | null
  industry?: string | null
  is_featured: boolean
  category?: Category | null
  primary_color?: string | null
  primary_logo_url?: string | null
}

export interface BrandDetail {
  id: number
  name: string
  slug: string
  description?: string | null
  website_url?: string | null
  country?: string | null
  industry?: string | null
  founded_year?: number | null
  is_featured: boolean
  meta_title?: string | null
  meta_description?: string | null
  created_at: string
  updated_at: string
  category?: Category | null
  colors: BrandColor[]
  fonts: BrandFont[]
  logos: BrandLogo[]
}

export interface BrandListResponse {
  items: BrandListItem[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface SearchResponse {
  query: string
  items: BrandListItem[]
  total: number
  page: number
  page_size: number
  pages: number
}
