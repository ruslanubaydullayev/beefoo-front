<script setup lang="ts">
import type { BrandListItem } from '~/types/brand'
import { querySearch } from '~/utils/catalog'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  debounceMs?: number
}>(), {
  modelValue: '',
  placeholder: 'Search brands, industries, countries…',
  debounceMs: 300,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
}>()

const root = ref<HTMLElement | null>(null)
const open = ref(false)
const activeIndex = ref(-1)
const loading = ref(false)
const suggestions = ref<BrandListItem[]>([])
let requestId = 0

const query = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})

const debouncedQuery = useDebouncedRef(query, props.debounceMs)

const showPanel = computed(
  () => open.value && query.value.trim().length >= 2,
)

watch(debouncedQuery, (value) => {
  const q = value.trim()
  const id = ++requestId

  if (q.length < 2) {
    suggestions.value = []
    loading.value = false
    open.value = false
    activeIndex.value = -1
    return
  }

  loading.value = true
  open.value = true
  activeIndex.value = -1

  const result = querySearch(q, 1, 8)
  if (id !== requestId) return
  suggestions.value = result.items
  loading.value = false
})

function onSubmit() {
  open.value = false
  emit('submit', query.value.trim())
}

function selectBrand(brand: BrandListItem) {
  query.value = brand.name
  open.value = false
  navigateTo(`/brand/${brand.slug}`)
}

function onKeydown(event: KeyboardEvent) {
  if (!showPanel.value || !suggestions.value.length) {
    if (event.key === 'Escape') open.value = false
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value =
      activeIndex.value <= 0
        ? suggestions.value.length - 1
        : activeIndex.value - 1
  }
  else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    const brand = suggestions.value[activeIndex.value]
    if (brand) selectBrand(brand)
  }
  else if (event.key === 'Escape') {
    open.value = false
    activeIndex.value = -1
  }
}

function onFocus() {
  if (query.value.trim().length >= 2 && (suggestions.value.length || loading.value)) {
    open.value = true
  }
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <form
    ref="root"
    class="search-bar search-bar--suggest"
    role="search"
    @submit.prevent="onSubmit"
  >
    <div class="search-bar__field">
      <input
        v-model="query"
        type="search"
        name="q"
        :placeholder="placeholder"
        role="combobox"
        aria-label="Search brands"
        aria-autocomplete="list"
        aria-controls="search-suggestion-list"
        :aria-expanded="showPanel"
        autocomplete="off"
        @focus="onFocus"
        @keydown="onKeydown"
      >

      <div
        v-if="showPanel"
        id="search-suggestion-list"
        class="search-suggest"
        role="listbox"
        aria-label="Search suggestions"
      >
        <p v-if="loading" class="search-suggest__status">
          Searching…
        </p>
        <p v-else-if="!suggestions.length" class="search-suggest__status">
          No matches
        </p>
        <button
          v-for="(brand, index) in suggestions"
          :key="brand.id"
          type="button"
          class="search-suggest__item"
          :class="{ 'is-active': index === activeIndex }"
          role="option"
          :aria-selected="index === activeIndex"
          @mouseenter="activeIndex = index"
          @click="selectBrand(brand)"
        >
          <BrandLogoMark
            v-if="brand.primary_logo_url"
            :src="brand.primary_logo_url"
            :alt="`${brand.name} logo`"
            :color="brand.primary_color"
            :size="22"
          />
          <span v-else class="search-suggest__fallback">
            {{ brand.name.slice(0, 1) }}
          </span>
          <span class="search-suggest__copy">
            <strong>{{ brand.name }}</strong>
            <small>
              {{ brand.category?.name || brand.industry || 'Brand' }}
              <template v-if="brand.country"> · {{ brand.country }}</template>
            </small>
          </span>
        </button>
      </div>
    </div>

    <button class="btn btn--primary" type="submit">
      Search
    </button>
  </form>
</template>
