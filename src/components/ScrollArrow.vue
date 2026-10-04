<template>
  <!-- "Go down" hint at the bottom of a section, the same animation as in the hero:
       3 small arrows appear, merge into one big arrow, which nudges down and fades away.
       Click = smooth scroll to the next section. -->
  <button
    ref="el"
    class="scroll-arrow"
    :aria-label="`Scroll to ${label}`"
    @click="go"
  >
    <svg
      v-for="n in 3"
      :key="n"
      class="chevron small"
      viewBox="0 0 40 24"
      aria-hidden="true"
    >
      <polyline points="6,6 20,18 34,6" />
    </svg>
    <svg class="chevron big" viewBox="0 0 40 24" aria-hidden="true">
      <polyline points="6,6 20,18 34,6" />
    </svg>
  </button>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

const props = defineProps({
  to: { type: String, required: true }, // id of the next section, e.g. "skills"
  label: { type: String, required: true }, // for screen readers: "Scroll to skills"
});

const el = ref(null);
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let tl = null;
let observer = null;

const go = () => {
  document.getElementById(props.to)?.scrollIntoView({ behavior: "smooth" });
};

// 3 small arrows drop in one by one → squeeze together into one big arrow →
// the big arrow nudges down and fades away → repeat forever
const build = () => {
  const smalls = el.value.querySelectorAll(".small");
  const big = el.value.querySelector(".big");
  if (reducedMotion) {
    gsap.set(big, { opacity: 1 }); // just show a still arrow
    return;
  }
  const GAP = 14; // vertical distance between the small arrows (px)

  tl = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
  tl.set(smalls, { opacity: 0, scale: 0.7, y: (i) => (i - 1) * GAP - 10 })
    .set(big, { opacity: 0, scale: 0.4, y: -4 })
    .to(smalls, {
      opacity: 1,
      scale: 1,
      y: (i) => (i - 1) * GAP,
      duration: 0.35,
      stagger: 0.15,
      ease: "power2.out",
    })
    .to(
      smalls,
      { opacity: 0, y: 0, scale: 1.4, duration: 0.35, ease: "power3.in" },
      "+=0.3",
    )
    .to(
      big,
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2.5)" },
      "-=0.1",
    )
    .to(big, { y: 10, duration: 0.5, ease: "sine.inOut" }, "+=0.15")
    .to(big, { opacity: 0, y: 18, duration: 0.35, ease: "power2.in" });
};

onMounted(() => {
  build();
  // Only animate while the arrow is on screen (and not hidden by the CSS below)
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) tl?.play();
    else tl?.pause();
  });
  observer.observe(el.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  tl?.kill();
});
</script>

<style scoped>
.scroll-arrow {
  position: relative;
  flex-shrink: 0; /* never squeezed by the section content */
  display: block;
  width: 64px;
  height: 40px;
  margin: 0 auto;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

/* Short screens (e.g. iPhone SE, phones held sideways): no room, so no arrow */
@media (max-height: 700px) {
  .scroll-arrow {
    display: none;
  }
}

.chevron {
  position: absolute;
  left: 50%;
  top: 50%;
  opacity: 0; /* GSAP fades them in */
  fill: none;
  stroke: var(--neon-cyan);
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.7));
}

.chevron.small {
  width: 24px;
  margin: -7px 0 0 -12px; /* centre it */
  stroke-width: 3;
}

.chevron.big {
  width: 48px;
  margin: -14px 0 0 -24px; /* centre it */
  stroke-width: 3.5;
}

/* Stronger glow when hovered */
.scroll-arrow:hover .chevron {
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 1));
}
</style>
