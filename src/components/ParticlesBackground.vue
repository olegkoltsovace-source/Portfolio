<template>
  <!-- One fixed canvas behind the whole page. The hero section covers it with its images,
       the other sections are transparent so the particles show through. -->
  <canvas ref="canvas" class="particles" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

// ── Settings you can tweak ────────────────────────────────
const COLORS = ['0, 240, 255', '0, 200, 255', '120, 245, 255']; // shades of neon cyan (RGB)
const DENSITY = 14000;      // screen area (px²) per particle: lower = more particles
const MAX_PARTICLES = 120;
const SPEED = 0.35;         // drift speed
const LINK_DISTANCE = 130;  // particles closer than this get connected by a line
const MOUSE_RADIUS = 160;   // particles near the cursor get pushed away gently

const canvas = ref(null);
let ctx;
let particles = [];
let width = 0;
let height = 0;
let frameId = null;
const mouse = { x: -9999, y: -9999 };
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const random = (min, max) => Math.random() * (max - min) + min;

const createParticles = () => {
  const count = Math.min(MAX_PARTICLES, Math.floor((width * height) / DENSITY));
  particles = Array.from({ length: count }, () => ({
    x: random(0, width),
    y: random(0, height),
    vx: random(-SPEED, SPEED),
    vy: random(-SPEED, SPEED),
    r: random(1, 2.4),
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    pulse: random(0, Math.PI * 2), // each particle "breathes" at its own rhythm
  }));
};

// Match the canvas to the screen size (sharp on high-DPI / retina screens too)
const resize = () => {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.value.width = width * dpr;
  canvas.value.height = height * dpr;
  canvas.value.style.width = `${width}px`;
  canvas.value.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  createParticles();
  if (reducedMotion) draw(); // static frame only
};

const update = () => {
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.pulse += 0.02;

    // Wrap around the edges
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    // Gentle push away from the cursor
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (dist < MOUSE_RADIUS && dist > 0) {
      const force = (1 - dist / MOUSE_RADIUS) * 0.6;
      p.x += (dx / dist) * force;
      p.y += (dy / dist) * force;
    }
  }
};

const draw = () => {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = 'lighter'; // overlapping light adds up → neon look

  // Connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < LINK_DISTANCE) {
        ctx.strokeStyle = `rgba(${a.color}, ${(1 - dist / LINK_DISTANCE) * 0.25})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Particles: soft glow + bright core
  for (const p of particles) {
    const glow = 0.55 + Math.sin(p.pulse) * 0.25;

    ctx.fillStyle = `rgba(${p.color}, ${glow * 0.18})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${p.color}, ${glow})`;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over';
};

const loop = () => {
  update();
  draw();
  frameId = requestAnimationFrame(loop);
};

const start = () => {
  if (!frameId && !reducedMotion) frameId = requestAnimationFrame(loop);
};
const stop = () => {
  if (frameId) cancelAnimationFrame(frameId);
  frameId = null;
};

// Save battery: pause when the browser tab is hidden
const onVisibility = () => (document.hidden ? stop() : start());
const onMouseMove = (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
};
const onMouseLeave = () => {
  mouse.x = -9999;
  mouse.y = -9999;
};

onMounted(() => {
  ctx = canvas.value.getContext('2d');
  resize();
  start();
  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseleave', onMouseLeave);
  document.addEventListener('visibilitychange', onVisibility);
});

onBeforeUnmount(() => {
  stop();
  window.removeEventListener('resize', resize);
  window.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseleave', onMouseLeave);
  document.removeEventListener('visibilitychange', onVisibility);
});
</script>

<style scoped>
.particles {
  position: fixed;
  inset: 0;
  z-index: 0;            /* behind the sections (main has z-index 1) */
  pointer-events: none;  /* never blocks clicks */
}
</style>