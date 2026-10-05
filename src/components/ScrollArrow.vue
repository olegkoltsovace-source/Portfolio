<template>
  <!-- "Go to the next section" arrow:
       3 small arrows appear, merge into one big arrow, which nudges down and fades away.
       Click = smooth scroll to the target section. -->
  <button
    ref="arrowButton"
    class="scroll-arrow"
    :class="{ 'points-up': up, 'always-visible': alwaysVisible }"
    :aria-label="`Scroll to ${label}`"
    @click="scrollToTarget"
  >
    <svg
      v-for="arrowNumber in 3"
      :key="arrowNumber"
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
  to: { type: String, required: true }, // id of the section to scroll to, e.g. "skills"
  label: { type: String, required: true }, // for screen readers: "Scroll to skills"
  up: { type: Boolean, default: false }, // true = the arrow points up (e.g. "back to the top")
  alwaysVisible: { type: Boolean, default: false }, // true = also shown on short screens
});

const SMALL_ARROW_GAP = 14; // vertical distance between the three small arrows (px)

const arrowButton = ref(null);
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let arrowTimeline = null;
let onScreenObserver = null;

const scrollToTarget = () => {
  document.getElementById(props.to)?.scrollIntoView({ behavior: "smooth" });
};

// The animation, repeated forever:
// 1. three small arrows appear one after another
// 2. they squeeze into the middle and vanish...
// 3. ...and one big arrow pops out of them
// 4. the big arrow nudges downwards ("go this way") and fades out
const buildArrowAnimation = () => {
  const smallArrows = arrowButton.value.querySelectorAll(".small");
  const bigArrow = arrowButton.value.querySelector(".big");

  if (prefersReducedMotion) {
    gsap.set(bigArrow, { opacity: 1 }); // just show a still arrow
    return;
  }

  // Vertical position of each small arrow: the first one above the middle, the last one below
  const smallArrowPosition = (arrowIndex) => (arrowIndex - 1) * SMALL_ARROW_GAP;

  arrowTimeline = gsap.timeline({ repeat: -1, repeatDelay: 0.4, paused: true });
  arrowTimeline
    // starting state
    .set(smallArrows, {
      opacity: 0,
      scale: 0.7,
      y: (arrowIndex) => smallArrowPosition(arrowIndex) - 10,
    })
    .set(bigArrow, { opacity: 0, scale: 0.4, y: -4 })
    // 1.
    .to(smallArrows, {
      opacity: 1,
      scale: 1,
      y: smallArrowPosition,
      duration: 0.35,
      stagger: 0.15,
      ease: "power2.out",
    })
    // 2.
    .to(
      smallArrows,
      { opacity: 0, y: 0, scale: 1.4, duration: 0.35, ease: "power3.in" },
      "+=0.3",
    )
    // 3.
    .to(
      bigArrow,
      { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(2.5)" },
      "-=0.1",
    )
    // 4.
    .to(bigArrow, { y: 10, duration: 0.5, ease: "sine.inOut" }, "+=0.15")
    .to(bigArrow, { opacity: 0, y: 18, duration: 0.35, ease: "power2.in" });
};

onMounted(() => {
  buildArrowAnimation();
  // Only animate while the arrow is on screen (and not hidden by the CSS below)
  onScreenObserver = new IntersectionObserver(([arrowEntry]) => {
    if (arrowEntry.isIntersecting) arrowTimeline?.play();
    else arrowTimeline?.pause();
  });
  onScreenObserver.observe(arrowButton.value);
});

onBeforeUnmount(() => {
  onScreenObserver?.disconnect();
  arrowTimeline?.kill();
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

/* Pointing up: the whole arrow (and its animation) is simply turned upside down */
.scroll-arrow.points-up {
  transform: rotate(180deg);
}

/* Short screens (e.g. iPhone SE, phones held sideways): no room, so no arrow
   (unless the section asks for it with always-visible, like the hero) */
@media (max-height: 700px) {
  .scroll-arrow:not(.always-visible) {
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
