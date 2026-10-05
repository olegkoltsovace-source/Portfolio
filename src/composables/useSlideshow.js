// A slideshow timer: which slide is showing, and moving to the next one every few seconds.
// It only keeps the number of the current slide; the component decides what a "slide" looks like.
//
// Usage:
//   const { currentSlide, startSlideshow, stopSlideshow, goToSlide } = useSlideshow(3, 6000);

import { ref, onBeforeUnmount } from "vue";

export function useSlideshow(slideCount, slideDurationMs) {
  const currentSlide = ref(0); // index of the slide on screen (templates react to it)
  let slideTimer = null;

  const showNextSlide = () => {
    currentSlide.value = (currentSlide.value + 1) % slideCount; // after the last slide, back to the first
  };

  const startSlideshow = () => {
    stopSlideshow(); // never run two timers at once
    slideTimer = setInterval(showNextSlide, slideDurationMs);
  };

  const stopSlideshow = () => {
    clearInterval(slideTimer);
    slideTimer = null;
  };

  // Jump to a slide (e.g. a dot was clicked) and restart the timer,
  // so the chosen slide gets its full time on screen
  const goToSlide = (slideIndex) => {
    currentSlide.value = slideIndex;
    startSlideshow();
  };

  // Stop the timer automatically when the component using this is removed from the page
  onBeforeUnmount(stopSlideshow);

  return { currentSlide, startSlideshow, stopSlideshow, goToSlide };
}
