<template>
  <!-- App.vue is the whole page. main.js mounts it into <div id="app"> in index.html. -->

  <!-- Floating neon particles behind everything (fixed to the screen, does not scroll) -->
  <ParticlesBackground />

  <!-- The top bar: gets the list of sections and which one is on screen,
       and tells us when a link is clicked (the "navigate" event carries the section id) -->
  <TopBar
    :sections="pageSections"
    :active="activeSectionId"
    @navigate="scrollToSection"
  />

  <!-- The sparkle trail that follows the mouse -->
  <MouseTrail />

  <!-- The sections, top to bottom. Each id lands on the section's <section> element
       ("attribute fallthrough"), so links and arrows can find it with getElementById. -->
  <main>
    <HeroSection id="hero" />
    <ProjectsSection id="projects" />
    <SkillsSection id="skills" />
    <ConnectSection id="connect" />
  </main>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import ParticlesBackground from "./components/ParticlesBackground.vue";
import TopBar from "./components/TopBar.vue";
import MouseTrail from "./components/MouseTrail.vue";
import HeroSection from "./components/HeroSection.vue";
import ProjectsSection from "./components/ProjectsSection.vue";
import SkillsSection from "./components/SkillsSection.vue";
import ConnectSection from "./components/ConnectSection.vue";

// ── The sections, in page order ──
// id:    must match the id given to the section in the template above
// label: the text of the link in the top bar
const pageSections = [
  { id: "hero", label: "Home" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "connect", label: "Connect" },
];

// ── Which section is on screen ──
// The id of the section the visitor is looking at. The top bar underlines its link.
const activeSectionId = ref("hero");

// A top-bar link was clicked: smoothly scroll that section to the top of the screen
const scrollToSection = (sectionId) => {
  const sectionElement = document.getElementById(sectionId);
  sectionElement?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Find the section that covers the middle line of the screen and mark it as active.
// Runs on every scroll and resize.
const updateActiveSection = () => {
  const screenMiddleY = window.innerHeight / 2; // px from the top of the screen

  const sectionInMiddle = pageSections.find((section) => {
    const sectionElement = document.getElementById(section.id);
    if (!sectionElement) return false;
    // Where the section is right now, measured from the top of the screen
    const sectionBox = sectionElement.getBoundingClientRect();
    return sectionBox.top <= screenMiddleY && sectionBox.bottom > screenMiddleY;
  });

  if (sectionInMiddle) activeSectionId.value = sectionInMiddle.id;
};

onMounted(() => {
  updateActiveSection(); // once right away (the page may open scrolled, e.g. after a refresh)
  // passive: we never block scrolling, so the browser can scroll smoothly without waiting for us
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", updateActiveSection);
  window.removeEventListener("resize", updateActiveSection);
});
</script>

<style>
/* Not scoped: applies to the page's <main>.
   position + z-index put the sections above the fixed particle background. */
main {
  position: relative;
  z-index: 1;
}
</style>
