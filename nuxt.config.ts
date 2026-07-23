// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/sitemap'],

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
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap',
        },
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
    // SWR only in production — avoids stale brand pages during local development.
    ...(process.env.NODE_ENV === 'production'
      ? {
          '/brands': { swr: 60 },
          '/brand/**': { swr: 60 },
          '/category/**': { swr: 60 },
        }
      : {}),
  },
})

