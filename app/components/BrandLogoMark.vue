<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
  alt: string
  color?: string | null
  size?: number
}>(), {
  color: null,
  size: 48,
})

const tinted = computed(() => Boolean(props.color && isTintableLogo(props.src)))

const tintStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  backgroundColor: props.color || '#000000',
  WebkitMaskImage: `url("${props.src}")`,
  maskImage: `url("${props.src}")`,
}))
</script>

<template>
  <span
    v-if="tinted"
    class="brand-logo-mark brand-logo-mark--tinted"
    role="img"
    :aria-label="alt"
    :style="tintStyle"
  />
  <img
    v-else
    class="brand-logo-mark"
    :src="src"
    :alt="alt"
    :width="size"
    :height="size"
    loading="lazy"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
</template>
