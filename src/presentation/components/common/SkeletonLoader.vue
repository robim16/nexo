<script setup lang="ts">
/**
 * SkeletonLoader — Placeholder animado para estados de carga
 * Sin lógica de negocio.
 */

interface Props {
  /** Tipo base del esqueleto */
  type?: 'text' | 'rect' | 'circle'
  /** Ancho (px, rem, % o clases de Tailwind) */
  width?: string
  /** Alto (px, rem, %) */
  height?: string
  /** Clases adicionales inyectadas al estilo o root */
  cssClass?: string
  /** Animación habilitada */
  animated?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  animated: true,
})
</script>

<template>
  <div
    :class="[
      'skeleton-loader',
      `skeleton-loader--${type}`,
      { 'skeleton-loader--animated': animated },
      cssClass
    ]"
    :style="{
      width: width,
      height: height
    }"
    aria-hidden="true"
  />
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.skeleton-loader {
  display: block;
  background-color: var(--surface-sunken);
  /* Fallbacks de tamaño si no se pasan props */
  min-height: 1em;
  flex-shrink: 0;
}

/* ── Animación Shimmer (de utilities.css, reimplementada sutil) */
.skeleton-loader--animated {
  background: linear-gradient(
    90deg,
    var(--surface-sunken) 25%,
    var(--surface-elevated) 37%,
    var(--surface-sunken) 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.4s ease infinite;
}

/* ── Tipos ──────────────────────────────────────────────────── */
.skeleton-loader--text {
  border-radius: var(--radius-sm);
  height: 1em; /* Adaptable al line-height del contenedor */
  margin-block: 0.25em; /* Spacing típico de texto */
  width: 100%;
}

.skeleton-loader--rect {
  border-radius: var(--radius-md);
  width: 100%;
  height: 100%;
}

.skeleton-loader--circle {
  border-radius: var(--radius-full);
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

/* ── Dark mode (shimmer overrides) ──────────────────────────── */
.dark .skeleton-loader--animated {
  background: linear-gradient(
    90deg,
    var(--surface-sunken) 25%,
    var(--border-default) 37%,
    var(--surface-sunken) 63%
  );
  background-size: 400% 100%;
}
</style>
