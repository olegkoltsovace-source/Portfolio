<template>
  <!-- The id ("projects") is passed in from App.vue and lands on this <section> -->
  <section ref="sectionEl" class="section section--content projects">
    <h2 class="section-title">Projects</h2>

    <div class="section-body">
      <div ref="showcaseEl" class="showcase">
        <!-- Project switcher: a row of chips with ‹ › arrows on phones, a vertical list on wider screens.
             The edges fade out where there are more projects to scroll to. -->
        <div class="list-wrap">
          <button
            class="nav-arrow"
            aria-label="Previous project"
            @click="step(-1)"
          >
            ‹
          </button>
          <div
            ref="listEl"
            class="project-list"
            :class="{ 'more-before': moreBefore, 'more-after': moreAfter }"
            role="tablist"
            aria-label="Projects"
            @scroll.passive="updateFades"
          >
            <button
              v-for="(project, i) in projects"
              :key="project.name"
              class="project-tab"
              :class="{ active: active === i }"
              role="tab"
              :aria-selected="active === i"
              @click="select(i)"
            >
              <span class="tab-name">{{ project.name }}</span>
              <span class="tab-type">{{ project.type }}</span>
            </button>
          </div>
          <button class="nav-arrow" aria-label="Next project" @click="step(1)">
            ›
          </button>
        </div>

        <!-- The selected project -->
        <div class="stage">
          <!-- A neon "browser window" that shows a video, a screenshot, or a placeholder -->
          <div class="screen">
            <div class="screen-bar" aria-hidden="true">
              <span class="screen-dots"><i></i><i></i><i></i></span>
              <span class="screen-url">{{
                domain(current.links[0]?.url)
              }}</span>
            </div>
            <div ref="screenBody" class="screen-body">
              <video
                v-if="current.video"
                ref="videoEl"
                :key="current.video"
                :src="current.video"
                :poster="current.image"
                muted
                loop
                playsinline
                preload="metadata"
              ></video>
              <img
                v-else-if="current.image"
                :key="current.image"
                :src="current.image"
                :alt="`Screenshot of ${current.name}`"
              />
              <div v-else class="placeholder">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M10 8.5v7l5.5-3.5z" />
                </svg>
                <span>Preview coming soon</span>
              </div>
            </div>
          </div>

          <div ref="infoEl" class="info">
            <h3 class="project-name">
              {{ current.name }}
              <span class="project-type">{{ current.type }}</span>
            </h3>
            <p class="project-text">{{ current.text }}</p>
            <div class="project-tags">
              <span v-for="tag in current.tags" :key="tag" class="tag">{{
                tag
              }}</span>
            </div>
            <div class="project-links">
              <a
                v-for="link in current.links"
                :key="link.url"
                class="project-link"
                :href="link.url"
                target="_blank"
                rel="noopener"
                >{{ link.label }} ↗</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import gsap from "gsap";

// ── The projects ─────────────────────────────────────────
// video / image: import a file from src/assets/projects/ and put it here, e.g.
//   import battleVideo from '../assets/projects/battle.mp4';  →  video: battleVideo
// Without video or image, a "Preview coming soon" placeholder is shown.
const GITHUB = "https://github.com/olegkoltsovace-source";

const projects = [
  {
    name: "3D Battle Game",
    type: "Full-stack game",
    text: "A 3D browser game with player accounts, saved progress and a real server and database behind it.",
    tags: ["Vue 3", "Three.js", "Spring Boot", "PostgreSQL", "JWT"],
    links: [
      { label: "Play", url: "https://battle-game-frontend-blush.vercel.app/" },
      { label: "GitHub", url: GITHUB },
    ],
    video: null,
    image: null,
  },
  {
    name: "Job Tracker",
    type: "Web app",
    text: "Keeps every job application in one place: add, edit and follow them, behind a secure login.",
    tags: ["Vue 3", "Spring Boot", "REST API", "PostgreSQL", "Flyway", "JWT"],
    links: [
      {
        label: "Open app",
        url: "https://job-tracker-frontend-oxv7.vercel.app/login",
      },
      { label: "GitHub", url: GITHUB },
    ],
    video: null,
    image: null,
  },
  {
    name: "MONEX",
    type: "Landing page (concept)",
    text: "A landing page concept for a finance company, with content that fades in smoothly as you scroll.",
    tags: ["Gatsby", "React", "Scroll animations"],
    links: [{ label: "Visit", url: "https://smooth3-9862a.web.app/" }],
    video: null,
    image: null,
  },
  {
    name: "Arcade Shooter",
    type: "Game",
    text: "A fast arcade game with enemy waves, particle effects and power-ups, running smoothly in the browser.",
    tags: ["Pixi.js", "Phaser", "Vite"],
    links: [{ label: "Play", url: "https://pixi-js-vite-shooter.vercel.app/" }],
    video: null,
    image: null,
  },
  {
    name: "React 3D",
    type: "Interactive 3D",
    text: "An interactive 3D scene in the browser, brought to life with smooth animations.",
    tags: ["React", "Three.js", "GSAP"],
    links: [{ label: "Open", url: "https://vite-react3-js.vercel.app/" }],
    video: null,
    image: null,
  },
  {
    name: "Studio games",
    type: "Professional work",
    text: "Online games I built at Games Global for studios such as Real Dealer Studios and Buck Stakes Entertainment.",
    tags: ["TypeScript", "Pixi.js", "Phaser", "Vue"],
    links: [
      { label: "Real Dealer", url: "https://realdealerstudios.com/" },
      {
        label: "Buck Stakes",
        url: "https://slotcatalog.com/en/soft/Buck-Stakes-Entertainment",
      },
    ],
    video: null,
    image: null,
  },
];

const active = ref(0);
const current = computed(() => projects[active.value]);

const sectionEl = ref(null);
const showcaseEl = ref(null);
const listEl = ref(null);
const screenBody = ref(null);
const infoEl = ref(null);
const videoEl = ref(null);
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let visible = false;
let observer = null;
let played = false; // has the intro already played during this visit?

// Is there more of the list hidden before / after the visible part? (drives the edge fades)
const moreBefore = ref(false);
const moreAfter = ref(false);
const updateFades = () => {
  const l = listEl.value;
  if (!l) return;
  const horizontal = l.scrollWidth > l.clientWidth + 1;
  const pos = horizontal ? l.scrollLeft : l.scrollTop;
  const max = horizontal
    ? l.scrollWidth - l.clientWidth
    : l.scrollHeight - l.clientHeight;
  moreBefore.value = pos > 2;
  moreAfter.value = pos < max - 2;
};

// "www.example.com/path" → "example.com" for the fake address bar
const domain = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

const playVideo = () => videoEl.value?.play().catch(() => {}); // autoplay can be refused; then the poster stays

// Screen "turns on" like an old monitor, and the text slides in
const animateIn = () => {
  if (reducedMotion) return;
  gsap.fromTo(
    screenBody.value,
    { clipPath: "inset(50% 0% 50% 0%)", opacity: 0.4 },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      opacity: 1,
      duration: 0.5,
      ease: "power3.out",
    },
  );
  gsap.fromTo(
    infoEl.value.children,
    { opacity: 0, y: 10 },
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: "power2.out" },
  );
};

// Phones: the chip row (or a short vertical list) scrolls, so keep the chosen one in view
const centerTab = (i) => {
  const list = listEl.value;
  const tab = list.children[i];
  list.scrollTo({
    left: tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2,
    top: tab.offsetTop - (list.clientHeight - tab.offsetHeight) / 2,
    behavior: "smooth",
  });
};

const select = async (i) => {
  if (i === active.value) return;
  active.value = i;
  centerTab(i);
  await nextTick(); // wait until Vue has put the new project on screen
  animateIn();
  if (visible) playVideo();
};

// ‹ › arrows: previous / next project (wraps around at the ends)
const step = (dir) =>
  select((active.value + dir + projects.length) % projects.length);

// Section intro: the project list slides in, then the screen turns on
const playIntro = () => {
  if (reducedMotion) return;
  const tabs = showcaseEl.value.querySelectorAll(".project-tab");
  gsap.fromTo(
    tabs,
    { opacity: 0, x: -20 },
    { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" },
  );
  animateIn();
};

onMounted(() => {
  // Videos only play while the section is on screen (saves battery and keeps the site fast)
  // The intro plays once the section has (almost) fully arrived, i.e. after the swipe/scroll,
  // so it never competes with the scrolling itself.
  observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (entry.intersectionRatio >= 0.95 && !played) {
        played = true;
        playIntro();
        playVideo();
      } else if (!visible) {
        played = false;
        videoEl.value?.pause();
      }
    },
    { threshold: [0, 0.95] },
  );
  observer.observe(sectionEl.value);
  updateFades();
  window.addEventListener("resize", updateFades);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  window.removeEventListener("resize", updateFades);
});
</script>

<style scoped>
/* ── Layout: list on top (phones) or on the left (landscape screens) ── */
.showcase {
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 2vh, 20px);
  width: 100%;
  height: 100%;
  max-height: 640px;
}

@media (orientation: landscape) and (min-width: 560px) {
  .showcase {
    flex-direction: row;
    max-height: 520px;
  }
}

/* ── Project list ── */
.list-wrap {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

/* ‹ › arrows (only on the chip row; hidden next to the vertical list) */
.nav-arrow {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  padding: 0 0 3px;
  font: inherit;
  font-size: 1.4rem;
  line-height: 1;
  color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.06);
  border: 1px solid rgba(0, 240, 255, 0.4);
  border-radius: 50%;
  cursor: pointer;
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
}
.nav-arrow:hover {
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}

.project-list {
  --fade-dir: to right;
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 8px;
  overflow-x: auto; /* phones: swipe sideways through the chips */
  scrollbar-width: none;
  padding: 2px;
}

/* Fade the edge(s) where more projects are hidden, as a "there is more" hint */
.project-list.more-after {
  mask-image: linear-gradient(
    var(--fade-dir),
    #000 calc(100% - 36px),
    transparent
  );
}
.project-list.more-before {
  mask-image: linear-gradient(var(--fade-dir), transparent, #000 36px);
}
.project-list.more-before.more-after {
  mask-image: linear-gradient(
    var(--fade-dir),
    transparent,
    #000 36px,
    #000 calc(100% - 36px),
    transparent
  );
}
.project-list::-webkit-scrollbar {
  display: none;
}

@media (orientation: landscape) and (min-width: 560px) {
  .list-wrap {
    width: clamp(140px, 24%, 240px);
    align-self: stretch;
  }
  .nav-arrow {
    display: none;
  }
  .project-list {
    --fade-dir: to bottom;
    flex-direction: column;
    align-self: stretch;
    overflow-x: visible;
    overflow-y: auto; /* very short screens: scroll the list */
  }
}

.project-tab {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: clamp(6px, 1.2vh, 12px) clamp(10px, 1.5vw, 16px);
  font: inherit;
  color: var(--text-muted);
  text-align: left;
  background: rgba(0, 240, 255, 0.04);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition:
    color 0.25s ease,
    border-color 0.25s ease,
    background 0.25s ease;
}

.project-tab:hover {
  color: var(--neon-cyan);
  border-color: rgba(0, 240, 255, 0.5);
}

.project-tab.active {
  color: var(--neon-cyan);
  border-color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.1);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.25);
}

.tab-name {
  font-size: clamp(0.8rem, min(1.4vw, 2.4vh), 1rem);
  font-weight: 700;
  white-space: nowrap;
}

.tab-type {
  display: none; /* phones: name only, to keep the chips small */
  font-size: clamp(0.65rem, min(1vw, 1.8vh), 0.78rem);
  opacity: 0.75;
}

@media (orientation: landscape) and (min-width: 560px) {
  .tab-type {
    display: block;
  }
}

/* ── Stage: screen on top, info under it ── */
.stage {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.8vh, 18px);
}

/* The neon browser window */
.screen {
  flex: 1; /* takes all the height the info block leaves */
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.5);
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.03);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.15);
}

.screen-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-bottom: 1px solid rgba(0, 240, 255, 0.25);
}

.screen-dots {
  display: flex;
  gap: 5px;
}
.screen-dots i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.5);
}

.screen-url {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.screen-body {
  position: relative;
  flex: 1;
  min-height: 0;
}

.screen-body video,
.screen-body img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* fills the window at any size, crops instead of stretching */
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: clamp(0.7rem, 1.6vh, 0.9rem);
  /* faint scanlines, like an old monitor */
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 240, 255, 0.035) 0 1px,
    transparent 1px 4px
  );
}

.placeholder svg {
  width: clamp(28px, 8vh, 64px);
  height: auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.2;
  stroke-linejoin: round;
}

/* ── Info about the selected project ── */
.info {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 1vh, 10px);
}

.project-name {
  margin: 0;
  font-size: clamp(1rem, min(2vw, 3vh), 1.4rem);
  line-height: 1.2;
  text-shadow: var(--glow-cyan);
}

.project-type {
  font-size: 0.7em;
  font-weight: 400;
  color: var(--text-muted);
  text-shadow: none;
}

.project-text {
  margin: 0;
  max-width: 60ch;
  font-size: clamp(0.8rem, min(1.6vw, 2.2vh), 1rem);
  line-height: 1.45;
  color: rgba(0, 240, 255, 0.8);
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 3px 9px;
  font-size: clamp(0.65rem, min(1.2vw, 1.8vh), 0.78rem);
  white-space: nowrap;
  background: rgba(0, 240, 255, 0.12);
  border-radius: 999px;
}

.project-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-link {
  padding: clamp(5px, 1vh, 8px) clamp(12px, 1.6vw, 18px);
  font-size: clamp(0.75rem, min(1.3vw, 2vh), 0.9rem);
  font-weight: 700;
  color: var(--neon-cyan);
  text-decoration: none;
  border: 1px solid var(--neon-cyan);
  border-radius: 999px;
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.project-link:hover {
  background: rgba(0, 240, 255, 0.12);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
}

/* Very short screens (phones held sideways): keep only name, tags and buttons */
@media (max-height: 420px) {
  .project-text {
    display: none;
  }
}
</style>
