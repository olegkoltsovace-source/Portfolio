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
      <!-- Each letter is its own <span> so GSAP can animate it separately.
           aria-label keeps the name readable for screen readers. -->
      <h1 ref="nameEl" class="name" aria-label="Oleg Koltsov">
        <template v-for="(word, w) in nameWords" :key="w">
          <span class="word" aria-hidden="true"><span v-for="(char, i) in word" :key="i" class="char" @mouseenter="bounce">{{ char }}</span></span>{{ w < nameWords.length - 1 ? ' ' : '' }}
        </template>
      </h1>
      <div class="title-wrap">
        <Transition name="title" mode="out-in">
          <p :key="current" class="title">{{ titles[current % titles.length] }}</p>
        </Transition>
      </div>
    </div>

    <!-- Magic sparkles that burst out of the letters as they land -->
    <canvas ref="sparkCanvas" class="sparks" aria-hidden="true"></canvas>

    <!-- Dots: show the current slide, click to jump -->
    <div class="dots">
      <button v-for="(image, i) in images" :key="image" class="dot" :class="{ active: i === current }" :aria-label="`Show slide ${i + 1}`" @click="goTo(i)"></button>
    </div>
  </section>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import gsap from 'gsap';
import hero1 from '../assets/hero/hero-1.jpg';
import hero2 from '../assets/hero/hero-2.jpg';
import hero3 from '../assets/hero/hero-3.jpg';

const images = [hero1, hero2, hero3];
const titles = ['Tehniline spetsialist', 'Klienditugi', 'Projektijuht']; // one per slide
const INTERVAL = 6000; // ms each slide stays on screen

const NAME = 'Oleg Koltsov';
const nameWords = NAME.split(' ').map((word) => word.split('')); // [['O','l','e','g'], ['K','o',...]]
const nameEl = ref(null);
const sparkCanvas = ref(null);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let introTl = null;

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

// ── Magic sparkles ────────────────────────────────────────
// A small particle system on its own canvas over the hero. It only runs while sparks are alive.
const SPARK_COLOR = '0, 240, 255'; // the same neon cyan as the rest of the site (RGB)
const SPARKS_PER_LETTER = 26;      // how many sparks each letter throws out when it lands
let sparkCtx = null;
let sparks = [];
let sparkFrame = null;

const resizeSparks = () => {
  const c = sparkCanvas.value;
  if (!c) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  c.width = c.clientWidth * dpr;
  c.height = c.clientHeight * dpr;
  sparkCtx = c.getContext('2d');
  sparkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

// Throw sparks out of one letter
const burst = (el, count = SPARKS_PER_LETTER) => {
  if (!sparkCtx || !el) return;
  const box = el.getBoundingClientRect();
  const origin = sparkCanvas.value.getBoundingClientRect();
  const cx = box.left - origin.left + box.width / 2;
  const cy = box.top - origin.top + box.height / 2;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = gsap.utils.random(2, 7);
    const life = gsap.utils.random(800, 1600);
    sparks.push({
      x: cx + gsap.utils.random(-box.width / 3, box.width / 3),
      y: cy + gsap.utils.random(-box.height / 3, box.height / 3),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: gsap.utils.random(1.4, 3.4),
      star: Math.random() < 0.4, // some sparks are little 4-point twinkle stars
      born: performance.now(),
      life,
      twinkle: gsap.utils.random(0, Math.PI * 2),
    });
  }
  if (!sparkFrame) sparkFrame = requestAnimationFrame(drawSparks);
};

// A 4-point sparkle shape
const drawStar = (ctx, x, y, r) => {
  ctx.beginPath();
  ctx.moveTo(x, y - r * 3);
  ctx.quadraticCurveTo(x, y, x + r * 3, y);
  ctx.quadraticCurveTo(x, y, x, y + r * 3);
  ctx.quadraticCurveTo(x, y, x - r * 3, y);
  ctx.quadraticCurveTo(x, y, x, y - r * 3);
  ctx.fill();
};

const drawSparks = () => {
  const ctx = sparkCtx;
  const c = sparkCanvas.value;
  if (!ctx || !c) return;
  const now = performance.now();

  ctx.clearRect(0, 0, c.clientWidth, c.clientHeight);
  ctx.globalCompositeOperation = 'lighter';

  sparks = sparks.filter((p) => now - p.born < p.life);
  for (const p of sparks) {
    const t = (now - p.born) / p.life;          // 0 → 1 over the spark's life
    p.vx *= 0.955;                               // air friction: sparks slow down
    p.vy = p.vy * 0.955 - 0.012;                 // ...and float slightly upwards, like magic dust
    p.x += p.vx;
    p.y += p.vy;
    p.twinkle += 0.3;

    const alpha = (1 - t) * (0.75 + Math.sin(p.twinkle) * 0.25); // fade out while twinkling
    const size = p.size * (1 - t * 0.4);

    ctx.fillStyle = `rgba(${SPARK_COLOR}, ${alpha * 0.4})`;        // soft glow
    ctx.beginPath();
    ctx.arc(p.x, p.y, size * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${SPARK_COLOR}, ${alpha})`;              // bright core
    if (p.star) {
      drawStar(ctx, p.x, p.y, size);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.globalCompositeOperation = 'source-over';
  sparkFrame = sparks.length ? requestAnimationFrame(drawSparks) : null;
};

// ── Name animation: letters fly in from 3D space and burst into sparkles as they land ──
// Plays on page load and again every time the slide changes.
const playIntro = (delay = 0.15) => {
  if (reducedMotion || !nameEl.value) return;

  const chars = nameEl.value.querySelectorAll('.char');
  introTl?.kill();                         // stop the previous run if it's still going
  gsap.set(chars, { clearProps: 'all' });  // reset letters to their normal state

  introTl = gsap.timeline({ delay });

  // Fly in: each letter starts at a random spot, spun and blurred, then snaps into place.
  // The moment a letter lands, it bursts into magic sparkles.
  chars.forEach((char) => {
    const startAt = gsap.utils.random(0, 0.6);
    introTl.from(char, {
      opacity: 0,
      x: gsap.utils.random(-500, 500),
      y: gsap.utils.random(-300, 300),
      z: gsap.utils.random(-800, 300),
      rotationX: gsap.utils.random(-180, 180),
      rotationY: gsap.utils.random(-180, 180),
      rotation: gsap.utils.random(-90, 90),
      scale: gsap.utils.random(0.2, 2.5),
      filter: 'blur(12px)',
      duration: 1.6,
      ease: 'expo.out',
    }, startAt);
    introTl.call(() => burst(char), null, startAt + 0.55); // expo.out: the letter is basically in place by now
  });
};

// Replay the letter animation together with every slide change (auto or dot click)
watch(current, () => playIntro());

// Hovering a letter makes it jump (it stays neon blue)
const bounce = (e) => {
  if (reducedMotion || gsap.isTweening(e.target)) return;
  gsap.timeline()
    .to(e.target, { y: -18, scale: 1.25, duration: 0.18, ease: 'power2.out' })
    .to(e.target, { y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
};

onMounted(() => {
  resizeSparks();
  window.addEventListener('resize', resizeSparks);
  start();
  playIntro(0.3);
});

onBeforeUnmount(() => {
  stop();
  introTl?.kill(); // clean up GSAP animations
  if (sparkFrame) cancelAnimationFrame(sparkFrame);
  window.removeEventListener('resize', resizeSparks);
});
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

/* Name: big neon cyan text (the letter animation is done with GSAP) */
.name {
  margin: 0;
  font-size: clamp(2.6rem, 9vw, 6rem);
  font-weight: 900;
  letter-spacing: clamp(1px, 0.5vw, 6px);
  line-height: 1.2;

  color: var(--neon-cyan);
  text-shadow: 0 0 2px rgba(0, 240, 255, 0.6), 0 0 12px rgba(0, 240, 255, 0.35);

  perspective: 800px; /* gives the letters real 3D depth while they fly in */
}

.char {
  display: inline-block; /* needed so each letter can move and rotate on its own */
  cursor: default;
  will-change: transform, opacity;
}

/* Letters of one word never split apart; the name can only wrap at the space */
.word {
  white-space: nowrap;
}

/* Sparkle canvas covers the hero, above the text, and never blocks the mouse */
.sparks {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
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