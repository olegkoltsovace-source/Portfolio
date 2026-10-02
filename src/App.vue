<template>
  <ParticlesBackground />

  <TopBar
    :sections="sections"
    :active="activeSection"
    @navigate="scrollToSection"
  />

  <MouseTrail />

  <!-- tabindex="-1" lets the keyboard (arrows, PageDown, Space) scroll this container -->
  <main id="page" ref="pageEl" tabindex="-1">
    <HeroSection id="hero" />
    <SkillsSection id="skills" />
    <ProjectsSection id="projects" />
    <ConnectSection id="connect" />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import ParticlesBackground from "./components/ParticlesBackground.vue";
import TopBar from "./components/TopBar.vue";
import MouseTrail from "./components/MouseTrail.vue";
import HeroSection from "./components/HeroSection.vue";
import SkillsSection from "./components/SkillsSection.vue";
import ProjectsSection from "./components/ProjectsSection.vue";
import ConnectSection from "./components/ConnectSection.vue";

const sections = [
  { id: "hero", label: "Home" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "connect", label: "Connect" },
];

const activeSection = ref("hero");
const pageEl = ref(null); // the scroll container (see style.css for why it isn't the window)

const scrollToSection = (id) => {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Highlight the top-bar link of whichever section is on screen.
// Every section is exactly one screen tall, so scroll position / screen height = section index.
const updateActive = () => {
  const page = pageEl.value;
  const index = Math.round(page.scrollTop / page.clientHeight);
  const section = sections[Math.min(Math.max(index, 0), sections.length - 1)];
  activeSection.value = section.id;
};

onMounted(() => {
  updateActive();
  pageEl.value.addEventListener("scroll", updateActive, { passive: true });
  pageEl.value.focus({ preventScroll: true }); // keyboard scrolling works right away
  window.addEventListener("resize", updateActive);
});

onBeforeUnmount(() => {
  pageEl.value?.removeEventListener("scroll", updateActive);
  window.removeEventListener("resize", updateActive);
});
</script>

<style>
/* The scroll container: one screen tall, scrolls through the sections and snaps to each one.
   Sections sit above the fixed particle canvas. */
main {
  position: relative;
  z-index: 1;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  scroll-snap-type: y mandatory; /* every scroll ends exactly on a section edge */
  scroll-behavior: smooth;
  overscroll-behavior: none; /* no rubber-band bounce at the top/bottom */
  outline: none; /* no focus frame around the whole page */
}
</style>
