export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = (config.public.apiBase as string).replace(/\/$/, '')

  try {
    const xml = await $fetch<string>(`${apiBase}/sitemap.xml`, {
      responseType: 'text',
    })
    setHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return xml
  }
  catch {
    const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')
    setHeader(event, 'content-type', 'application/xml; charset=utf-8')
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}/</loc></url></urlset>`
  }
})
