import type { BrandDetail } from '~/types/brand'
import curatedPairs from '~/data/compare-pairs.json'
import { queryBrand } from '~/utils/catalog'

export type ComparePairSlugs = [string, string]

export function parseComparePair(param: string): ComparePairSlugs | null {
  const raw = String(param || '').trim().toLowerCase()
  if (!raw.includes('-vs-')) return null

  const parts = raw.split('-vs-')
  if (parts.length !== 2) return null

  const a = parts[0]?.trim()
  const b = parts[1]?.trim()
  if (!a || !b || a === b) return null

  return [a, b]
}

export function canonicalCompareSlugs(a: string, b: string): ComparePairSlugs {
  return a < b ? [a, b] : [b, a]
}

export function canonicalComparePath(a: string, b: string): string {
  const [left, right] = canonicalCompareSlugs(a, b)
  return `/compare/${left}-vs-${right}`
}

export function queryComparePair(
  a: string,
  b: string,
): { left: BrandDetail, right: BrandDetail } | null {
  const left = queryBrand(a)
  const right = queryBrand(b)
  if (!left || !right || left.slug === right.slug) return null
  return { left, right }
}

/** Curated rival pairs, always returned in canonical slug order. */
export function queryCuratedComparePairs(): ComparePairSlugs[] {
  const seen = new Set<string>()
  const pairs: ComparePairSlugs[] = []

  for (const entry of curatedPairs as string[][]) {
    if (!Array.isArray(entry) || entry.length < 2) continue
    const a = String(entry[0] || '').trim().toLowerCase()
    const b = String(entry[1] || '').trim().toLowerCase()
    if (!a || !b || a === b) continue
    if (!queryBrand(a) || !queryBrand(b)) continue

    const [left, right] = canonicalCompareSlugs(a, b)
    const key = `${left}-vs-${right}`
    if (seen.has(key)) continue
    seen.add(key)
    pairs.push([left, right])
  }

  return pairs
}

export function queryRelatedComparePairs(
  slug: string,
  limit = 6,
): Array<{ path: string, other: BrandDetail }> {
  const results: Array<{ path: string, other: BrandDetail }> = []
  const seen = new Set<string>()

  for (const [a, b] of queryCuratedComparePairs()) {
    if (a !== slug && b !== slug) continue
    const otherSlug = a === slug ? b : a
    if (seen.has(otherSlug)) continue
    const other = queryBrand(otherSlug)
    if (!other) continue
    seen.add(otherSlug)
    results.push({ path: canonicalComparePath(slug, otherSlug), other })
    if (results.length >= limit) break
  }

  return results
}
