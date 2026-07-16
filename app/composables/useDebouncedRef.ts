export function useDebouncedRef<T>(source: MaybeRefOrGetter<T>, delayMs = 300) {
  const debounced = ref(toValue(source)) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(
    () => toValue(source),
    (value) => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        debounced.value = value
      }, delayMs)
    },
  )

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return debounced
}
