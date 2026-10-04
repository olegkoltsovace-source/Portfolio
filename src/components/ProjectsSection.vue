<template>
  <!-- The id ("projects") is passed in from App.vue and lands on this <section> -->
  <section ref="sectionEl" class="section section--content projects">
    <h2 class="section-title" data-aos="fade-up">Projects</h2>

    <div class="section-body">
      <!-- data-aos: fades up when it scrolls into view (AOS library, set up in main.js) -->
      <div class="showcase" data-aos="fade-up" data-aos-delay="150">
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
          <!-- A neon "browser window" that shows a video, a screenshot, or a placeholder.
               screen-area = all the space the info block leaves; the window is sized to fit inside it. -->
          <div class="screen-area">
            <div class="screen">
              <div ref="screenBody" class="screen-body no-trail">
                <!-- The video file is only given to the browser once the Projects section has been on
                     screen (seen), so it doesn't slow down the first page load. Until then: preview image. -->
                <video
                  v-if="current.video"
                  ref="videoEl"
                  :key="current.video"
                  :src="seen ? current.video : undefined"
                  :poster="current.image"
                  muted
                  loop
                  playsinline
                  preload="none"
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

// Project videos and preview images (in src/assets/projects/)
import project1 from "../assets/projects/project1.mp4";
import poster1 from "../assets/projects/poster1.jpg";
import project2 from "../assets/projects/project2.mp4";
import poster2 from "../assets/projects/poster2.jpg";
import project3 from "../assets/projects/project3.mp4";
import poster3 from "../assets/projects/poster3.jpg";
import project4 from "../assets/projects/project4.mp4";
import poster4 from "../assets/projects/poster4.jpg";
import project5 from "../assets/projects/project5.mp4";
import poster5 from "../assets/projects/poster5.jpg";
import project6 from "../assets/projects/project6.mp4";
import poster6 from "../assets/projects/poster6.jpg";

// ── The projects ──────────────────────────────────────────
// video / image: import the files above and put them in a project, e.g. video: project1
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
    video: project1,
    image: poster1, // shown while the video loads
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
    video: project2,
    image: poster2,
  },
  {
    name: "MONEX",
    type: "Landing page (concept)",
    text: "A landing page concept for a finance company, with content that fades in smoothly as you scroll.",
    tags: ["Gatsby", "React", "Scroll animations"],
    links: [{ label: "Visit", url: "https://smooth3-9862a.web.app/" }],
    video: project3,
    image: poster3,
  },
  {
    name: "Arcade Shooter",
    type: "Game",
    text: "A fast arcade game with enemy waves, particle effects and power-ups, running smoothly in the browser.",
    tags: ["Pixi.js", "Phaser", "Vite"],
    links: [{ label: "Play", url: "https://pixi-js-vite-shooter.vercel.app/" }],
    video: project4,
    image: poster4,
  },
  {
    name: "React 3D",
    type: "Interactive 3D",
    text: "An interactive 3D scene in the browser, brought to life with smooth animations.",
    tags: ["React", "Three.js", "GSAP"],
    links: [{ label: "Open", url: "https://vite-react3-js.vercel.app/" }],
    video: project5,
    image: poster5,
  },
  {
    name: "Flipping Fortunes",
    type: "Professional work",
    text: "A released online game I worked on at Games Global, made with Real Dealer Studios. It mixes filmed scenes with interactive gameplay on desktop and mobile.",
    tags: ["TypeScript", "Pixi.js", "Phaser", "Vue"],
    links: [
      {
        label: "Launch article",
        url: "https://igamingbusiness.com/company-news/games-global-and-real-dealer-studios-unveil-interactive-flipping-fortunes-game-as-part-of-innovative-product-portfolio/",
      },
      { label: "Studio", url: "https://realdealerstudios.com/" },
    ],
    video: project6,
    image: poster6,
  },
];

const active = ref(0);
const current = computed(() => projects[active.value]);

const sectionEl = ref(null);
const listEl = ref(null);
const screenBody = ref(null);
const infoEl = ref(null);
const videoEl = ref(null);
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
let visible = false;
let observer = null;
let scrolling = false;
let scrollTimer = null;
const seen = ref(false); // becomes true the first time the section scrolls into view

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

// Play only while the section is on screen and the page is not being scrolled
const playVideo = () => {
  if (!visible || scrolling) return;
  videoEl.value?.play().catch(() => {}); // autoplay can be refused; then the poster stays
};

// A playing video makes the browser redraw it during every scroll step, which can make scrolling
// stutter. So: pause while the page scrolls, and continue 200 ms after scrolling stops.
const onScroll = () => {
  if (!visible) return;
  scrolling = true;
  videoEl.value?.pause();
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    scrolling = false;
    playVideo();
  }, 200);
};

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
      clearProps: "clipPath,opacity", // remove the clip when done, so it costs nothing afterwards
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
  playVideo();
};

// ‹ › arrows: previous / next project (wraps around at the ends)
const step = (dir) =>
  select((active.value + dir + projects.length) % projects.length);

onMounted(() => {
  // Videos only play while the section is on screen (saves battery and keeps the site fast)
  observer = new IntersectionObserver(
    async ([entry]) => {
      visible = entry.intersectionRatio >= 0.05; // "touching the screen edge" doesn't count
      if (visible && !seen.value) {
        seen.value = true; // now the video may start downloading
        await nextTick(); // wait until Vue has handed the file to the <video>
      }
      if (visible) playVideo();
      else videoEl.value?.pause();
    },
    { threshold: [0.05] },
  );
  observer.observe(sectionEl.value);
  updateFades();
  window.addEventListener("resize", updateFades);
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  observer?.disconnect();
  clearTimeout(scrollTimer);
  window.removeEventListener("resize", updateFades);
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
/* ── Layout: list on top (phones) or on the left (landscape screens) ── */
.showcase {
  display: flex;
  flex-direction: column;
  justify-content: center; /* phones: list + video + info as one group in the middle */
  gap: clamp(8px, 2vh, 20px);
  width: 100%;
  height: 100%;
  max-height: 640px;
}

@media (orientation: landscape) and (min-width: 560px) {
  .showcase {
    flex-direction: row;
    max-height: 760px; /* big screens: room for a big video */
  }
}

/* Projects may use more of the width than the other sections (the video needs it) */
.projects .section-body {
  max-width: 1300px;
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
  flex: 0 1 auto; /* phones: only as tall as its content (may shrink on very short screens) */
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: clamp(8px, 1.8vh, 18px);
}

/* Holds the video window */
.screen-area {
  flex: 0 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* The neon video window */
.screen {
  flex: 0 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(0, 240, 255, 0.5);
  border-radius: 12px;
  background: rgba(0, 240, 255, 0.03);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.15);
}

.screen-body {
  position: relative;
  flex: 0 1 auto;
  min-height: 0;
  aspect-ratio: 16 / 9; /* same shape as the videos, so no black bars */
  background: #000; /* fills the space beside the video, if any */
}

/* Landscape screens: the screen-area takes all the height the info block leaves,
   and the 16:9 window is made as big as fits inside it.
   cqw / cqh = 1% of the screen-area's width / height. */
@media (orientation: landscape) and (min-width: 560px) {
  .stage {
    flex: 1;
  }
  .screen-area {
    flex: 1;
    container-type: size;
  }
  .screen {
    flex: none;
    width: min(100cqw, (100cqh - 2px) * 16 / 9); /* 2px = top + bottom border */
  }
  .screen-body {
    flex: none;
  }
}

.screen-body video,
.screen-body img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain; /* always shows the whole video, never cuts anything off */
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

/* ── Tall phones and tablets held upright (e.g. iPhone XR, 390×844, iPad) ──
   The video is limited by the screen width, which leaves a lot of free height.
   Use it: show all projects at once as a grid of cards (no swiping, no arrows),
   with slightly bigger text and more breathing room. */
@media (orientation: portrait) and (min-height: 800px) {
  .showcase {
    gap: clamp(16px, 3vh, 32px);
    max-height: none; /* tablets: let it use the whole height */
  }
  .nav-arrow {
    display: none;
  }
  .project-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    overflow: visible;
    mask-image: none;
  }
  .project-tab {
    padding: 10px 12px;
  }
  .tab-type {
    display: block;
  }
  .stage {
    gap: clamp(12px, 2.5vh, 24px);
  }
  .info {
    gap: 10px;
  }
  .project-name {
    font-size: 1.35rem;
  }
  .project-text {
    font-size: 1rem;
  }
  .tag {
    font-size: 0.8rem;
  }
  .project-link {
    padding: 9px 20px;
    font-size: 0.95rem;
  }
}

/* ── Phones held sideways (wide and short screens) ──
   Here the height limits the video, which leaves empty space on the right.
   Use it: put the project info NEXT TO the video instead of under it, so the video gets
   the full height. cqw / cqh now = 1% of the stage's width / height. */
@media (orientation: landscape) and (min-width: 560px) and (max-height: 600px) and (min-aspect-ratio: 19/10) {
  .list-wrap {
    width: clamp(130px, 20%, 240px);
  }
  .stage {
    flex-direction: row;
    align-items: center;
    container-type: size;
  }
  .screen-area {
    flex: none;
    container-type: normal;
  }
  .screen {
    /* as big as fits, but always leave at least 190px for the info */
    width: min(100cqw - 190px, (100cqh - 2px) * 16 / 9);
  }
  .info {
    flex: 1;
    min-width: 0;
  }
}

/* Very short screens (phones held sideways): keep only name, tags and buttons */
@media (max-height: 420px) {
  .project-text {
    display: none;
  }
}
</style>
