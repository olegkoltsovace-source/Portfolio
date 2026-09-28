<template>
  <ParticlesBackground />

  <TopBar
    :sections="sections"
    :active="activeSection"
    @navigate="scrollToSection"
  />

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

// Highlight the top-bar link of whichever section is on screen
let observer;
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id;
      });
    },
    { threshold: 0.6 },
  );
  sections.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style>
/* Sections sit above the fixed particle canvas */
main {
  position: relative;
  z-index: 1;
}
</style>
