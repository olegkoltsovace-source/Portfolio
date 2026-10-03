import { createApp } from "vue";
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim";
import AOS from "aos";
import "aos/dist/aos.css";
import App from "./App.vue";
import "./style.css";

createApp(App)
  // Register tsParticles once for the whole app ("slim" = the common features: links, hover, click…)
  .use(Particles, {
    init: async (engine) => {
      await loadSlim(engine);
    },
  })
  .mount("#app");

// Fade-in on scroll: any element with data-aos="fade-up" (etc.) fades in when it scrolls into view.
// Docs: https://michalsnik.github.io/aos/
AOS.init({
  duration: 700, // ms
  easing: "ease-out-cubic",
  offset: 80, // start a bit after the element enters the screen (px)
  once: false, // fade out again when scrolling back up, and replay next time
  disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
});
