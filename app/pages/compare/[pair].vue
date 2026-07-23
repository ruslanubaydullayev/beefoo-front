<script setup lang="ts">
import type { BrandDetail } from '~/types/brand'
import { queryBrand, queryBrands } from '~/utils/catalog'
import {
  canonicalComparePath,
  canonicalCompareSlugs,
  parseComparePair,
  queryComparePair,
  queryRelatedComparePairs,
} from '~/utils/compare'

const route = useRoute()
const pairParam = computed(() => String(route.params.pair || ''))
const parsed = computed(() => parseComparePair(pairParam.value))

if (!parsed.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Comparison not found',
  })
}

const [rawLeft, rawRight] = parsed.value
const [leftSlug, rightSlug] = canonicalCompareSlugs(rawLeft, rawRight)
const canonicalPath = `/compare/${leftSlug}-vs-${rightSlug}`
const requestedPath = `/compare/${rawLeft}-vs-${rawRight}`

if (requestedPath !== canonicalPath) {
  await navigateTo(canonicalPath, { redirectCode: 301 })
}

const { data: pageData, error } = await useAsyncData(
  () => `compare-page-${pairParam.value}`,
  async () => {
    const current = parseComparePair(String(route.params.pair || ''))
    if (!current) return null

    const [a, b] = canonicalCompareSlugs(current[0], current[1])
    const path = `/compare/${a}-vs-${b}`
    const pair = queryComparePair(a, b)
    if (!pair) return null

    const curated = queryRelatedComparePairs(a, 4)
      .concat(queryRelatedComparePairs(b, 4))
      .filter((item, index, list) =>
        list.findIndex((entry) => entry.path === item.path) === index
        && item.path !== path,
      )
      .slice(0, 6)

    const categorySlug = pair.left.category?.slug || pair.right.category?.slug
    const categoryRivals = categorySlug
      ? queryBrands({ category: categorySlug, page_size: 12 }).items
          .filter((item) => item.slug !== a && item.slug !== b)
          .slice(0, 4)
          .flatMap((item) => {
            const other = queryBrand(item.slug)
            if (!other) return []
            return [{
              path: canonicalComparePath(a, item.slug),
              other,
              anchor: pair.left.name,
            }]
          })
      : []

    return { pair, curated, categoryRivals, path }
  },
  { watch: [pairParam] },
)

if (error.value || !pageData.value?.pair) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Comparison not found',
  })
}

const left = computed(() => pageData.value!.pair.left)
const right = computed(() => pageData.value!.pair.right)
const resolvedPath = computed(() => pageData.value?.path || canonicalPath)

const siteUrl = useRuntimeConfig().public.siteUrl as string

function primaryLogo(brand: BrandDetail) {
  return brand.logos.find((logo) => logo.is_primary) || brand.logos[0]
}

function primaryColor(brand: BrandDetail) {
  return brand.colors.find((color) => color.is_primary)?.hex
    || brand.colors[0]?.hex
    || null
}

function fontSummary(brand: BrandDetail) {
  if (!brand.fonts.length) return null
  return brand.fonts.map((font) => font.name).join(', ')
}

const title = computed(
  () => `${left.value.name} vs ${right.value.name} — Colors, Fonts & Logos`,
)
const description = computed(() => {
  const industries = [left.value.industry, right.value.industry].filter(Boolean).join(' and ')
  const countries = [left.value.country, right.value.country].filter(Boolean).join(' / ')
  const palette = `${left.value.colors.length} vs ${right.value.colors.length} colors`
  return `Compare ${left.value.name} and ${right.value.name} brand identity: colors, fonts, logos, industry, and country. ${industries ? `${industries}. ` : ''}${countries ? `${countries}. ` : ''}${palette} on BeeFoo.`
})

const jsonLd = computed(() => [
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: `${siteUrl}/brands` },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${left.value.name} vs ${right.value.name}`,
        item: `${siteUrl}${resolvedPath.value}`,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title.value,
    description: description.value,
    url: `${siteUrl}${resolvedPath.value}`,
  },
])

usePageSeo({
  title: title.value,
  description: description.value,
  path: resolvedPath.value,
  type: 'article',
})

const toast = useToast()

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    toast.success(`Copied ${value}`)
  }
  catch {
    toast.error('Could not copy to clipboard')
  }
}

function pairLabel(path: string, fallbackOther: BrandDetail) {
  const slugs = parseComparePair(path.replace('/compare/', ''))
  if (!slugs) return fallbackOther.name
  const a = queryBrand(slugs[0])
  const b = queryBrand(slugs[1])
  if (a && b) return `${a.name} vs ${b.name}`
  return fallbackOther.name
}

const moreComparisons = computed(() => {
  const curated = pageData.value?.curated || []
  const fromCategory = (pageData.value?.categoryRivals || [])
    .filter((item) => !curated.some((entry) => entry.path === item.path))
    .slice(0, Math.max(0, 6 - curated.length))

  return [
    ...curated.map((item) => ({
      path: item.path,
      label: pairLabel(item.path, item.other),
      other: item.other,
    })),
    ...fromCategory.map((item) => ({
      path: item.path,
      label: `${item.anchor} vs ${item.other.name}`,
      other: item.other,
    })),
  ].slice(0, 6)
})
</script>

<template>
  <div>
    <JsonLd :data="jsonLd" />

    <section class="compare-hero">
      <div class="page-shell">
        <nav class="meta-row" aria-label="Breadcrumb" style="margin-bottom: 1rem;">
          <NuxtLink class="chip" to="/">Home</NuxtLink>
          <NuxtLink class="chip" to="/brands">Brands</NuxtLink>
          <span class="chip is-active">Compare</span>
        </nav>

        <div class="compare-hero__grid">
          <NuxtLink :to="`/brand/${left.slug}`" class="compare-hero__brand">
            <BrandLogoMark
              :src="primaryLogo(left)?.image_url || `/logos/${left.slug}.svg`"
              :alt="`${left.name} logo`"
              :color="primaryColor(left)"
              :size="48"
            />
            <span>{{ left.name }}</span>
          </NuxtLink>

          <div class="compare-hero__vs" aria-hidden="true">vs</div>

          <NuxtLink :to="`/brand/${right.slug}`" class="compare-hero__brand">
            <BrandLogoMark
              :src="primaryLogo(right)?.image_url || `/logos/${right.slug}.svg`"
              :alt="`${right.name} logo`"
              :color="primaryColor(right)"
              :size="48"
            />
            <span>{{ right.name }}</span>
          </NuxtLink>
        </div>

        <h1 class="compare-hero__title">{{ left.name }} vs {{ right.name }}</h1>
        <p class="compare-hero__lede">
          Side-by-side brand identity: colors, fonts, logos, industry, founded year, and country.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="page-shell">
        <div class="compare-table" role="table" aria-label="Brand comparison">
          <div class="compare-table__head" role="row">
            <div class="compare-table__label" role="columnheader"> </div>
            <div class="compare-table__cell" role="columnheader">
              <NuxtLink :to="`/brand/${left.slug}`">{{ left.name }}</NuxtLink>
            </div>
            <div class="compare-table__cell" role="columnheader">
              <NuxtLink :to="`/brand/${right.slug}`">{{ right.name }}</NuxtLink>
            </div>
          </div>

          <div class="compare-table__row" role="row">
            <div class="compare-table__label" role="rowheader">Logo</div>
            <div class="compare-table__cell" role="cell">
              <div class="compare-logo">
                <BrandLogoMark
                  :src="primaryLogo(left)?.image_url || `/logos/${left.slug}.svg`"
                  :alt="`${left.name} logo`"
                  :color="primaryColor(left)"
                  :size="56"
                />
              </div>
            </div>
            <div class="compare-table__cell" role="cell">
              <div class="compare-logo">
                <BrandLogoMark
                  :src="primaryLogo(right)?.image_url || `/logos/${right.slug}.svg`"
                  :alt="`${right.name} logo`"
                  :color="primaryColor(right)"
                  :size="56"
                />
              </div>
            </div>
          </div>

          <div class="compare-table__row" role="row">
            <div class="compare-table__label" role="rowheader">Colors</div>
            <div class="compare-table__cell" role="cell">
              <div
                v-if="left.colors.length"
                class="palette-strip compare-palette"
                :style="{ gridTemplateColumns: `repeat(${Math.min(left.colors.length, 6)}, minmax(0, 1fr))` }"
                aria-hidden="true"
              >
                <span
                  v-for="color in left.colors.slice(0, 6)"
                  :key="color.id"
                  :style="{ background: color.hex }"
                />
              </div>
              <ul v-if="left.colors.length" class="compare-hex-list">
                <li v-for="color in left.colors" :key="`l-${color.id}`">
                  <button type="button" class="chip" @click="copyText(color.hex)">
                    <code>{{ color.hex }}</code>
                  </button>
                </li>
              </ul>
              <span v-else class="compare-empty">—</span>
            </div>
            <div class="compare-table__cell" role="cell">
              <div
                v-if="right.colors.length"
                class="palette-strip compare-palette"
                :style="{ gridTemplateColumns: `repeat(${Math.min(right.colors.length, 6)}, minmax(0, 1fr))` }"
                aria-hidden="true"
              >
                <span
                  v-for="color in right.colors.slice(0, 6)"
                  :key="color.id"
                  :style="{ background: color.hex }"
                />
              </div>
              <ul v-if="right.colors.length" class="compare-hex-list">
                <li v-for="color in right.colors" :key="`r-${color.id}`">
                  <button type="button" class="chip" @click="copyText(color.hex)">
                    <code>{{ color.hex }}</code>
                  </button>
                </li>
              </ul>
              <span v-else class="compare-empty">—</span>
            </div>
          </div>

          <div class="compare-table__row" role="row">
            <div class="compare-table__label" role="rowheader">Fonts</div>
            <div class="compare-table__cell" role="cell">
              <span v-if="fontSummary(left)">{{ fontSummary(left) }}</span>
              <span v-else class="compare-empty">Not recorded</span>
            </div>
            <div class="compare-table__cell" role="cell">
              <span v-if="fontSummary(right)">{{ fontSummary(right) }}</span>
              <span v-else class="compare-empty">Not recorded</span>
            </div>
          </div>

          <div class="compare-table__row" role="row">
            <div class="compare-table__label" role="rowheader">Industry</div>
            <div class="compare-table__cell" role="cell">
              <span v-if="left.industry">{{ left.industry }}</span>
              <span v-else class="compare-empty">—</span>
            </div>
            <div class="compare-table__cell" role="cell">
              <span v-if="right.industry">{{ right.industry }}</span>
              <span v-else class="compare-empty">—</span>
            </div>
          </div>

          <div class="compare-table__row" role="row">
            <div class="compare-table__label" role="rowheader">Founded</div>
            <div class="compare-table__cell" role="cell">
              <span v-if="left.founded_year">{{ left.founded_year }}</span>
              <span v-else class="compare-empty">Not recorded</span>
            </div>
            <div class="compare-table__cell" role="cell">
              <span v-if="right.founded_year">{{ right.founded_year }}</span>
              <span v-else class="compare-empty">Not recorded</span>
            </div>
          </div>

          <div class="compare-table__row" role="row">
            <div class="compare-table__label" role="rowheader">Country</div>
            <div class="compare-table__cell" role="cell">
              <span v-if="left.country">{{ left.country }}</span>
              <span v-else class="compare-empty">—</span>
            </div>
            <div class="compare-table__cell" role="cell">
              <span v-if="right.country">{{ right.country }}</span>
              <span v-else class="compare-empty">—</span>
            </div>
          </div>
        </div>

        <div class="compare-brand-links">
          <NuxtLink class="btn btn--ghost" :to="`/brand/${left.slug}`">
            View {{ left.name }}
          </NuxtLink>
          <NuxtLink class="btn btn--ghost" :to="`/brand/${right.slug}`">
            View {{ right.name }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <section v-if="moreComparisons.length" class="section">
      <div class="page-shell">
        <div class="section__head">
          <div>
            <h2>More comparisons</h2>
            <p>Other brand identity matchups worth checking.</p>
          </div>
        </div>
        <div class="compare-more">
          <NuxtLink
            v-for="item in moreComparisons"
            :key="item.path"
            :to="item.path"
            class="compare-more__link"
          >
            <BrandLogoMark
              :src="item.other.primary_logo_url || `/logos/${item.other.slug}.svg`"
              :alt="`${item.other.name} logo`"
              :color="item.other.primary_color"
              :size="28"
            />
            <span>{{ item.label }}</span>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
