<script setup lang="ts">
import { queryAllBrands, queryCategories } from '~/utils/catalog'

const brandCount = queryAllBrands().length
const categoryCount = queryCategories().length

usePageSeo({
  title: 'About BeeFoo',
  description:
    'BeeFoo is a visual identity database for designers: brand colors with exact codes, fonts, and logos for hundreds of brands, plus free design tools.',
  path: '/about',
})
</script>

<template>
  <section class="section">
    <div class="page-shell about">
      <div class="section__head">
        <div>
          <h2>About BeeFoo</h2>
          <p>The visual identity database, built for people who work with brands.</p>
        </div>
      </div>

      <div class="about__grid">
        <div class="about__copy">
          <p>
            Every designer knows the ritual: you need a brand's exact red, so you
            screenshot a logo, eyedrop it, and hope it's right. BeeFoo exists so
            you never have to do that again.
          </p>
          <p>
            We catalog the visual identities of the world's best-known brands —
            official colors with HEX, RGB, HSL, and CMYK codes, typography, and
            logos — in clean, searchable pages. Whether you're matching a
            client's brand, studying how great identities are built, or just
            curious what shade of green Starbucks actually uses, it's all here.
          </p>
          <p>
            Alongside the database we build small, free
            <NuxtLink to="/tools">tools</NuxtLink> for everyday design work,
            like a color format converter and a WCAG contrast checker. More are
            on the way.
          </p>
          <p>
            Spotted a wrong color or a missing brand? The database grows and
            improves constantly — feedback is always welcome.
          </p>
        </div>

        <div class="about__stats">
          <div class="about__stat">
            <strong>{{ brandCount }}</strong>
            <span>brands cataloged</span>
          </div>
          <div class="about__stat">
            <strong>{{ categoryCount }}</strong>
            <span>categories</span>
          </div>
          <div class="about__stat">
            <strong>4</strong>
            <span>color formats per shade</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
