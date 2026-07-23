<script setup lang="ts">
defineProps<{
  name: 'converter' | 'contrast' | 'scanner' | 'palette'
}>()
</script>

<template>
  <span class="tool-icon" :class="`tool-icon--${name}`" aria-hidden="true">
    <!-- Color format swap -->
    <svg v-if="name === 'converter'" viewBox="0 0 48 48" fill="none">
      <rect x="5" y="9" width="17" height="13" rx="3" fill="var(--teal)" />
      <rect x="26" y="26" width="17" height="13" rx="3" fill="var(--honey)" />
      <path d="M27 15.5h11m0 0-3.5-3.5M38 15.5 34.5 19" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M21 32.5H10m0 0 3.5-3.5M10 32.5l3.5 3.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- Light/dark text samples — reads as a contrast check -->
    <svg v-else-if="name === 'contrast'" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="8" width="18" height="32" rx="4" fill="#12202a" />
      <rect x="26" y="8" width="18" height="32" rx="4" fill="#fff" stroke="currentColor" stroke-width="1.5" opacity="0.55" />
      <text x="13" y="29" text-anchor="middle" fill="#fff" font-size="15" font-weight="700" font-family="Syne, Avenir Next, sans-serif">Aa</text>
      <text x="35" y="29" text-anchor="middle" fill="#12202a" font-size="15" font-weight="700" font-family="Syne, Avenir Next, sans-serif">Aa</text>
    </svg>

    <!-- Browser + eyedropper -->
    <svg v-else-if="name === 'scanner'" viewBox="0 0 48 48" fill="none">
      <rect x="5" y="8" width="30" height="24" rx="3.5" stroke="currentColor" stroke-width="2" opacity="0.7" />
      <path d="M5 15h30" stroke="currentColor" stroke-width="2" opacity="0.7" />
      <circle cx="10.5" cy="11.5" r="1.3" fill="var(--teal)" />
      <circle cx="15" cy="11.5" r="1.3" fill="var(--honey)" />
      <circle cx="19.5" cy="11.5" r="1.3" fill="currentColor" opacity="0.3" />
      <path
        d="M29 31.5 38 22.5a3.4 3.4 0 0 1 4.8 4.8L33.8 36.3"
        stroke="var(--teal)"
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M29 31.5 26.2 38.5l7-2.8L29 31.5Z" fill="var(--teal)" />
      <path d="M36.2 24.2 39.5 27.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" opacity="0.4" />
    </svg>

    <!-- Photo + palette chips -->
    <svg v-else viewBox="0 0 48 48" fill="none">
      <rect x="7" y="5" width="34" height="27" rx="3.5" stroke="currentColor" stroke-width="2" opacity="0.7" />
      <path d="M11 26.5 18.5 19l5 5 4.5-4.5L38 30.5" stroke="currentColor" stroke-width="2" stroke-linejoin="round" opacity="0.55" />
      <circle cx="16.5" cy="13.5" r="2.6" fill="var(--honey)" />
      <rect x="10" y="36" width="6.5" height="6.5" rx="1.6" fill="var(--teal)" />
      <rect x="18.5" y="36" width="6.5" height="6.5" rx="1.6" fill="var(--honey)" />
      <rect x="27" y="36" width="6.5" height="6.5" rx="1.6" fill="currentColor" opacity="0.4" />
      <rect x="35.5" y="36" width="6.5" height="6.5" rx="1.6" fill="currentColor" opacity="0.18" />
    </svg>
  </span>
</template>

<style scoped>
.tool-icon {
  display: grid;
  place-items: center;
  width: 3.5rem;
  height: 3.5rem;
  margin-bottom: 0.95rem;
  border-radius: 14px;
  color: var(--ink);
  transition: transform 0.2s ease;
}

.tool-icon svg {
  width: 2.15rem;
  height: 2.15rem;
}

.tool-icon--converter {
  background: rgba(216, 154, 18, 0.14);
}

.tool-icon--contrast {
  background: rgba(18, 32, 42, 0.08);
}

.tool-icon--scanner {
  background: rgba(15, 110, 106, 0.12);
}

.tool-icon--palette {
  background: rgba(216, 154, 18, 0.1);
}

:global(.tool-card:hover) .tool-icon {
  transform: translateY(-1px) scale(1.05);
}
</style>
