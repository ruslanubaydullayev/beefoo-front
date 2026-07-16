<script setup lang="ts">
const props = defineProps<{
  data: Record<string, unknown> | Array<Record<string, unknown>>
}>()

useJsonLd(props.data)
</script>

<template>
  <span hidden aria-hidden="true" />
</template>
