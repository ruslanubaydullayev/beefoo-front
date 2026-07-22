<script setup lang="ts">
const props = withDefaults(defineProps<{ text?: string }>(), {
  // Words wrapped in *asterisks* are rendered italic.
  text: 'Good design is obvious. Great design is *colorful.*',
})

const words = computed(() =>
  props.text.split(/\s+/).map((raw) => {
    const italic = raw.includes('*')
    return raw.replaceAll('*', '').split('').map(char => ({ char, italic }))
  }),
)

const PALETTE: [string, string][] = [
  ['#b4e07a', '#5fae3c'],
  ['#f9c46b', '#ef8f3a'],
  ['#f6b3cd', '#e2699f'],
  ['#c99ad6', '#7d3c98'],
  ['#ffd9a0', '#f2957d'],
  ['#a9dfbf', '#52b788'],
]

const bursts = reactive<Record<string, boolean>>({})
const blobStyles = reactive<Record<string, Record<string, string>>>({})
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function burst(key: string) {
  const pending = timers.get(key)
  if (pending) clearTimeout(pending)

  if (!bursts[key]) {
    const pair = PALETTE[Math.floor(Math.random() * PALETTE.length)] ?? PALETTE[0]!
    blobStyles[key] = {
      '--blob-a': pair[0],
      '--blob-b': pair[1],
      '--blob-x': `${Math.round(Math.random() * 44 - 22)}%`,
      '--blob-y': `${Math.round(Math.random() * 44 - 22)}%`,
      '--blob-r': (1 + Math.random() * 0.7).toFixed(2),
    }
    bursts[key] = true
  }

  timers.set(
    key,
    setTimeout(() => {
      bursts[key] = false
      timers.delete(key)
    }, 3000),
  )
}

function onPointer(event: PointerEvent) {
  const hit = document.elementFromPoint(event.clientX, event.clientY)
  const key = hit?.closest<HTMLElement>('[data-burst-key]')?.dataset.burstKey
  if (key) burst(key)
}

onBeforeUnmount(() => {
  timers.forEach(timer => clearTimeout(timer))
})
</script>

<template>
  <div class="kinetic" @pointermove="onPointer" @pointerdown="onPointer">
    <p class="kinetic__line">
      <span v-for="(word, wi) in words" :key="wi" class="kinetic__word">
        <span
          v-for="(letter, li) in word"
          :key="li"
          class="kinetic__letter"
          :class="{ 'is-burst': bursts[`${wi}-${li}`], 'is-italic': letter.italic }"
          :style="blobStyles[`${wi}-${li}`]"
          :data-burst-key="`${wi}-${li}`"
        >
          <span class="kinetic__blob" />
          <span class="kinetic__char">{{ letter.char }}</span>
        </span>
      </span>
    </p>
  </div>
</template>

<style scoped>
.kinetic {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  user-select: none;
  -webkit-user-select: none;
  cursor: default;
}

.kinetic__line {
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 0.28em;
  max-width: 12ch;
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.4vw, 2.9rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.04em;
  text-align: center;
  color: var(--ink);
}

.kinetic__word {
  display: inline-flex;
}

.kinetic__letter {
  position: relative;
  display: inline-block;
}

.kinetic__char {
  position: relative;
  z-index: 1;
  display: inline-block;
  transition:
    transform 1.3s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 1.3s ease,
    filter 1.3s ease;
}

.is-italic .kinetic__char {
  font-style: italic;
}

.is-burst .kinetic__char {
  transform: scale(1.6);
  opacity: 0;
  filter: blur(5px);
  transition-duration: 0.18s;
}

.kinetic__blob {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1.7em;
  height: 1.45em;
  margin: -0.725em 0 0 -0.85em;
  border-radius: 50%;
  background: radial-gradient(
    circle at 38% 36%,
    var(--blob-a, #f9c46b) 0%,
    var(--blob-b, #ef8f3a) 55%,
    transparent 78%
  );
  filter: blur(9px);
  opacity: 0;
  transform: scale(0.2);
  pointer-events: none;
  transition:
    transform 1.1s ease,
    opacity 1.1s ease;
}

.is-burst .kinetic__blob {
  opacity: 0.95;
  transform: translate(var(--blob-x, 0%), var(--blob-y, 0%)) scale(var(--blob-r, 1.2));
  transition:
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .kinetic__char,
  .kinetic__blob {
    transition-duration: 0.01s !important;
  }
}
</style>
