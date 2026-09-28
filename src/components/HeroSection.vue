<template>
  <!-- The id ("hero") is passed in from App.vue and lands on this <section> -->
  <section class="section hero">
    <!-- Background slides: stacked on top of each other, the active one fades in -->
    <div class="slides" aria-hidden="true">
      <div v-for="(image, i) in images" :key="image" class="slide" :class="{ active: i === current }" :style="{ backgroundImage: `url(${image})` }"></div>
    </div>

    <!-- Dark tint over the images so text on top stays readable -->
    <div class="overlay"></div>

    <!-- Name + rotating title (the title changes together with the slide) -->
    <div class="content">
      <h1 class="name">Oleg Koltsov</h1>
      <div class="title-wrap">
        <Transition name="title" mode="out-in">
          <p :key="current" class="title">{{ titles[current % titles.length] }}</p>
        </Transition>
      </div>
    </div>

    <!-- Dots: show the current slide, click to jump -->
    <div class="dots">
      <button v-for="(image, i) in images" :key="image" class="dot" :class="{ active: i === current }" :aria-label="`Show slide ${i + 1}`" @click="goTo(i)"></button>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import hero1 from '../assets/hero/hero-1.jpg';
import hero2 from '../assets/hero/hero-2.jpg';
import hero3 from '../assets/hero/hero-3.jpg';

const images = [hero1, hero2, hero3];
const titles = ['Tehniline spetsialist', 'Klienditugi', 'Projektijuht']; // one per slide
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
  background-size: cover;      /* always fills the screen, crops instead of stretching */
  background-position: center;
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 1.4s ease, transform 7s ease-out;
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
    linear-gradient(180deg, rgba(5, 8, 13, 0.55) 0%, rgba(5, 8, 13, 0.35) 45%, rgba(5, 8, 13, 0.9) 100%),
    radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08), transparent 55%);
}

/* ── Content ─────────────────────────────────────────────── */
.content {
  position: relative; /* sits above slides and overlay */
  z-index: 1;
  text-align: center;
  padding: 0 24px;
}

/* Name: big neon cyan text, fades up on page load */
.name {
  margin: 0;
  font-size: clamp(2.6rem, 9vw, 6rem);
  font-weight: 900;
  letter-spacing: clamp(1px, 0.5vw, 6px);
  line-height: 1.2;

  color: var(--neon-cyan);
  text-shadow: 0 0 6px rgba(0, 240, 255, 0.8), 0 0 18px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3);

  animation: name-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes name-in {
  from {
    opacity: 0;
    transform: translateY(24px);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Fixed-height box so the page doesn't jump while titles swap */
.title-wrap {
  height: clamp(2.2rem, 5vw, 3.2rem);
  margin-top: clamp(8px, 2vh, 18px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  margin: 0;
  font-size: clamp(1.1rem, 3.2vw, 1.9rem);
  font-weight: 600;
  letter-spacing: clamp(1px, 0.4vw, 4px);
  text-transform: uppercase;
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
}

/* Title swap: old one slides up and fades out, new one rises in from below */
.title-enter-active,
.title-leave-active {
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.5s ease;
}
.title-enter-from {
  opacity: 0;
  transform: translateY(100%);
  filter: blur(4px);
}
.title-leave-to {
  opacity: 0;
  transform: translateY(-100%);
  filter: blur(4px);
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
  transition: background 0.3s ease, box-shadow 0.3s ease, width 0.3s ease;
}

.dot:hover {
  background: rgba(0, 240, 255, 0.4);
}

/* Active dot stretches into a glowing pill */
.dot.active {
  width: 28px;
  border-radius: 999px;
  background: var(--neon-cyan);
  box-shadow: var(--glow-cyan);
}

/* Respect users who prefer less motion: no zoom, quicker fade */
@media (prefers-reduced-motion: reduce) {
  .slide {
    transform: none;
    transition: opacity 0.4s ease;
  }
  .name {
    animation: none;
  }
  .title-enter-active,
  .title-leave-active {
    transition: opacity 0.3s ease;
  }
  .title-enter-from,
  .title-leave-to {
    transform: none;
    filter: none;
  }
}
</style>