<template>
  <!-- Dots under the slides: show the current slide, click one to jump to that slide -->
  <div class="slide-dots">
    <button
      v-for="slideIndex in slideCount"
      :key="slideIndex"
      class="dot"
      :class="{ active: slideIndex - 1 === currentSlide }"
      :aria-label="`Show slide ${slideIndex}`"
      @click="emit('select', slideIndex - 1)"
    ></button>
  </div>
</template>

<script setup>
// Note: "v-for in a number" counts from 1, so slide number 1 is index 0
defineProps({
  slideCount: { type: Number, required: true },
  currentSlide: { type: Number, required: true }, // index of the slide on screen
});

// "select" tells the parent which slide index was clicked
const emit = defineEmits(["select"]);
</script>

<style scoped>
.slide-dots {
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
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease,
    width 0.3s ease;
}

.dot:hover {
  background: rgba(0, 240, 255, 0.4);
}

/* The current dot stretches into a glowing pill */
.dot.active {
  width: 28px;
  border-radius: 999px;
  background: var(--neon-cyan);
  box-shadow: var(--glow-cyan);
}
</style>
