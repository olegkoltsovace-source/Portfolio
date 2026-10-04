<template>
  <!-- The id ("skills") is passed in from App.vue and lands on this <section> -->
  <section class="section section--content skills">
    <h2 class="section-title" data-aos="fade-up">Skills</h2>

    <div class="section-body">
      <!-- 2 × 2 tiles. Each tile shows a neon band with the skill's name.
           Hover (mouse) or tap (phone): the band slides away and the details appear. -->
      <div class="tiles">
        <!-- data-aos sits on a wrapper, because AOS takes over the transform/transition of its element
             and the tile needs its own transitions for the hover effect -->
        <div
          v-for="(skill, i) in skills"
          :key="skill.name"
          class="tile-wrap"
          data-aos="zoom-in"
          :data-aos-delay="i * 120"
        >
          <button
            class="tile"
            :class="{ active: active === i }"
            :aria-expanded="active === i"
            @pointerdown="lastPointer = $event.pointerType"
            @pointerenter="onEnter($event, i)"
            @pointerleave="onLeave($event)"
            @click="onTap(i)"
          >
            <!-- Big faint line drawing in the background -->
            <svg class="tile-art" viewBox="0 0 24 24" aria-hidden="true">
              <path :d="skill.icon" />
            </svg>

            <!-- The neon band with the name (slides away when the tile opens) -->
            <span class="band" aria-hidden="true"
              ><span>{{ skill.name }}</span></span
            >

            <!-- The details (appear when the tile opens) -->
            <span class="details">
              <span class="details-name">{{ skill.name }}</span>
              <span class="details-text">{{ skill.text }}</span>
              <span class="details-tags">
                <span v-for="tag in skill.tags" :key="tag" class="tag">{{
                  tag
                }}</span>
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

// ── The skills: plain words first, technologies small underneath ──
// icon: an SVG path (24 × 24), drawn big and faint in the background of the tile
const skills = [
  {
    name: "Frontend",
    text: "Websites and web apps that look good and work on every screen, from landing pages to 3D browser games.",
    tags: ["Vue", "React", "TypeScript", "Three.js", "Pixi.js", "GSAP"],
    icon: "M3 4h18v12H3z M8 20h8 M12 16v4 M9.5 8 7.5 10l2 2 M14.5 8l2 2-2 2", // monitor with </>
  },
  {
    name: "Backend",
    text: "The logic behind the scenes: accounts, secure logins, data and the APIs that connect it all.",
    tags: ["Java", "Spring Boot", "PostgreSQL", "REST API", "Docker"],
    icon: "M3 4h18v6H3z M3 14h18v6H3z M7 7h.01 M7 17h.01 M11 7h6 M11 17h6", // server stack
  },
  {
    name: "Project management",
    text: "Planning, coordinating and delivering projects on time, from the first idea to launch.",
    tags: ["Planning", "Client communication", "Deadlines"],
    icon: "M9 3h6v3H9z M7 4.5H5V21h14V4.5h-2 M8.5 13.5l2.5 2.5 4.5-5", // clipboard with a tick
  },
  {
    name: "Technical support",
    text: "Solving users' problems quickly and keeping the systems a business depends on running.",
    tags: ["Linnworks", "ERP", "Troubleshooting"],
    icon: "M4 14v-2a8 8 0 0 1 16 0v2 M4 14h3v5H4z M17 14h3v5h-3z M20 19a3 3 0 0 1-3 3h-3", // headset
  },
];

const active = ref(null); // index of the open tile (null = none)
let lastPointer = "mouse"; // "mouse", "touch" or "pen": what was used for the last press

// Mouse: open on hover, close when the mouse leaves
const onEnter = (e, i) => {
  if (e.pointerType === "mouse") active.value = i;
};
const onLeave = (e) => {
  if (e.pointerType === "mouse") active.value = null;
};

// Finger / pen: tap opens, tapping the open tile again closes it
// (with a mouse the hover already did the job, so clicks are ignored)
const onTap = (i) => {
  if (lastPointer === "mouse") return;
  active.value = active.value === i ? null : i;
};
</script>

<style scoped>
/* ── Layout: 2 × 2 tiles that fill the space ── */
.tiles {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: clamp(8px, 1.6vmin, 16px);
  width: 100%;
  height: 100%;
  max-height: 640px;
}

.tile-wrap {
  min-width: 0;
  min-height: 0;
}

/* ── One tile ── */
.tile {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  font: inherit;
  color: var(--neon-cyan);
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(0, 240, 255, 0.25);
  border-radius: 14px;
  container-type: inline-size; /* lets the band text size itself to the tile's width (cqi units) */
  /* dark glass with faint scanlines, like the project placeholder */
  background:
    repeating-linear-gradient(
      0deg,
      rgba(0, 240, 255, 0.03) 0 1px,
      transparent 1px 4px
    ),
    rgba(0, 240, 255, 0.04);
  transition:
    border-color 0.4s ease,
    box-shadow 0.4s ease;
}

/* A lighter diagonal wedge across the tile (like the photo split in the Sly Boots tiles) */
.tile::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 240, 255, 0.06);
  clip-path: polygon(55% 0, 100% 0, 100% 100%, 30% 100%);
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.tile.active,
.tile:focus-visible {
  outline: none;
  border-color: var(--neon-cyan);
  box-shadow:
    0 0 18px rgba(0, 240, 255, 0.3),
    inset 0 0 30px rgba(0, 240, 255, 0.08);
}

/* The wedge slides out to the right when the tile opens */
.tile.active::before,
.tile:focus-visible::before {
  transform: translateX(100%);
}

/* Big faint drawing */
.tile-art {
  position: absolute;
  right: -4%;
  bottom: -8%;
  width: auto;
  height: 80%;
  fill: none;
  stroke: var(--neon-cyan);
  stroke-width: 0.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  opacity: 0.14;
  transition:
    opacity 0.5s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.tile.active .tile-art,
.tile:focus-visible .tile-art {
  opacity: 0.08; /* fades back so the text is easy to read */
  transform: scale(1.08);
}

/* ── The neon band ── */
.band {
  position: absolute;
  left: -10%;
  right: -10%;
  top: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: clamp(30px, 6vmin, 52px);
  padding: 6px 0;
  background: rgba(0, 240, 255, 0.85);
  box-shadow: 0 0 18px rgba(0, 240, 255, 0.45);
  transform: translateY(-50%) rotate(-12deg); /* centred vertically, then tilted */
  transition:
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease;
}

.band span {
  max-width: 80cqi; /* narrow tiles: long names wrap onto two lines instead of being cut off */
  font-size: clamp(
    0.7rem,
    min(6cqi, 4.5vh),
    1.4rem
  ); /* cqi = 1% of the tile's width; vh keeps it small on short screens */
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: 2px;
  text-align: center;
  text-transform: uppercase;
  color: var(--bg); /* dark text on the bright band */
}

/* Slides out to the left and fades when the tile opens
   (also when reached with the Tab key: :focus-visible = keyboard focus only) */
.tile.active .band,
.tile:focus-visible .band {
  transform: translateX(-110%) translateY(-50%) rotate(-12deg);
  opacity: 0;
}

/* ── Details ── */
.details {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: clamp(6px, 1.4vmin, 14px);
  padding: clamp(10px, 3vmin, 32px);
  opacity: 0;
  transform: translateY(12px);
  /* closing: disappear quickly */
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

/* opening: wait until the band is mostly out of the way, then fade in */
.tile.active .details,
.tile:focus-visible .details {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.4s ease 0.25s,
    transform 0.4s ease 0.25s;
}

.details-name {
  font-size: clamp(0.95rem, 2.6vmin, 1.5rem);
  font-weight: 800;
  text-shadow: var(--glow-cyan);
}

.details-text {
  max-width: 42ch;
  font-size: clamp(0.72rem, 1.9vmin, 1.05rem);
  line-height: 1.4;
  color: rgba(0, 240, 255, 0.8);
}

.details-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  padding: 2px 8px;
  font-size: clamp(0.62rem, 1.5vmin, 0.8rem);
  white-space: nowrap;
  background: rgba(0, 240, 255, 0.12);
  border-radius: 999px;
}

/* Small tiles (phones): no room for the tags, the text says enough */
@media (max-width: 560px) and (max-height: 760px), (max-height: 420px) {
  .details-tags {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tile,
  .tile::before,
  .tile-art,
  .band,
  .details {
    transition-duration: 0.01s !important;
  }
}
</style>
