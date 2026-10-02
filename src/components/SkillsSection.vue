<template>
  <!-- The id ("skills") is passed in from App.vue and lands on this <section> -->
  <section ref="sectionEl" class="section section--content skills">
    <h2 class="section-title">Skills</h2>

    <div class="section-body">
      <!-- One panel per skill. Hover (or tap on a phone) grows one panel and reveals its details. -->
      <div ref="gridEl" class="skills-grid" @mouseleave="active = null">
        <button
          v-for="(skill, i) in skills"
          :key="skill.name"
          class="skill"
          :class="{ active: active === i }"
          :aria-expanded="active === i"
          @mouseenter="active = i"
          @focus="active = i"
          @click="active = i"
        >
          <svg class="skill-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path :d="skill.icon" />
          </svg>
          <span class="skill-name">{{ skill.name }}</span>
          <span class="skill-details">
            <span class="skill-details-inner">
              <span class="skill-text">{{ skill.text }}</span>
              <span class="skill-tags"
                ><span v-for="tag in skill.tags" :key="tag" class="tag">{{
                  tag
                }}</span></span
              >
            </span>
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

// ── The skills: plain words first, technologies small underneath ──
const skills = [
  {
    name: "Web design & development",
    text: "Websites and web apps that look good and work on every screen.",
    tags: ["Vue", "JavaScript", "GSAP", "Figma"],
    icon: "M3 4h18v12H3z M8 20h8 M12 16v4 M9.5 8 7.5 10l2 2 M14.5 8l2 2-2 2", // monitor with </>
  },
  {
    name: "Technical support",
    text: "Solving users' problems quickly and keeping systems running.",
    tags: ["Linnworks", "ERP", "Troubleshooting"],
    icon: "M4 14v-2a8 8 0 0 1 16 0v2 M4 14h3v5H4z M17 14h3v5h-3z M20 19a3 3 0 0 1-3 3h-3", // headset
  },
  {
    name: "Databases",
    text: "Keeping data organised, accurate and easy to find.",
    tags: ["PostgreSQL", "SQL"],
    icon: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3", // database cylinder
  },
  {
    name: "Backend (Java)",
    text: "The logic behind the scenes: accounts, orders and integrations.",
    tags: ["Java", "Spring Boot", "Docker", "GitLab CI"],
    icon: "M3 4h18v6H3z M3 14h18v6H3z M7 7h.01 M7 17h.01 M11 7h6 M11 17h6", // server stack
  },
  {
    name: "Project management",
    text: "Planning, coordinating and delivering projects on time, from first idea to launch.",
    tags: ["Planning", "Client communication", "Deadlines"],
    icon: "M9 3h6v3H9z M7 4.5H5V21h14V4.5h-2 M8.5 13.5l2.5 2.5 4.5-5", // clipboard with a tick
  },
];

const active = ref(null); // index of the expanded panel (null = none)
const sectionEl = ref(null);
const gridEl = ref(null);
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let introTl = null;
let observer = null;

// ── Intro: the panels fly in from all sides and lock together,
//    then a neon pulse runs through them ("connected"). ──
const playIntro = () => {
  const panels = gridEl.value.querySelectorAll(".skill");
  introTl?.kill();
  gsap.set(panels, { clearProps: "all" });

  introTl = gsap.timeline({
    onStart: () => gsap.set(gridEl.value, { pointerEvents: "none" }), // no hovering while they fly
    onComplete: () => {
      gsap.set(gridEl.value, { clearProps: "pointerEvents" });
      gsap.set(panels, { clearProps: "all" }); // hand control back to the CSS hover effect
    },
  });

  introTl
    .from(panels, {
      x: (i) => (i % 2 ? 1 : -1) * gsap.utils.random(250, 450), // left or right side
      y: (i) => (i < panels.length / 2 ? -1 : 1) * gsap.utils.random(150, 300), // top or bottom
      rotation: () => gsap.utils.random(-30, 30),
      scale: 0.3,
      opacity: 0,
      filter: "blur(10px)",
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.12,
    })
    .to(
      panels,
      {
        boxShadow: "0 0 28px rgba(0, 240, 255, 0.7)",
        borderColor: "rgba(0, 240, 255, 1)",
        duration: 0.25,
        ease: "power2.out",
        stagger: 0.1,
        yoyo: true,
        repeat: 1,
      },
      "-=0.3",
    );
};

// Hide the panels while the section is off screen, so the intro can play again
const hidePanels = () => {
  introTl?.kill();
  active.value = null;
  gsap.set(gridEl.value.querySelectorAll(".skill"), { opacity: 0 });
};

onMounted(() => {
  if (reducedMotion) return; // just show the panels, no intro
  hidePanels();
  // Play the intro every time the section scrolls into view
  observer = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? playIntro() : hidePanels()),
    { threshold: 0.5 },
  );
  observer.observe(sectionEl.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  introTl?.kill();
});
</script>

<style scoped>
/* ── Layout: stacked strips on portrait screens (phones, tablets held upright),
      side-by-side panels on landscape screens (desktops, phones held sideways) ── */
.skills-grid {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.5vh, 16px);
  width: 100%;
  height: 100%;
  max-height: 600px;
}

@media (orientation: landscape) and (min-width: 560px) {
  .skills-grid {
    flex-direction: row;
    max-height: 440px;
  }
}

/* ── One panel ── */
.skill {
  flex: 1 1 0; /* all panels share the space equally... */
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(4px, 1.2vh, 12px);
  padding: clamp(8px, 2vh, 24px) clamp(6px, 1.5vw, 24px);

  font: inherit;
  color: var(--neon-cyan);
  text-align: center;
  background: rgba(0, 240, 255, 0.04);
  border: 1px solid rgba(0, 240, 255, 0.3);
  border-radius: 14px;
  cursor: pointer;

  transition:
    flex-grow 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.3s ease,
    background 0.3s ease;
}

/* ...until one is active: it grows and pushes the others aside */
.skill.active {
  flex-grow: 4; /* stacked strips: the open one gets 4x the height */
  border-color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.08);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.35);
}

/* Side by side: 2.5x the width is enough, and leaves room for the other names */
@media (orientation: landscape) and (min-width: 560px) {
  .skill.active {
    flex-grow: 2.5;
  }
}

.skill-icon {
  flex-shrink: 0;
  width: clamp(22px, min(5vw, 6vh), 48px);
  height: auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 4px rgba(0, 240, 255, 0.6));
}

.skill-name {
  font-size: clamp(0.75rem, min(1.5vw, 2.8vh), 1.3rem);
  /* Very narrow panels (small phones held sideways): break a long word like
     "development" onto two lines instead of cutting it off */
  hyphens: auto;
  overflow-wrap: anywhere;
  font-weight: 700;
  line-height: 1.25;
  text-shadow: var(--glow-cyan);
}

/* ── Details: hidden (0 height) until the panel is active ──
   Closing: text fades out immediately.
   Opening: wait until the panel has (almost) finished growing, open the space,
   and only THEN fade the text in (so nothing is seen half-cut while it opens). */
.skill-details {
  display: grid;
  grid-template-rows: 0fr;
  opacity: 0;
  /* Keep the text on its own layer the whole time. Without this, Windows switches
     the text smoothing at the end of the fade, which looks like a small twitch. */
  will-change: opacity;
  transition:
    grid-template-rows 0.3s ease,
    opacity 0.15s ease;
}

.skill.active .skill-details {
  grid-template-rows: 1fr;
  opacity: 1;
  transition:
    grid-template-rows 0.25s cubic-bezier(0.22, 1, 0.36, 1) 0.15s,
    opacity 0.3s ease 0.5s; /* starts only after the panel has fully stopped growing */
}

.skill-details-inner {
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(6px, 1.2vh, 12px);
}

.skill-text {
  max-width: 32ch;
  font-size: clamp(0.8rem, min(1.8vw, 2.4vh), 1.05rem);
  line-height: 1.4;
  color: rgba(0, 240, 255, 0.8);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
}

.tag {
  padding: 3px 9px;
  font-size: clamp(0.65rem, min(1.4vw, 1.9vh), 0.8rem);
  white-space: nowrap;
  background: rgba(
    0,
    240,
    255,
    0.12
  ); /* soft filled pill instead of an outline */
  border-radius: 999px;
}

@media (prefers-reduced-motion: reduce) {
  .skill,
  .skill-details {
    transition-duration: 0.01s;
  }
}
</style>
