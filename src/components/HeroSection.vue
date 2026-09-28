<template>
  <!-- The id ("hero") is passed in from App.vue and lands on this <section> -->
  <section class="section hero">
    <!-- Background slides: stacked on top of each other, the active one fades in -->
    <div class="slides" aria-hidden="true">
      <div
        v-for="(image, i) in images"
        :key="image"
        class="slide"
        :class="{ active: i === current }"
        :style="{ backgroundImage: `url(${image})` }"
      ></div>
    </div>

    <!-- Dark + neon tint over the images so text on top stays readable -->
    <div class="overlay"></div>

    <!-- Hero content (placeholder for now) -->
    <div class="content">
      <h2>Hero</h2>
    </div>

    <!-- Dots: show the current slide, click to jump -->
    <div class="dots">
      <button
        v-for="(image, i) in images"
        :key="image"
        class="dot"
        :class="{ active: i === current }"
        :aria-label="`Show slide ${i + 1}`"
        @click="goTo(i)"
      ></button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import hero1 from "../assets/hero/hero-1.jpg";
import hero2 from "../assets/hero/hero-2.jpg";
import hero3 from "../assets/hero/hero-3.jpg";

const images = [hero1, hero2, hero3];
const INTERVAL = 6000; // ms each slide stays on screen

const current = ref(0);
let timer = null;

const next = () => {
  current.value = (current.value + 1) % images.length;
};

const start = () => {
  stop();
  timer = setInterval(next, INTERVAL);
};

const stop = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

// Clicking a dot jumps to that slide and restarts the timer
const goTo = (i) => {
  current.value = i;
  start();
};

onMounted(start);
onBeforeUnmount(stop);
</script>

<style scoped>
.hero {
  position: relative;
  background: var(--bg);
}

/* ── Slides ──────────────────────────────────────────────── */
.slides {
  position: absolute;
  inset: 0; /* covers the whole section, also behind the top bar */
}

.slide {
  position: absolute;
  inset: 0;
  background-size: cover; /* always fills the screen, crops instead of stretching */
  background-position: center;
  opacity: 0;
  transform: scale(1.08);
  transition:
    opacity 1.4s ease,
    transform 7s ease-out;
}

/* Active slide fades in and slowly zooms out (subtle "Ken Burns" effect) */
.slide.active {
  opacity: 1;
  transform: scale(1);
}

/* ── Overlay ─────────────────────────────────────────────── */
.overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(7, 6, 13, 0.55) 0%,
      rgba(7, 6, 13, 0.35) 45%,
      rgba(7, 6, 13, 0.9) 100%
    ),
    radial-gradient(
      circle at 20% 30%,
      rgba(0, 240, 255, 0.12),
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 43, 214, 0.12),
      transparent 50%
    );
}

/* ── Content ─────────────────────────────────────────────── */
.content {
  position: relative; /* sits above slides and overlay */
  z-index: 1;
  text-align: center;
  padding: 0 24px;
}

/* ── Dots ────────────────────────────────────────────────── */
.dots {
  position: absolute;
  z-index: 1;
  bottom: clamp(20px, 5vh, 40px);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}

.dot {
  width: 10px;
  height: 10px;
  padding: 0;
  border: 1px solid var(--neon-cyan);
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease,
    width 0.3s ease,
    border-color 0.3s ease;
}

.dot:hover {
  background: rgba(0, 240, 255, 0.4);
}

/* Active dot stretches into a glowing pink pill */
.dot.active {
  width: 28px;
  border-radius: 999px;
  border-color: var(--neon-pink);
  background: var(--neon-pink);
  box-shadow: var(--glow-pink);
}

/* Respect users who prefer less motion: no zoom, quicker fade */
@media (prefers-reduced-motion: reduce) {
  .slide {
    transform: none;
    transition: opacity 0.4s ease;
  }
}
</style>
