import { queryAllBrands, queryCategories } from '~/utils/catalog'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')

  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0' },
    { loc: `${siteUrl}/brands`, priority: '0.9' },
    { loc: `${siteUrl}/search`, priority: '0.7' },
    ...queryCategories().map((category) => ({
      loc: `${siteUrl}/category/${category.slug}`,
      priority: '0.8',
    })),
    ...queryAllBrands().map((brand) => ({
      loc: `${siteUrl}/brand/${brand.slug}`,
      priority: '0.6',
    })),
  ]

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (entry) =>
        `<url><loc>${entry.loc}</loc><priority>${entry.priority}</priority></url>`,
    ),
    '</urlset>',
  ].join('')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  return body
})
