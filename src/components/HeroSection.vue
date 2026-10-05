<template>
  <!-- The id ("hero") is passed in from App.vue and lands on this <section> -->
  <section ref="heroSection" class="section hero">
    <HeroBackground :images="slideImages" :current-slide="currentSlide" />

    <div class="content">
      <HeroName ref="heroName" :name="NAME" @letter-landed="onLetterLanded" />

      <!-- Job title under the name: changes together with the slide -->
      <div class="title-box">
        <Transition name="title" mode="out-in">
          <p :key="currentSlide" class="title">
            {{ SLIDE_TITLES[currentSlide] }}
          </p>
        </Transition>
      </div>

      <!-- "Go down" arrow (the same component as on the other sections) -->
      <ScrollArrow
        class="hero-arrow"
        to="projects"
        label="projects"
        always-visible
      />
    </div>

    <SparkCanvas ref="sparkCanvas" />

    <SlideDots
      :slide-count="slideImages.length"
      :current-slide="currentSlide"
      @select="goToSlide"
    />
  </section>
</template>

<script setup>
// The hero puts the pieces together and decides WHEN things happen:
//   HeroBackground – the slide pictures          (components/hero/HeroBackground.vue)
//   HeroName       – the flying letters           (components/hero/HeroName.vue)
//   SparkCanvas    – the sparks                   (components/hero/SparkCanvas.vue)
//   SlideDots      – the dots under the slides    (components/hero/SlideDots.vue)
//   useSlideshow   – the slide timer              (composables/useSlideshow.js)
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import ScrollArrow from "./ScrollArrow.vue";
import HeroBackground from "./hero/HeroBackground.vue";
import HeroName from "./hero/HeroName.vue";
import SparkCanvas from "./hero/SparkCanvas.vue";
import SlideDots from "./hero/SlideDots.vue";
import { useSlideshow } from "../composables/useSlideshow.js";
import heroImage1 from "../assets/hero/hero-1.jpg";
import heroImage2 from "../assets/hero/hero-2.jpg";
import heroImage3 from "../assets/hero/hero-3.jpg";
// Smaller copies (1200px wide) for phones: about 4x fewer pixels to download and decode
import heroImage1Small from "../assets/hero/hero-1-small.jpg";
import heroImage2Small from "../assets/hero/hero-2-small.jpg";
import heroImage3Small from "../assets/hero/hero-3-small.jpg";

// ── Settings ──
const NAME = "Oleg Koltsov";
const SLIDE_TITLES = ["Tehniline spetsialist", "Klienditugi", "Projektijuht"]; // one title per slide
const SLIDE_DURATION_MS = 6000; // how long each slide stays on screen
const VISIBLE_ENOUGH = 0.1; // the slideshow runs while at least 10% of the hero is on screen
const MAX_IMAGE_WAIT_MS = 2000; // the name intro waits for the first picture at most this long

const isSmallScreen = window.matchMedia("(max-width: 900px)").matches;
const slideImages = isSmallScreen
  ? [heroImage1Small, heroImage2Small, heroImage3Small]
  : [heroImage1, heroImage2, heroImage3];

// Child components (filled in by Vue once they are on the page)
const heroSection = ref(null);
const heroName = ref(null);
const sparkCanvas = ref(null);

// ── Slideshow ──
const { currentSlide, startSlideshow, stopSlideshow, goToSlide } = useSlideshow(
  slideImages.length,
  SLIDE_DURATION_MS,
);

// Every slide change (automatic or by clicking a dot) replays the name animation
watch(currentSlide, () => heroName.value?.playNameIntro());

// ── Name → sparks ──
// HeroName tells us when a letter lands; SparkCanvas makes the sparks there
const onLetterLanded = (letterElement) => {
  sparkCanvas.value?.burstSparksFromElement(letterElement);
};

// ── Saving power ──
// While the hero is off screen, stop the slideshow
// (otherwise slides keep changing and the name keeps replaying where nobody sees it)
let heroVisibilityObserver = null;

const onHeroVisibilityChange = ([heroEntry]) => {
  const heroIsVisible = heroEntry.intersectionRatio >= VISIBLE_ENOUGH;
  if (heroIsVisible) startSlideshow();
  else stopSlideshow();
};

// ── Startup ──
// Wait until the first slide image is downloaded and decoded (2 seconds at most),
// so the name animation doesn't compete with the image for the phone's attention
const waitForFirstSlideImage = () => {
  const firstImage = new Image();
  firstImage.src = slideImages[0];
  const imageDecoded = firstImage.decode().catch(() => {}); // if it fails, just continue
  const timeout = new Promise((resolve) =>
    setTimeout(resolve, MAX_IMAGE_WAIT_MS),
  );
  return Promise.race([imageDecoded, timeout]); // whichever comes first
};

onMounted(async () => {
  // Start watching the hero; the first report comes right away and starts the slideshow
  heroVisibilityObserver = new IntersectionObserver(onHeroVisibilityChange, {
    threshold: VISIBLE_ENOUGH,
  });
  heroVisibilityObserver.observe(heroSection.value);

  await waitForFirstSlideImage();
  heroName.value?.playNameIntro(0.1);
});

onBeforeUnmount(() => {
  heroVisibilityObserver?.disconnect();
  // (the slide timer, the name animation and the sparks clean up after themselves)
});
</script>

<style scoped>
.hero {
  position: relative;
  background: var(--bg);
  animation: hero-fade-in 0.8s ease-out both; /* soft fade-in on page load instead of popping in */
}

@keyframes hero-fade-in {
  from {
    opacity: 0;
  }
}

/* Name, title and arrow: sit above the background */
.content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 24px;
}

/* Fixed-height box, so the page doesn't jump while the titles swap */
.title-box {
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

/* Title swap: the old one slides up and fades out, the new one rises in from below */
.title-enter-active,
.title-leave-active {
  transition:
    opacity 0.5s ease,
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.5s ease;
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

/* Space between the title and the arrow (".content" in front so it wins over the arrow's own margin) */
.content .hero-arrow {
  margin-top: clamp(16px, 4vh, 40px);
}

/* Less motion: no page fade, quicker title swap */
@media (prefers-reduced-motion: reduce) {
  .hero {
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
