<script setup lang="ts">
import type { ToastTone } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

function toneClass(tone: ToastTone) {
  return tone === 'error' ? 'toast--error' : 'toast--success'
}
</script>

<template>
  <div class="toast-stack" aria-live="polite" aria-relevant="additions">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="toneClass(toast.tone)"
      role="status"
    >
      <span>{{ toast.message }}</span>
      <button
        type="button"
        class="toast__close"
        aria-label="Dismiss notification"
        @click="dismiss(toast.id)"
      >
        ×
      </button>
    </div>
  </div>
</template>
