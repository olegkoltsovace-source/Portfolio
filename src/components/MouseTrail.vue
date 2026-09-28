<template>
  <!-- Neon light streak that follows the cursor. Sits above everything but never blocks clicks. -->
  <canvas v-if="enabled" ref="canvas" class="mouse-trail" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// ── Settings you can tweak ────────────────────────────────
const TRAIL_LIFE = 380;   // ms a point of the trail stays visible (longer = longer tail)
const CORE_WIDTH = 2.5;   // thickness of the bright centre line (px)
const GLOW_WIDTH = 12;    // thickness of the soft outer glow (px)
const COLOR = '0, 240, 255'; // neon cyan (RGB)

// Only on devices with a real mouse, and not for users who prefer reduced motion
const enabled =
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canvas = ref(null);
let ctx;
let width = 0;
let height = 0;
let points = []; // { x, y, time }
let frameId = null;

const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.value.width = width * dpr;
  canvas.value.height = height * dpr;
  canvas.value.style.width = `${width}px`;
  canvas.value.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
};

const onMouseMove = (e) => {
  points.push({ x: e.clientX, y: e.clientY, time: performance.now() });
  if (!frameId) frameId = requestAnimationFrame(draw); // wake up the loop
};

// Draws one pass of the trail: a smooth curve through the points,
// thinner and more transparent towards the tail.
const strokeTrail = (maxWidth, maxAlpha, now) => {
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // 0 at the tail end, 1 at the cursor
    const life = 1 - (now - curr.time) / TRAIL_LIFE;
    const progress = i / (points.length - 1);
    const strength = Math.max(0, Math.min(life, progress));

    // Smooth curve: from the midpoint before this point to the midpoint after it
    ctx.beginPath();
    ctx.moveTo((prev.x + curr.x) / 2, (prev.y + curr.y) / 2);
    ctx.quadraticCurveTo(curr.x, curr.y, (curr.x + next.x) / 2, (curr.y + next.y) / 2);
    ctx.lineWidth = maxWidth * strength;
    ctx.strokeStyle = `rgba(${COLOR}, ${maxAlpha * strength})`;
    ctx.stroke();
  }
};

const draw = () => {
  const now = performance.now();

  // Drop points that have faded out
  points = points.filter((p) => now - p.time < TRAIL_LIFE);

  ctx.clearRect(0, 0, width, height);

  if (points.length > 2) {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'lighter';

    strokeTrail(GLOW_WIDTH, 0.12, now);      // wide, faint outer glow
    strokeTrail(GLOW_WIDTH * 0.5, 0.25, now); // medium glow
    strokeTrail(CORE_WIDTH, 0.95, now);       // bright core

    ctx.globalCompositeOperation = 'source-over';
  }

  // Keep animating only while there is something to draw (costs nothing when the mouse is still)
  frameId = points.length ? requestAnimationFrame(draw) : null;
};

onMounted(() => {
  if (!enabled) return;
  ctx = canvas.value.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove, { passive: true });
});

onBeforeUnmount(() => {
  if (frameId) cancelAnimationFrame(frameId);
  window.removeEventListener('resize', resize);
  window.removeEventListener('mousemove', onMouseMove);
});
</script>

<style scoped>
.mouse-trail {
  position: fixed;
  inset: 0;
  z-index: 200;          /* above the sections and the top bar */
  pointer-events: none;  /* never blocks clicks or hovers */
}
</style>