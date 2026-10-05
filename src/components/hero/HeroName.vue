<template>
  <!-- The name. Every letter is its own <span> so GSAP can animate each letter separately.
       aria-label keeps the name readable for screen readers. -->
  <h1 ref="nameHeading" class="hero-name" :aria-label="name">
    <template v-for="(wordLetters, wordIndex) in nameWords" :key="wordIndex">
      <span class="word" aria-hidden="true"
        ><span
          v-for="(letter, letterIndex) in wordLetters"
          :key="letterIndex"
          class="letter"
          @mouseenter="bounceLetter"
          >{{ letter }}</span
        ></span
      >{{ wordIndex < nameWords.length - 1 ? " " : "" }}
    </template>
  </h1>
</template>

<script setup>
// The letters fly in from random spots in 3D space. When each one lands, this component
// emits "letter-landed" with that letter's element, so the parent can make sparks there.
// The parent starts the animation by calling playNameIntro() (see defineExpose at the bottom).
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

const props = defineProps({
  name: { type: String, required: true },
});

const emit = defineEmits(["letter-landed"]);

const LETTER_FLIGHT_SECONDS = 1.6;
const LETTER_LANDS_AFTER_SECONDS = 0.55; // with the "expo.out" easing, the letter is basically in place by then
const LETTERS_START_WITHIN_SECONDS = 0.6; // letters don't start all at once, but within this window

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// The name split into words, and each word into letters:
// "Oleg Koltsov" → [["O","l","e","g"], ["K","o","l","t","s","o","v"]]
const nameWords = computed(() =>
  props.name.split(" ").map((word) => word.split("")),
);

const nameHeading = ref(null);
let nameIntroTimeline = null;

const getNameLetters = () => nameHeading.value.querySelectorAll(".letter");

// Fly the letters in. Safe to call again while it is still playing: it starts over.
const playNameIntro = (delaySeconds = 0.15) => {
  if (prefersReducedMotion || !nameHeading.value) return;

  const letters = getNameLetters();
  nameIntroTimeline?.kill(); // stop the previous run if it's still going
  gsap.set(letters, { clearProps: "all" }); // put every letter back to its normal state

  nameIntroTimeline = gsap.timeline({ delay: delaySeconds });

  letters.forEach((letter) => {
    const letterStartTime = gsap.utils.random(0, LETTERS_START_WITHIN_SECONDS);

    // gsap "from": the letter STARTS with these values and animates to its normal state
    // (No blur filter: blur is very expensive for phones to draw.)
    nameIntroTimeline.from(
      letter,
      {
        opacity: 0,
        x: gsap.utils.random(-500, 500), // px left/right
        y: gsap.utils.random(-300, 300), // px up/down
        z: gsap.utils.random(-800, 300), // px away from / towards the viewer
        rotationX: gsap.utils.random(-180, 180), // degrees
        rotationY: gsap.utils.random(-180, 180),
        rotation: gsap.utils.random(-90, 90),
        scale: gsap.utils.random(0.2, 2.5),
        duration: LETTER_FLIGHT_SECONDS,
        ease: "expo.out", // very fast at first, then gently settles
      },
      letterStartTime,
    );

    // The moment the letter lands: tell the parent
    nameIntroTimeline.call(
      () => emit("letter-landed", letter),
      null,
      letterStartTime + LETTER_LANDS_AFTER_SECONDS,
    );
  });
};

// Hovering over a letter makes it jump up and fall back with a wobble
const bounceLetter = (mouseEvent) => {
  const letter = mouseEvent.target;
  if (prefersReducedMotion || gsap.isTweening(letter)) return; // don't restart a jump that's still going
  gsap
    .timeline()
    .to(letter, { y: -18, scale: 1.25, duration: 0.18, ease: "power2.out" })
    .to(letter, { y: 0, scale: 1, duration: 0.6, ease: "elastic.out(1, 0.4)" });
};

onMounted(() => {
  // Hide the letters until the intro starts (otherwise they flash on screen first)
  if (!prefersReducedMotion) gsap.set(getNameLetters(), { opacity: 0 });
});

onBeforeUnmount(() => {
  nameIntroTimeline?.kill();
});

// Lets the parent call this function through a template ref: heroName.value.playNameIntro()
defineExpose({ playNameIntro });
</script>

<style scoped>
/* Big neon cyan text (the letter animation is done with GSAP) */
.hero-name {
  margin: 0;
  font-size: clamp(2.6rem, 9vw, 6rem);
  font-weight: 900;
  letter-spacing: clamp(1px, 0.5vw, 6px);
  line-height: 1.2;

  color: var(--neon-cyan);
  text-shadow:
    0 0 2px rgba(0, 240, 255, 0.6),
    0 0 12px rgba(0, 240, 255, 0.35);

  perspective: 800px; /* gives the letters real 3D depth while they fly in */
}

.letter {
  display: inline-block; /* needed so each letter can move and rotate on its own */
  cursor: default;
  will-change: transform, opacity;
}

/* The letters of one word never split apart; the name can only wrap at the space */
.word {
  white-space: nowrap;
}
</style>
