<template>
  <!-- Neon particle network behind the whole page (tsParticles).
       The hero covers it with its images; the other sections are transparent. -->
  <vue-particles id="particles-bg" :options="options" />
</template>

<script setup>
// Phones get a lighter version: fewer particles, and the canvas is drawn at normal resolution
// instead of 2-3x "retina" resolution (that alone is 4-9x fewer pixels to draw every frame)
const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;

// All behaviour is configured here. Docs: https://particles.js.org/docs/
const options = {
  fullScreen: { enable: true, zIndex: 0 }, // fixed canvas behind everything
  background: { color: "transparent" },
  fpsLimit: 60,
  detectRetina: !isSmallScreen,

  particles: {
    number: { value: isSmallScreen ? 45 : 90, density: { enable: true } }, // scales with screen size
    paint: { fill: { enable: true, color: { value: "#00f0ff" } } }, // neon cyan dots
    opacity: { value: { min: 0.3, max: 0.8 } },
    size: { value: { min: 1, max: 2.5 } },
    links: {
      enable: true,
      distance: 130,
      color: "#00f0ff",
      opacity: 0.3,
      width: 1,
    },
    move: { enable: true, speed: 0.6, outModes: "out" },
  },

  interactivity: {
    detectsOn: "window", // react to the mouse even though the sections sit on top
    events: {
      onHover: { enable: true, mode: "repulse" }, // particles move away from the cursor
    },
    modes: {
      repulse: { distance: 140, speed: 0.6 },
    },
  },
};
</script>
