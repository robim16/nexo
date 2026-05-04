<script setup lang="ts">
/**
 * LoadingSpinner — Componente de indicador de carga radial (spinner)
 * Sin lógica de negocio.
 */

interface Props {
  /** Variante color (hereda por defecto) */
  color?: 'current' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'white'
  /** Tamaño absoluto o relativo */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string
  /** Grosor del trazo */
  thickness?: number
  /** Ocultar para scren-readers si es puramente decorativo */
  decorative?: boolean
  /** Label para a11y (si no es decorativo) */
  label?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'current',
  size: 'md',
  thickness: 2.5,
  decorative: false,
  label: 'Cargando...'
})

const sizeMap: Record<string, string> = {
  xs: '1rem',
  sm: '1.25rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem'
}

const resolveSize = computed(() => {
  return sizeMap[props.size] || props.size
})

import { computed } from 'vue'

const resolveColor = computed(() => {
  const map: Record<string, string> = {
    current: 'currentColor',
    primary: 'var(--color-brand-500)',
    accent: 'var(--color-accent-500)',
    success: 'var(--color-success-500)',
    warning: 'var(--color-warning-500)',
    error: 'var(--color-error-500)',
    white: '#ffffff'
  }
  return map[props.color] || map.current
})
</script>

<template>
  <div
    class="loading-spinner"
    :style="{ width: resolveSize, height: resolveSize, color: resolveColor }"
    role="status"
    :aria-hidden="decorative"
    :aria-label="!decorative ? label : undefined"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="loading-spinner__svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        :stroke-width="thickness"
        stroke-linecap="round"
        class="loading-spinner__circle loading-spinner__circle--track"
      />
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        :stroke-width="thickness"
        stroke-linecap="round"
        class="loading-spinner__circle loading-spinner__circle--path"
      />
    </svg>
    <span v-if="!decorative" class="sr-only">{{ label }}</span>
  </div>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.loading-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* ── SVG ────────────────────────────────────────────────────── */
.loading-spinner__svg {
  width: 100%;
  height: 100%;
  animation: spin 0.8s linear infinite;
  transform-origin: center;
}

/* ── Circles ────────────────────────────────────────────────── */
.loading-spinner__circle--track {
  opacity: 0.15;
}

.loading-spinner__circle--path {
  stroke-dasharray: 45 100;
  stroke-dashoffset: 0;
  animation: stroke-dash 2s ease-in-out infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes stroke-dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 45 150;
    stroke-dashoffset: -15;
  }
  100% {
    stroke-dasharray: 45 150;
    stroke-dashoffset: -60;
  }
}
</style>
