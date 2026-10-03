<template>
  <ParticlesBackground />

  <TopBar
    :sections="sections"
    :active="activeSection"
    @navigate="scrollToSection"
  />

  <MouseTrail />

  <main>
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

const scrollToSection = (id) => {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Highlight the top-bar link of whichever section is on screen.
// Every section is exactly one screen tall, so scroll position / screen height = section index.
const updateActive = () => {
  const index = Math.round(window.scrollY / window.innerHeight);
  const section = sections[Math.min(Math.max(index, 0), sections.length - 1)];
  activeSection.value = section.id;
};

onMounted(() => {
  updateActive();
  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", updateActive);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateActive);
  window.removeEventListener("resize", updateActive);
});
</script>

<style>
/* Sections sit above the fixed particle canvas */
main {
  position: relative;
  z-index: 1;
}
</style>
