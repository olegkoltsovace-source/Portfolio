import { createApp } from "vue";
import Particles from "@tsparticles/vue3";
import { loadSlim } from "@tsparticles/slim";
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
