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

  background: rgba(11, 11, 15, 0.85);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.logo {
  color: var(--accent);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

/* ── Desktop links ───────────────────────────────────────── */
.nav-desktop {
  display: flex;
  gap: clamp(12px, 3vw, 32px);
}

.nav-desktop a {
  color: var(--text);
  text-decoration: none;
  font-size: 0.95rem;
  opacity: 0.7;
  transition:
    opacity 0.2s,
    color 0.2s;
}

.nav-desktop a:hover,
.nav-desktop a.active {
  opacity: 1;
  color: var(--accent);
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
  background: var(--text);
  transition:
    transform 0.35s ease,
    opacity 0.2s ease,
    top 0.35s ease;
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

  background: var(--bg);
}

.nav-mobile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.nav-mobile a {
  color: var(--text);
  text-decoration: none;
  font-size: clamp(1.8rem, 8vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 1px;
  transition: color 0.2s;
}

.nav-mobile a.active,
.nav-mobile a:hover {
  color: var(--accent);
}

/* ── Opening / closing effect ────────────────────────────────
   The screen fades and slides in from the top,
   then the links rise in one after another (--i = link index).
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
  animation: link-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: calc(0.1s + var(--i) * 0.07s);
}

@keyframes link-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
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
  .hamburger span {
    transition: none;
  }
  .menu-enter-active .nav-mobile a {
    animation: none;
  }
}
</style>
