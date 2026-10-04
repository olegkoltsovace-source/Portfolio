<template>
  <!-- The id ("connect") is passed in from App.vue and lands on this <section> -->
  <section class="section section--content connect">
    <h2 class="section-title" data-aos="fade-up">Connect</h2>

    <div class="section-body">
      <!-- A holographic business card: tilts with the mouse, flips on click / tap.
           Front: who I am. Back: how to reach me. -->
      <div class="card-wrap" data-aos="zoom-in" data-aos-delay="150">
        <div
          ref="sceneEl"
          class="scene"
          @pointermove="onMove"
          @pointerleave="onLeave"
        >
          <!-- tilt = follows the mouse; flipper = turns the card over -->
          <div ref="tiltEl" class="tilt">
            <div
              class="flipper"
              :class="{ flipped }"
              role="button"
              tabindex="0"
              :aria-pressed="flipped"
              aria-label="Business card. Press to flip and see contact details."
              @click="flipped = !flipped"
              @keydown.enter.prevent="flipped = !flipped"
              @keydown.space.prevent="flipped = !flipped"
            >
              <!-- ── Front ── -->
              <div class="face front" :inert="flipped">
                <span class="shine" aria-hidden="true"></span>
                <div class="front-top">
                  <span class="status"><i></i> Available now</span>
                  <span class="chip" aria-hidden="true"></span>
                </div>
                <div class="front-main">
                  <h3 class="name">Oleg Koltsov</h3>
                  <p class="role">{{ ROLE }}</p>
                </div>
                <div class="front-bottom">
                  <span>Tallinn, Estonia</span>
                  <span class="langs">
                    <span v-for="lang in LANGUAGES" :key="lang" class="lang">{{
                      lang
                    }}</span>
                  </span>
                </div>
                <span class="hint"
                  >{{ isTouch ? "Tap" : "Click" }} to flip ↻</span
                >
              </div>

              <!-- ── Back ── -->
              <div class="face back" :inert="!flipped">
                <span class="shine" aria-hidden="true"></span>
                <p class="back-title">Let's talk</p>
                <div class="contacts">
                  <button class="contact" type="button" @click.stop="copyEmail">
                    <span class="contact-label">{{
                      copied ? "Copied!" : "Email"
                    }}</span>
                    <span class="contact-value">{{ EMAIL }}</span>
                  </button>
                  <a
                    class="contact"
                    :href="`tel:${PHONE.replace(/\s/g, '')}`"
                    @click.stop
                  >
                    <span class="contact-label">Phone</span>
                    <span class="contact-value">{{ PHONE }}</span>
                  </a>
                  <a
                    class="contact"
                    :href="LINKEDIN"
                    target="_blank"
                    rel="noopener"
                    @click.stop
                  >
                    <span class="contact-label">LinkedIn ↗</span>
                    <span class="contact-value">Profile</span>
                  </a>
                  <a
                    class="contact"
                    :href="GITHUB"
                    target="_blank"
                    rel="noopener"
                    @click.stop
                  >
                    <span class="contact-label">GitHub ↗</span>
                    <span class="contact-value">Code</span>
                  </a>
                </div>
                <span class="hint"
                  >{{ isTouch ? "Tap" : "Click" }} to flip back ↻</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="footer">© {{ new Date().getFullYear() }} Oleg Koltsov</p>
  </section>
</template>

<script setup>
import { ref } from "vue";

// ── Your details (placeholders for now) ──────────────────
const ROLE = "Developer · Technical specialist";
const LANGUAGES = ["ET", "EN", "RU"];
const EMAIL = "hello@example.com";
const PHONE = "+372 5555 5555";
const LINKEDIN = "https://www.linkedin.com/in/your-profile";
const GITHUB = "https://github.com/olegkoltsovace-source";
// ─────────────────────────────────────────────────────────

const flipped = ref(false);
const copied = ref(false);
const sceneEl = ref(null);
const tiltEl = ref(null);
const isTouch = window.matchMedia("(pointer: coarse)").matches;
const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

// Email: copy to the clipboard (more practical than mailto: for people who use web mail)
const copyEmail = async () => {
  try {
    await navigator.clipboard.writeText(EMAIL);
    copied.value = true;
    setTimeout(() => (copied.value = false), 1500);
  } catch {
    window.location.href = `mailto:${EMAIL}`; // clipboard not allowed: open the mail app instead
  }
};

// 3D tilt: the card leans towards the mouse, and the light (shine) follows it.
// The numbers go into CSS variables, the CSS does the actual turning.
const MAX_TILT = 12; // degrees
const onMove = (e) => {
  if (e.pointerType !== "mouse" || reducedMotion) return;
  const r = sceneEl.value.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width; // 0 = left edge, 1 = right edge
  const y = (e.clientY - r.top) / r.height; // 0 = top, 1 = bottom
  const s = tiltEl.value.style;
  s.setProperty("--ry", `${(x - 0.5) * 2 * MAX_TILT}deg`);
  s.setProperty("--rx", `${(0.5 - y) * 2 * MAX_TILT}deg`);
  s.setProperty("--mx", `${x * 100}%`);
  s.setProperty("--my", `${y * 100}%`);
};

// Mouse leaves: the card settles back flat
const onLeave = () => {
  const s = tiltEl.value.style;
  s.setProperty("--ry", "0deg");
  s.setProperty("--rx", "0deg");
  s.setProperty("--mx", "50%");
  s.setProperty("--my", "30%");
};
</script>

<style scoped>
/* The card is as big as fits: max 560px wide, and never taller than the free height.
   cqw / cqh = 1% of the section body's width / height. */
.connect .section-body {
  container-type: size;
}

.card-wrap {
  width: min(560px, 100cqw, (100cqh - 8px) * 1.6);
  container-type: inline-size; /* inside the card, cqi = 1% of the card's width, so the text scales with it */
}

/* Phones held upright: a standing card fills the tall screen better */
@media (orientation: portrait) and (max-width: 600px) {
  .card-wrap {
    width: min(400px, 100cqw, (100cqh - 8px) * 0.68);
  }
  .card-wrap .flipper {
    aspect-ratio: 0.68; /* (".card-wrap" in front so this wins over the .flipper rule further down) */
  }
}

.scene {
  perspective: 1000px; /* how strong the 3D effect looks */
}

/* ── Tilt (follows the mouse) ── */
.tilt {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 30%;
  transform: rotateX(var(--rx)) rotateY(var(--ry));
  transform-style: preserve-3d;
  transition: transform 0.25s ease-out;
}

/* ── Flipper (turns the card over) ── */
.flipper {
  position: relative;
  aspect-ratio: 1.6; /* business card shape */
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
  cursor: pointer;
  border-radius: 18px;
  outline: none;
}

.flipper.flipped {
  transform: rotateY(180deg);
}

.flipper:focus-visible .face {
  box-shadow:
    0 0 0 2px var(--neon-cyan),
    0 0 30px rgba(0, 240, 255, 0.35);
}

/* ── Both faces ── */
.face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 7cqi 8cqi;
  border: 1px solid rgba(0, 240, 255, 0.55);
  border-radius: 18px;
  backface-visibility: hidden; /* hide the side that faces away */
  background:
    /* faint diagonal "hologram foil" stripes */
    repeating-linear-gradient(
      115deg,
      rgba(0, 240, 255, 0.05) 0 2px,
      transparent 2px 9px
    ),
    linear-gradient(135deg, #0a1a24 0%, #05080d 60%, #0a1a24 100%);
  box-shadow:
    0 0 24px rgba(0, 240, 255, 0.25),
    inset 0 0 40px rgba(0, 240, 255, 0.06);
}

.back {
  transform: rotateY(180deg);
}

/* The light that follows the mouse */
.shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at var(--mx) var(--my),
      rgba(0, 240, 255, 0.28),
      transparent 45%
    ),
    linear-gradient(
      115deg,
      transparent 30%,
      rgba(0, 240, 255, 0.1) 45%,
      transparent 60%
    );
  background-size:
    100% 100%,
    250% 250%;
  background-position:
    0 0,
    var(--mx) var(--my); /* the diagonal sheen slides with the mouse */
  mix-blend-mode: screen;
}

/* ── Front ── */
.front-top,
.front-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 1.5cqi;
  font-size: 3cqi;
  color: rgba(0, 240, 255, 0.85);
}

.status i {
  width: 2cqi;
  height: 2cqi;
  border-radius: 50%;
  background: var(--neon-cyan);
  box-shadow: 0 0 8px var(--neon-cyan);
}

/* A "smart card chip", drawn with CSS */
.chip {
  width: 11cqi;
  height: 8cqi;
  border-radius: 1.5cqi;
  border: 1px solid rgba(0, 240, 255, 0.6);
  background:
    linear-gradient(
      90deg,
      transparent 32%,
      rgba(0, 240, 255, 0.5) 32% 36%,
      transparent 36% 64%,
      rgba(0, 240, 255, 0.5) 64% 68%,
      transparent 68%
    ),
    linear-gradient(
      0deg,
      transparent 45%,
      rgba(0, 240, 255, 0.5) 45% 55%,
      transparent 55%
    ),
    rgba(0, 240, 255, 0.12);
}

.front-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.name {
  margin: 0;
  font-size: 9cqi;
  line-height: 1.1;
  letter-spacing: 0.5px;
  text-shadow:
    0 0 6px rgba(0, 240, 255, 0.7),
    0 0 18px rgba(0, 240, 255, 0.4);
}

.role {
  margin: 1.5cqi 0 0;
  font-size: 3.6cqi;
  letter-spacing: 1px;
  color: rgba(0, 240, 255, 0.75);
}

.front-bottom {
  font-size: 3cqi;
  color: rgba(0, 240, 255, 0.7);
}

.langs {
  display: flex;
  gap: 1.5cqi;
}

.lang {
  padding: 0.6cqi 2cqi;
  font-weight: 700;
  border: 1px solid rgba(0, 240, 255, 0.5);
  border-radius: 999px;
}

.hint {
  position: absolute;
  right: 4cqi;
  bottom: 2.5cqi;
  font-size: 2.4cqi;
  color: rgba(0, 240, 255, 0.45);
}

/* ── Back ── */
.back-title {
  margin: 0 0 4cqi;
  font-size: 6cqi;
  font-weight: 800;
  text-shadow: var(--glow-cyan);
}

.contacts {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3cqi;
  align-content: start;
}

.contact {
  position: relative; /* above the shine */
  display: flex;
  flex-direction: column;
  gap: 0.8cqi;
  min-width: 0;
  padding: 2.6cqi 3.4cqi;
  font: inherit;
  text-align: left;
  text-decoration: none;
  color: var(--neon-cyan);
  background: rgba(0, 240, 255, 0.06);
  border: 1px solid rgba(0, 240, 255, 0.4);
  border-radius: 2.4cqi;
  cursor: pointer;
  transition:
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.contact:hover,
.contact:focus-visible {
  outline: none;
  background: rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
}

.contact-label {
  font-size: 3.4cqi;
  font-weight: 800;
}

.contact-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 2.9cqi;
  color: rgba(0, 240, 255, 0.75);
}

/* ── Footer ── */
.footer {
  flex-shrink: 0;
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

/* Standing card (phones): bigger text, contacts in one column */
@media (orientation: portrait) and (max-width: 600px) {
  .face {
    padding: 10cqi 9cqi;
  }
  .status,
  .front-bottom {
    font-size: 4.2cqi;
  }
  .front-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 3cqi;
  }
  .chip {
    width: 15cqi;
    height: 11cqi;
  }
  .name {
    font-size: 12cqi;
  }
  .role {
    font-size: 5cqi;
  }
  .hint {
    font-size: 3.6cqi;
  }
  .back-title {
    font-size: 9cqi;
  }
  .contacts {
    grid-template-columns: 1fr;
    gap: 4cqi;
  }
  .contact {
    padding: 3.6cqi 5cqi;
  }
  .contact-label {
    font-size: 4.8cqi;
  }
  .contact-value {
    font-size: 4.2cqi;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tilt,
  .flipper {
    transition-duration: 0.01s;
  }
}
</style>
