import {
  queryBrand,
  queryBrands,
  queryCategories,
  querySearch,
} from '~/utils/catalog'

/** Local catalog — same surface as the old backend client, no network. */
export function useBrandCatalog() {
  function listBrands(
    params: Record<string, string | number | boolean | undefined> = {},
    keyPrefix = 'brands',
  ) {
    return useAsyncData(
      `${keyPrefix}-${JSON.stringify(params)}`,
      () => Promise.resolve(queryBrands(params)),
    )
  }

  function getBrand(slug: MaybeRefOrGetter<string>) {
    const slugRef = computed(() => toValue(slug))
    return useAsyncData(
      () => `brand-${slugRef.value}`,
      () => Promise.resolve(queryBrand(slugRef.value)),
      { watch: [slugRef] },
    )
  }

  function searchBrands(params: Record<string, string | number | undefined>) {
    return useAsyncData(
      `search-${JSON.stringify(params)}`,
      () =>
        Promise.resolve(
          querySearch(
            String(params.q || ''),
            Number(params.page || 1),
            Number(params.page_size || 24),
          ),
        ),
    )
  }

  function listCategories() {
    return useAsyncData('categories', () => Promise.resolve(queryCategories()))
  }

  return {
    listBrands,
    getBrand,
    searchBrands,
    listCategories,
  }
}
