<script setup lang="ts">
import type { BrandListItem } from '~/types/brand'
import { querySearch } from '~/utils/catalog'

const props = withDefaults(defineProps<{
  modelValue?: BrandListItem | null
  label: string
  placeholder?: string
  excludeSlug?: string | null
  inputId?: string
}>(), {
  modelValue: null,
  placeholder: 'Search brands…',
  excludeSlug: null,
  inputId: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: BrandListItem | null]
}>()

const root = ref<HTMLElement | null>(null)
const query = ref(props.modelValue?.name || '')
const open = ref(false)
const activeIndex = ref(-1)
const suggestions = ref<BrandListItem[]>([])

const debouncedQuery = useDebouncedRef(query, 220)

const showPanel = computed(
  () => open.value && query.value.trim().length >= 2 && !props.modelValue,
)

watch(
  () => props.modelValue,
  (brand) => {
    query.value = brand?.name || ''
  },
)

watch(debouncedQuery, (value) => {
  if (props.modelValue) {
    suggestions.value = []
    return
  }

  const q = value.trim()
  if (q.length < 2) {
    suggestions.value = []
    open.value = false
    activeIndex.value = -1
    return
  }

  open.value = true
  activeIndex.value = -1
  suggestions.value = querySearch(q, 1, 8).items
    .filter((item) => item.slug !== props.excludeSlug)
})

function selectBrand(brand: BrandListItem) {
  emit('update:modelValue', brand)
  query.value = brand.name
  open.value = false
  activeIndex.value = -1
  suggestions.value = []
}

function clear() {
  emit('update:modelValue', null)
  query.value = ''
  open.value = false
  activeIndex.value = -1
  suggestions.value = []
}

function onInput() {
  if (props.modelValue) emit('update:modelValue', null)
}

function onFocus() {
  if (!props.modelValue && query.value.trim().length >= 2) open.value = true
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    open.value = false
    activeIndex.value = -1
    return
  }

  if (!showPanel.value || !suggestions.value.length) return

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
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <div ref="root" class="brand-picker">
    <label :for="inputId">{{ label }}</label>

    <div v-if="modelValue" class="brand-picker__selected">
      <BrandLogoMark
        :src="modelValue.primary_logo_url || `/logos/${modelValue.slug}.svg`"
        :alt="`${modelValue.name} logo`"
        :color="modelValue.primary_color"
        :size="28"
      />
      <div class="brand-picker__copy">
        <strong>{{ modelValue.name }}</strong>
        <small>
          {{ modelValue.category?.name || modelValue.industry || 'Brand' }}
          <template v-if="modelValue.country"> · {{ modelValue.country }}</template>
        </small>
      </div>
      <button type="button" class="brand-picker__clear" aria-label="Clear brand" @click="clear">
        ×
      </button>
    </div>

    <div v-else class="brand-picker__field">
      <input
        :id="inputId"
        v-model="query"
        type="search"
        :placeholder="placeholder"
        autocomplete="off"
        spellcheck="false"
        role="combobox"
        aria-autocomplete="list"
        :aria-expanded="showPanel"
        :aria-controls="inputId ? `${inputId}-list` : undefined"
        @input="onInput"
        @focus="onFocus"
        @keydown="onKeydown"
      >

      <div
        v-if="showPanel"
        :id="inputId ? `${inputId}-list` : undefined"
        class="search-suggest"
        role="listbox"
        :aria-label="`${label} suggestions`"
      >
        <p v-if="!suggestions.length" class="search-suggest__status">
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
            :src="brand.primary_logo_url || `/logos/${brand.slug}.svg`"
            :alt="`${brand.name} logo`"
            :color="brand.primary_color"
            :size="22"
          />
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
  </div>
</template>
