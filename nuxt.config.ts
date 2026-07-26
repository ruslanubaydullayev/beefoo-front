// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/sitemap', '@nuxt/fonts'],



  site: {
    url: process.env.NUXT_SITE_URL || 'https://beefoo.art',
    name: 'BeeFoo',
  },

  sitemap: {
    sources: ['/api/__sitemap__/urls'],
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'BeeFoo',
      titleTemplate: '%s · BeeFoo',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'BeeFoo is a searchable visual identity database for brand colors, fonts, logos, and design systems.',
        },
        { name: 'theme-color', content: '#12202a' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_SITE_URL || 'http://localhost:3000',
      siteName: 'BeeFoo',
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/tools': { prerender: true },
    '/tools/**': { prerender: true },
    '/api/tools/scan-site': { prerender: false },
    // SWR only in production — avoids stale brand pages during local development.
    ...(process.env.NODE_ENV === 'production'
      ? {
          '/brands': { swr: 60 },
          '/brand/**': { swr: 60 },
          '/category/**': { swr: 60 },
          '/compare/**': { swr: 60 },
        }
      : {}),
  },
})

