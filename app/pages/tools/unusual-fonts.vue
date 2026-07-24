<script setup lang="ts">
import { FANCY_STYLES, transformAll } from '~/utils/fancyText'

const DEFAULT = 'make your keyboard blush with pride'
const text = ref(DEFAULT)
const toast = useToast()

const results = computed(() => transformAll(text.value.trim() || DEFAULT))

async function copyStyle(name: string, value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${name}`)
  }
  catch {
    toast.error('Could not copy to clipboard')
  }
}

const siteUrl = useRuntimeConfig().public.siteUrl as string

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Unusual Fonts — Fancy Text & Username Generator',
    description:
      'Free unusual font generator to make beautiful usernames, Gothic text, and stylized Unicode fonts you can copy and paste anywhere.',
    url: `${siteUrl}/tools/unusual-fonts`,
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How to make a username with a beautiful font?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Type your username in the box above, pick a beautiful Unicode style such as Cursive, Script, Bold, or Yearbook, then tap Copy and paste it into Instagram, TikTok, Discord, or any bio.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to make a Gothic username?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Enter your name, choose the Gothic or Gothic Bold style from the results, copy the unusual text, and paste it as your username or display name wherever Unicode is supported.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to make unusual font text?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Use this free unusual font generator: write any phrase, browse dozens of Unicode font styles (bold, italic, cursive, gothic, circled, and more), then copy the unusual text in one click.',
        },
      },
      {
        '@type': 'Question',
        name: 'How to make unusual text for social media?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Generate unusual text with this tool, copy a style you like, and paste it into usernames, bios, comments, or messages. The fonts are Unicode characters, so they work in most apps without installing a font file.',
        },
      },
    ],
  },
]

usePageSeo({
  title: 'Unusual Font Generator — Beautiful & Gothic Usernames',
  description:
    'How to make a username with a beautiful font, a Gothic username, or unusual text: free unusual font generator with cursive, gothic, bold, and more Unicode styles to copy and paste.',
  path: '/tools/unusual-fonts',
})
</script>

<template>
  <section class="section">
    <div class="page-shell">
      <JsonLd :data="jsonLd" />

      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <NuxtLink to="/tools">Tools</NuxtLink>
        <span aria-hidden="true">/</span>
        <span>Unusual fonts</span>
      </nav>

      <div class="section__head">
        <div>
          <h1 class="fonts-tool__title">Unusual font generator</h1>
          <p>
            How to make unusual text and beautiful usernames in seconds — type once,
            get {{ FANCY_STYLES.length }} Unicode styles including Gothic, cursive, and bold.
            Copy and paste into bios, Discord, Instagram, and more.
          </p>
        </div>
      </div>

      <div class="tool-panel tool-panel--fonts">
        <label class="fonts-tool__label" for="fancy-text-input">
          Type a username or any text
        </label>
        <textarea
          id="fancy-text-input"
          v-model="text"
          class="fonts-tool__input"
          rows="3"
          maxlength="280"
          placeholder="type your username here"
          spellcheck="false"
        />
        <p class="fonts-tool__meta">
          {{ text.length }}/280 · {{ results.length }} unusual fonts
        </p>
      </div>

      <div class="fonts-grid">
        <article
          v-for="item in results"
          :key="item.style.id"
          class="fonts-card"
        >
          <div class="fonts-card__head">
            <h3>{{ item.style.name }}</h3>
            <button
              type="button"
              class="fonts-card__copy"
              :aria-label="`Copy ${item.style.name}`"
              @click="copyStyle(item.style.name, item.output)"
            >
              Copy
            </button>
          </div>
          <p class="fonts-card__preview" lang="en">{{ item.output }}</p>
        </article>
      </div>

      <div class="fonts-seo">
        <div class="section__head">
          <div>
            <h2>How to make unusual fonts & usernames</h2>
            <p>Quick answers for the most common searches.</p>
          </div>
        </div>

        <div class="fonts-seo__list">
          <article>
            <h3>How to make a username with a beautiful font</h3>
            <p>
              Enter the username you want above, pick a stylish option like
              <strong>Cursive</strong>, <strong>Script</strong>, or <strong>Bold</strong>,
              then hit Copy. Paste the beautiful font into your profile name or bio —
              no app install needed.
            </p>
          </article>

          <article>
            <h3>How to make a Gothic username</h3>
            <p>
              Type your name, scroll to <strong>Gothic</strong> or
              <strong>Gothic Bold</strong>, copy the fraktur-style text, and use it
              as a Gothic username on Discord, Steam, TikTok, or anywhere Unicode works.
            </p>
          </article>

          <article>
            <h3>How to make unusual font text</h3>
            <p>
              This unusual font generator turns normal letters into Unicode “fonts.”
              Write any phrase, browse the styles, and copy the unusual font that fits
              your vibe — great for captions, nicknames, and headers.
            </p>
          </article>

          <article>
            <h3>How to make unusual text</h3>
            <p>
              Unusual text is just special Unicode characters. Use the box at the top,
              choose a look (italic, circled Yearbook, glitchy, upside down, and more),
              copy once, and paste your unusual text wherever you write.
            </p>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
