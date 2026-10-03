<template>
  <header class="topbar">
    <a class="logo" href="#hero" @click.prevent="go('hero')">Oleg Koltsov</a>

    <!-- Desktop / wide screens: regular links -->
    <nav class="nav-desktop">
      <a
        v-for="section in sections"
        :key="section.id"
        :href="`#${section.id}`"
        :class="{ active: active === section.id }"
        @click.prevent="go(section.id)"
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
        <a
          v-for="(section, i) in sections"
          :key="section.id"
          :href="`#${section.id}`"
          :class="{ active: active === section.id }"
          :style="{ '--i': i }"
          @click.prevent="go(section.id)"
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
  sections: { type: Array, required: true },
  active: { type: String, default: "" },
});
const emit = defineEmits(["navigate"]);

const BREAKPOINT = 768; // keep in sync with the @media rule below
const menuOpen = ref(false);

// Close the menu first, then scroll (scrolling is locked while the menu is open)
const go = async (id) => {
  if (menuOpen.value) {
    menuOpen.value = false;
    await nextTick();
  }
  emit("navigate", id);
};

// Lock page scrolling while the menu is open
watch(menuOpen, (open) => {
  document.documentElement.style.overflow = open ? "hidden" : "";
});

// Close with Escape, and close automatically if the window becomes wide again
const onKey = (e) => {
  if (e.key === "Escape") menuOpen.value = false;
};
const onResize = () => {
  if (window.innerWidth > BREAKPOINT) menuOpen.value = false;
};

onMounted(() => {
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", onResize);
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("resize", onResize);
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

/* Name: neon cyan with a soft glow */
.logo {
  font-weight: 800;
  letter-spacing: 1px;
  text-decoration: none;
  white-space: nowrap;
  color: var(--neon-cyan);
  text-shadow:
    0 0 6px rgba(0, 240, 255, 0.6),
    0 0 14px rgba(0, 240, 255, 0.3);
  transition: text-shadow 0.3s ease;
}

.logo:hover {
  text-shadow: var(--glow-cyan);
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
  gap: 32px;
}

.nav-mobile a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: clamp(1.8rem, 8vw, 2.6rem);
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
   rise in one after another (--i = link index) and "power on"
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
  animation-delay: calc(0.1s + var(--i) * 0.08s);
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
  .nav-desktop a::after {
    transition: none;
  }
  .menu-enter-active .nav-mobile a {
    animation: none;
  }
}
</style>
