export function usePageSeo(options: {
  title: string
  description: string
  path?: string
  image?: string
  type?: string
}) {
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '')
  const url = `${siteUrl}${options.path || useRoute().path}`
  const image = options.image || `${siteUrl}/og-default.png`

  useSeoMeta({
    title: options.title,
    description: options.description,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: options.type || 'website',
    ogUrl: url,
    ogImage: image,
    twitterCard: 'summary_large_image',
    twitterTitle: options.title,
    twitterDescription: options.description,
    twitterImage: image,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
  })
}
