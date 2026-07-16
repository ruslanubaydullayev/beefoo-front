// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'BeeCoo',
      titleTemplate: '%s · BeeCoo',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'BeeCoo is a searchable visual identity database for brand colors, fonts, logos, and design systems.',
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
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000/api/v1',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: 'BeeCoo',
    },
  },

  routeRules: {
    '/': { prerender: true },
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

