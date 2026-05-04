<script setup lang="ts">
/**
 * BaseAvatar — Componente base de avatar
 * Sin lógica de negocio. Solo presentación.
 */
import { computed } from 'vue'

interface Props {
  /** URL de la imagen */
  src?: string | null
  /** Nombre para iniciales y alt */
  name?: string
  /** Tamaño */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Forma */
  shape?: 'circle' | 'square'
  /** Indicador de estado */
  status?: 'online' | 'offline' | 'busy' | 'away' | null
  /** Mostrar borde */
  bordered?: boolean
  /** Variante de color de iniciales */
  colorSeed?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  shape: 'circle',
  status: null,
  bordered: false
})

// Derivar iniciales del nombre
const initials = computed(() => {
  if (!props.name) return '?'
  const parts = props.name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
})

// Paleta de colores para iniciales basada en el nombre
const AVATAR_COLORS = [
  ['#3d62f5', '#e0eaff'], // brand
  ['#a855f7', '#f3e8ff'], // accent
  ['#22c55e', '#f0fdf4'], // green
  ['#f59e0b', '#fffbeb'], // amber
  ['#ef4444', '#fef2f2'], // red
  ['#06b6d4', '#ecfeff'], // cyan
  ['#ec4899', '#fdf2f8'], // pink
  ['#8b5cf6', '#ede9fe'] // violet
]

const avatarColor = computed(() => {
  const seed = props.colorSeed || props.name || '?'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % AVATAR_COLORS.length
  return AVATAR_COLORS[idx]
}) //esta función computada se encarga de generar
//un color aleatorio para el avatar, dependiendo del nombre del usuario

const hasImage = computed(() => !!props.src)

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    online: 'En línea',
    offline: 'Desconectado',
    busy: 'Ocupado',
    away: 'Ausente'
  }
  return props.status ? map[props.status] : null
})
</script>

<template>
  <span
    :class="[
      'base-avatar',
      `base-avatar--${size}`,
      `base-avatar--${shape}`,
      { 'base-avatar--bordered': bordered }
    ]"
    role="img"
    :aria-label="name || 'Avatar'"
  >
    <!-- Image -->
    <img
      v-if="hasImage"
      :src="src!"
      :alt="name || 'Avatar'"
      class="base-avatar__image"
      loading="lazy"
      decoding="async"
    />

    <!-- Initials fallback -->
    <span
      v-else
      class="base-avatar__initials"
      :style="{
        color: avatarColor[0],
        backgroundColor: avatarColor[1]
      }"
      aria-hidden="true"
    >
      {{ initials }}
    </span>

    <!-- Status indicator -->
    <span
      v-if="status"
      :class="['base-avatar__status', `base-avatar__status--${status}`]"
      :aria-label="statusLabel || undefined"
      role="status"
    />

    <!-- Custom badge via slot -->
    <span v-if="$slots.badge" class="base-avatar__badge" aria-hidden="true">
      <slot name="badge" />
    </span>
  </span>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.base-avatar {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  background-color: var(--surface-sunken);
  transition: transform var(--duration-base) var(--ease-spring);
}

/* ── Sizes ───────────────────────────────────────────────────── */
.base-avatar--xs {
  width: var(--avatar-size-xs);
  height: var(--avatar-size-xs);
  font-size: var(--font-size-2xs);
}
.base-avatar--sm {
  width: var(--avatar-size-sm);
  height: var(--avatar-size-sm);
  font-size: var(--font-size-xs);
}
.base-avatar--md {
  width: var(--avatar-size-md);
  height: var(--avatar-size-md);
  font-size: var(--font-size-sm);
}
.base-avatar--lg {
  width: var(--avatar-size-lg);
  height: var(--avatar-size-lg);
  font-size: var(--font-size-base);
}
.base-avatar--xl {
  width: var(--avatar-size-xl);
  height: var(--avatar-size-xl);
  font-size: var(--font-size-md);
}
.base-avatar--2xl {
  width: var(--avatar-size-2xl);
  height: var(--avatar-size-2xl);
  font-size: var(--font-size-xl);
}

/* ── Shapes ──────────────────────────────────────────────────── */
.base-avatar--circle {
  border-radius: var(--radius-full);
}
.base-avatar--square {
  border-radius: var(--radius-lg);
}

/* ── Border ──────────────────────────────────────────────────── */
.base-avatar--bordered {
  box-shadow:
    0 0 0 2px var(--surface-elevated),
    0 0 0 4px var(--border-default);
}

/* ── Image ───────────────────────────────────────────────────── */
.base-avatar__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}

/* ── Initials ────────────────────────────────────────────────── */
.base-avatar__initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--letter-spacing-wide);
  line-height: 1;
  border-radius: inherit;
  user-select: none;
}

/* ── Status indicator ────────────────────────────────────────── */
.base-avatar__status {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: var(--radius-full);
  border: 2px solid var(--surface-elevated);
  transform: translate(15%, 15%);
}

/* Size proportional to avatar */
.base-avatar--xs .base-avatar__status {
  width: 6px;
  height: 6px;
  border-width: 1.5px;
}
.base-avatar--sm .base-avatar__status {
  width: 8px;
  height: 8px;
}
.base-avatar--md .base-avatar__status {
  width: 10px;
  height: 10px;
}
.base-avatar--lg .base-avatar__status {
  width: 12px;
  height: 12px;
}
.base-avatar--xl .base-avatar__status {
  width: 14px;
  height: 14px;
}
.base-avatar--2xl .base-avatar__status {
  width: 16px;
  height: 16px;
}

.base-avatar__status--online {
  background-color: var(--color-success-500);
}
.base-avatar__status--offline {
  background-color: var(--color-neutral-400);
}
.base-avatar__status--busy {
  background-color: var(--color-error-500);
}
.base-avatar__status--away {
  background-color: var(--color-warning-500);
}

/* Online pulse animation */
.base-avatar__status--online::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--radius-full);
  background-color: var(--color-success-500);
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
  opacity: 0.5;
}

/* ── Badge slot ──────────────────────────────────────────────── */
.base-avatar__badge {
  position: absolute;
  top: -2px;
  right: -2px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
