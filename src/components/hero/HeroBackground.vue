<template>
  <!-- Background slides: stacked on top of each other, the current one fades in.
       Plus a dark tint on top, so the text over the pictures stays readable. -->
  <div class="hero-background" aria-hidden="true">
    <div
      v-for="(slideImage, slideIndex) in images"
      :key="slideImage"
      class="slide"
      :class="{ active: slideIndex === currentSlide }"
      :style="{ backgroundImage: `url(${slideImage})` }"
    ></div>
    <div class="overlay"></div>
  </div>
</template>

<script setup>
defineProps({
  images: { type: Array, required: true }, // image URLs, one per slide
  currentSlide: { type: Number, required: true }, // index of the slide to show
});
</script>

<style scoped>
.hero-background {
  position: absolute;
  inset: 0; /* covers the whole hero, also behind the top bar */
}

.slide {
  position: absolute;
  inset: 0;
  background-size: cover; /* always fills the screen, crops instead of stretching */
  background-position: center;
  opacity: 0;
  transform: scale(1.08);
  transition:
    opacity 1.4s ease,
    transform 7s ease-out;
}

/* The current slide fades in and slowly zooms out (a subtle "Ken Burns" effect) */
.slide.active {
  opacity: 1;
  transform: scale(1);
}

.overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      180deg,
      rgba(5, 8, 13, 0.55) 0%,
      rgba(5, 8, 13, 0.35) 45%,
      rgba(5, 8, 13, 0.9) 100%
    ),
    radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.08), transparent 55%);
}

/* Less motion: no zoom, quicker fade */
@media (prefers-reduced-motion: reduce) {
  .slide {
    transform: none;
    transition: opacity 0.4s ease;
  }
}
</style>
