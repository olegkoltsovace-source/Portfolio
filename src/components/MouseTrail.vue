<template>
  <!-- Magical cursor effects (tsParticles): sparkle dust behind the cursor,
       plus a sparkle burst when hovering links, buttons and the letters of the name. -->
  <vue-particles
    v-if="enabled"
    id="mouse-trail"
    :options="options"
    @particles-loaded="onLoaded"
  />
</template>

<script setup>
import { onBeforeUnmount } from "vue";

// ── Settings you can tweak ────────────────────────────────
const COLOR = "#00f0ff"; // neon cyan
const TRAIL_SPACING = 9; // one sparkle every N px of mouse movement (smaller = more)
const BURST_COUNT = 26; // sparkles per hover burst (same as the name)
const HOVER_TARGETS = "a, button, .char"; // what bursts when hovered
const NO_TRAIL = ".no-trail"; // no sparkles over these (e.g. the project videos)
// ─────────────────────────────────────────────────────────

// Only on devices with a real mouse, and not for users who prefer reduced motion
const enabled =
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// What every sparkle looks like and how it behaves
const options = {
  fullScreen: { enable: true, zIndex: 200 }, // on top of everything
  fpsLimit: 60,
  detectRetina: true,
  particles: {
    number: { value: 0 }, // nothing at start, we add sparkles ourselves
    paint: { fill: { enable: true, color: { value: COLOR } } },
    shape: {
      type: ["circle", "circle"], // about 1 in 3 is a 4-point star
      options: { star: { sides: 4, inset: 3 } },
    },
    size: { value: { min: 1, max: 3 } },
    opacity: {
      value: { min: 0, max: 1 },
      animation: { enable: true, speed: 5, startValue: "max", destroy: "min" }, // fade out, then disappear
    },
    rotate: {
      value: { min: 0, max: 360 },
      direction: "random",
      animation: { enable: true, speed: 15 },
    },
    move: {
      enable: true,
      direction: "none", // random direction
      speed: { min: 0.3, max: 1.2 },
      decay: 0.05, // slows down like the name sparkles
      gravity: { enable: true, acceleration: 0.6, maxSpeed: 1.5 }, // dust falls gently
      outModes: "destroy",
    },
  },
};

let container = null;
let lastX = null;
let lastY = null;
let travelled = 0;
let hovered = null;
let sleepTimer = null;
let frame = null;

// Screen position → canvas position (the canvas is sharper on retina screens)
const add = (x, y, extra) => {
  if (!container || container.particles.count > 400) return;
  if (!container.animationStatus) container.play(); // wake up
  const ratio = container.retina.pixelRatio;
  container.particles.addParticle({ x: x * ratio, y: y * ratio }, extra);
};

// Every half second: if all sparkles are gone, pause the animation loop (saves CPU/GPU)
const sleepWhenEmpty = () => {
  if (container && container.animationStatus && container.particles.count === 0)
    container.pause();
};

// Sparkles that drift onto a "no-trail" area (the project videos) are removed,
// so they look like they go behind the video. Checked every frame, only while sparkles are moving.
const removeOverNoTrail = () => {
  if (container && container.animationStatus && container.particles.count > 0) {
    const areas = [...document.querySelectorAll(NO_TRAIL)]
      .map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > 0 && r.bottom > 0 && r.top < window.innerHeight); // only the ones on screen
    if (areas.length) {
      const ratio = container.retina.pixelRatio;
      const inside = container.particles.filter((p) => {
        const x = p.position.x / ratio; // canvas position → screen position
        const y = p.position.y / ratio;
        return areas.some(
          (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom,
        );
      });
      inside.forEach((p) => container.particles.remove(p, undefined, true));
    }
  }
  frame = requestAnimationFrame(removeOverNoTrail);
};

// Big burst: sparkles fly out fast in every direction, like the hero name
const burst = (x, y) => {
  for (let i = 0; i < BURST_COUNT; i++) {
    add(x, y, {
      move: { speed: { min: 2, max: 7 } },
      size: { value: { min: 1.2, max: 3.4 } },
    });
  }
};

const onMouseMove = (e) => {
  // Over a "no-trail" area (the project videos): no sparkles, so they don't cover the video
  if (e.target.closest?.(NO_TRAIL)) {
    lastX = null;
    travelled = 0;
    return;
  }
  if (lastX !== null) {
    travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
    while (travelled >= TRAIL_SPACING) {
      travelled -= TRAIL_SPACING;
      add(e.clientX, e.clientY);
    }
  }
  lastX = e.clientX;
  lastY = e.clientY;
};

// Burst once each time the cursor enters a link, button or letter
const onMouseOver = (e) => {
  const target = e.target.closest?.(HOVER_TARGETS);
  if (!target || target === hovered) return;
  hovered = target;
  const r = target.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2);
};

const onMouseOut = (e) => {
  if (hovered && !hovered.contains(e.relatedTarget)) hovered = null;
};

const onClick = (e) => {
  if (e.target.closest?.(NO_TRAIL)) return;
  burst(e.clientX, e.clientY);
};

const onLoaded = (c) => {
  container = c;
  sleepTimer = setInterval(sleepWhenEmpty, 500);
  frame = requestAnimationFrame(removeOverNoTrail);
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  document.addEventListener("mouseover", onMouseOver, { passive: true });
  document.addEventListener("mouseout", onMouseOut, { passive: true });
  window.addEventListener("mousedown", onClick, { passive: true });
};

onBeforeUnmount(() => {
  clearInterval(sleepTimer);
  cancelAnimationFrame(frame);
  window.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseover", onMouseOver);
  document.removeEventListener("mouseout", onMouseOut);
  window.removeEventListener("mousedown", onClick);
});
</script>

<style>
/* Out of the page layout from the very first moment (see ParticlesBackground.vue),
   on top of everything, and never blocks clicks */
#mouse-trail {
  position: fixed;
  inset: 0;
  z-index: 200;
  pointer-events: none;
}
#mouse-trail canvas {
  pointer-events: none !important;
}
</style>
