<template>
  <header class="topbar">
    <!-- Logo in the corner: a neon ring (the O) and the letter K = "OK".
         Once you scroll past the hero, the rest of the surname slides out after the K: "Koltsov".
         (On the hero it stays short, because the hero already shows the full name in big letters.) -->
    <a
      class="logo"
      href="#hero"
      aria-label="Oleg Koltsov, back to the top"
      @click.prevent="goToSection('hero')"
    >
      <span class="logo-ring" aria-hidden="true"></span>
      <span class="logo-text" aria-hidden="true"
        >K<span class="logo-surname-rest" :class="{ hidden: active === 'hero' }"
          >oltsov</span
        ></span
      >
    </a>

    <!-- Desktop / wide screens: regular links -->
    <nav class="nav-desktop">
      <a
        v-for="section in sections"
        :key="section.id"
        :href="`#${section.id}`"
        :class="{ active: active === section.id }"
        @click.prevent="goToSection(section.id)"
      >
        {{ section.label }}
      </a>
    </nav>

    <!-- Narrow screens: hamburger button (turns into an X when open) -->
    <button
      class="hamburger"
      :class="{ open: menuOpen }"
      :aria-expanded="menuOpen"
      aria-label="Toggle menu"
      @click="menuOpen = !menuOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>

  <!-- Full-screen mobile menu -->
  <Transition name="menu">
    <div v-if="menuOpen" class="menu-overlay">
      <nav class="nav-mobile">
        <!-- --link-index is used by the CSS to make the links appear one after another -->
        <a
          v-for="(section, sectionIndex) in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :class="{ active: active === section.id }"
          :style="{ '--link-index': sectionIndex }"
          @click.prevent="goToSection(section.id)"
        >
          {{ section.label }}
        </a>
      </nav>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from "vue";

defineProps({
  sections: { type: Array, required: true }, // [{ id: "hero", label: "Home" }, ...] from App.vue
  active: { type: String, default: "" }, // id of the section on screen (its link gets underlined)
});

// "navigate" tells App.vue which section to scroll to
const emit = defineEmits(["navigate"]);

const MOBILE_MENU_MAX_WIDTH = 768; // keep in sync with the @media (max-width: 768px) rule below
const menuOpen = ref(false);

// A link was clicked: close the menu first (scrolling is locked while it's open), then scroll
const goToSection = async (sectionId) => {
  if (menuOpen.value) {
    menuOpen.value = false;
    await nextTick(); // wait until Vue has closed the menu and unlocked scrolling
  }
  emit("navigate", sectionId);
};

// Lock page scrolling while the menu is open
watch(menuOpen, (isOpen) => {
  document.documentElement.style.overflow = isOpen ? "hidden" : "";
});

// Escape closes the menu
const closeMenuOnEscape = (keyboardEvent) => {
  if (keyboardEvent.key === "Escape") menuOpen.value = false;
};

// The menu only exists on narrow screens: close it if the window becomes wide again
const closeMenuOnWideScreen = () => {
  if (window.innerWidth > MOBILE_MENU_MAX_WIDTH) menuOpen.value = false;
};

onMounted(() => {
  window.addEventListener("keydown", closeMenuOnEscape);
  window.addEventListener("resize", closeMenuOnWideScreen);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", closeMenuOnEscape);
  window.removeEventListener("resize", closeMenuOnWideScreen);
  document.documentElement.style.overflow = "";
});
</script>

<style scoped>
/* ── Top bar ─────────────────────────────────────────────── */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--topbar-height);
  z-index: 100; /* above the menu overlay, so the X stays clickable */

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 clamp(16px, 4vw, 48px);

  background: rgba(5, 8, 13, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 240, 255, 0.12);
}

/* Glowing neon line along the bottom edge */
.topbar::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 2px;
  background: var(--neon-cyan);
  box-shadow:
    0 0 6px rgba(0, 240, 255, 0.7),
    0 0 14px rgba(0, 240, 255, 0.8),
    0 0 28px rgba(0, 240, 255, 0.5);
}

/* ── Logo: ring + K(oltsov) ── */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  letter-spacing: 1px;
  text-decoration: none;
  white-space: nowrap;
  color: var(--neon-cyan);
}

/* The ring (the O): two neon rings, one inside the other.
   The outer ring is the element's own round border; the inner one is its ::before
   pseudo-element, centred inside it. Same drawing as the favicon.
   Whole-pixel sizes keep the rings perfectly centred on every screen. */
.logo-ring {
  position: relative; /* the inner ring is positioned inside this one */
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-shadow:
    0 0 6px rgba(0, 240, 255, 0.6),
    inset 0 0 6px rgba(0, 240, 255, 0.4);
  transition: box-shadow 0.3s ease;
}

/* Inner ring: 4px gap inside the outer ring, slightly dimmer */
.logo-ring::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 2px solid currentColor;
  border-radius: 50%;
  opacity: 0.85;
}

.logo-text {
  text-shadow:
    0 0 6px rgba(0, 240, 255, 0.6),
    0 0 14px rgba(0, 240, 255, 0.3);
  font-size: 20px;
}

/* "oltsov": slides out of the K.
   max-width grows from 0 to enough for the word; overflow: hidden cuts off what doesn't fit yet. */
.logo-surname-rest {
  display: inline-block;
  vertical-align: bottom;
  max-width: 6em;
  overflow: hidden;
  transition:
    max-width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.4s ease;
  font-size: 20px;
}

/* While the hero is on screen: only the K is shown */
.logo-surname-rest.hidden {
  max-width: 0;
  opacity: 0;
}

/* Hover: the ring glows brighter */
.logo:hover .logo-ring {
  box-shadow:
    0 0 10px rgba(0, 240, 255, 1),
    inset 0 0 8px rgba(0, 240, 255, 0.6);
}

/* ── Desktop links ───────────────────────────────────────── */
.nav-desktop {
  display: flex;
  gap: clamp(12px, 3vw, 32px);
}

.nav-desktop a {
  position: relative;
  padding: 6px 0;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition:
    color 0.25s ease,
    text-shadow 0.25s ease;
}

/* Glowing underline, grows in from the centre */
.nav-desktop a::after {
  content: "";
  position: absolute;
  left: 50%;
  right: 50%;
  bottom: 0;
  height: 2px;
  border-radius: 2px;
  background: currentColor;
  box-shadow:
    0 0 6px currentColor,
    0 0 12px currentColor;
  transition:
    left 0.3s ease,
    right 0.3s ease;
}

/* Hover and active: full-brightness cyan with a glow (inactive links are dimmer) */
.nav-desktop a:hover,
.nav-desktop a.active {
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
}

.nav-desktop a:hover::after,
.nav-desktop a.active::after {
  left: 0;
  right: 0;
}

/* ── Hamburger button ────────────────────────────────────── */
.hamburger {
  display: none; /* only shown on narrow screens */
  position: relative;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.hamburger span {
  position: absolute;
  left: 6px;
  right: 6px;
  height: 2px;
  border-radius: 2px;
  background: var(--neon-cyan);
  box-shadow:
    0 0 4px var(--neon-cyan),
    0 0 10px rgba(0, 240, 255, 0.7);
  transition:
    transform 0.35s ease,
    opacity 0.2s ease,
    top 0.35s ease,
    background 0.35s ease,
    box-shadow 0.35s ease;
}

.hamburger span:nth-child(1) {
  top: 11px;
}
.hamburger span:nth-child(2) {
  top: 17px;
}
.hamburger span:nth-child(3) {
  top: 23px;
}

/* Morph into an X */
.hamburger.open span {
  background: var(--neon-cyan);
  box-shadow:
    0 0 4px var(--neon-cyan),
    0 0 10px rgba(0, 240, 255, 0.7);
}
.hamburger.open span:nth-child(1) {
  top: 17px;
  transform: rotate(45deg);
}
.hamburger.open span:nth-child(2) {
  opacity: 0;
}
.hamburger.open span:nth-child(3) {
  top: 17px;
  transform: rotate(-45deg);
}

/* ── Full-screen menu ────────────────────────────────────── */
.menu-overlay {
  position: fixed;
  inset: 0;
  height: 100dvh;
  z-index: 90;
  padding-top: var(
    --topbar-height
  ); /* links are centred in the space below the top bar */

  display: flex;
  align-items: center;
  justify-content: center;

  /* Dark base with soft neon light pooling in the corners */
  background:
    radial-gradient(
      circle at 15% 20%,
      rgba(0, 240, 255, 0.14),
      transparent 45%
    ),
    radial-gradient(
      circle at 85% 80%,
      rgba(0, 240, 255, 0.16),
      transparent 45%
    ),
    radial-gradient(
      circle at 50% 50%,
      rgba(0, 240, 255, 0.08),
      transparent 60%
    ),
    var(--bg);
}

.nav-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(
    12px,
    4vh,
    32px
  ); /* smaller gaps on short screens (phones held sideways) */
}

.nav-mobile a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: clamp(
    1.4rem,
    min(8vw, 8vh),
    2.6rem
  ); /* fits both narrow and short screens */
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.35);
  transition:
    color 0.25s ease,
    text-shadow 0.25s ease,
    transform 0.25s ease;
}

.nav-mobile a:hover {
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
  transform: scale(1.05);
}

.nav-mobile a.active {
  color: var(--neon-cyan);
  text-shadow: var(--glow-cyan);
}

/* ── Opening / closing effect ────────────────────────────────
   The screen fades and slides in from the top, then the links
   rise in one after another (--link-index = the link's position) and "power on"
   with a short neon flicker.
──────────────────────────────────────────────────────────────── */
.menu-enter-active,
.menu-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-24px);
}

.menu-enter-active .nav-mobile a {
  animation: link-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(0.1s + var(--link-index) * 0.08s);
}

@keyframes link-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  60% {
    opacity: 1;
    transform: translateY(0);
  }
  70% {
    opacity: 0.4;
  }
  80% {
    opacity: 1;
  }
  90% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Switch to hamburger on narrow screens ───────────────── */
@media (max-width: 768px) {
  .nav-desktop {
    display: none;
  }
  .hamburger {
    display: block;
  }
}

/* Respect users who prefer less motion */
@media (prefers-reduced-motion: reduce) {
  .menu-enter-active,
  .menu-leave-active,
  .hamburger span,
  .nav-desktop a::after,
  .logo-ring,
  .logo-surname-rest {
    transition: none;
  }
  .menu-enter-active .nav-mobile a {
    animation: none;
  }
}
</style>
