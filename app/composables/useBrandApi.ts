import type {
  BrandDetail,
  BrandListResponse,
  Category,
  SearchResponse,
} from '~/types/brand'

export function useBrandApi() {
  function listBrands(
    params: Record<string, string | number | boolean | undefined> = {},
    keyPrefix = 'brands',
  ) {
    return useFetch<BrandListResponse>(apiUrl('/brands'), {
      query: params,
      // Prefix keeps list contexts (home/category/related) from sharing one cache entry.
      key: `${keyPrefix}-${JSON.stringify(params)}`,
    })
  }

  function getBrand(slug: MaybeRefOrGetter<string>) {
    const slugRef = computed(() => toValue(slug))
    return useFetch<BrandDetail>(() => apiUrl(`/brands/${slugRef.value}`), {
      watch: [slugRef],
    })
  }

  function searchBrands(params: Record<string, string | number | undefined>) {
    return useFetch<SearchResponse>(apiUrl('/search'), {
      query: params,
      key: `search-${JSON.stringify(params)}`,
    })
  }

  function listCategories() {
    return useFetch<Category[]>(apiUrl('/categories'), {
      key: 'categories',
    })
  }

  return {
    listBrands,
    getBrand,
    searchBrands,
    listCategories,
  }
}
