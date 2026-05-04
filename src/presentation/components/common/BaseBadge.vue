<script setup lang="ts">
/**
 * BaseBadge — Etiqueta/chip de estado reutilizable
 * Sin lógica de negocio. Solo presentación.
 */

interface Props {
  /** Variante semántica */
  variant?: 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'outline'
  /** Tamaño */
  size?: 'sm' | 'md' | 'lg'
  /** Pill (completamente redondeado) */
  pill?: boolean
  /** Con punto indicador */
  dot?: boolean
  /** Removible */
  removable?: boolean
  /** Texto del badge (alternativa al slot) */
  label?: string
}

withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  pill: true,
  dot: false,
  removable: false
})

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <span
    :class="[
      'base-badge',
      `base-badge--${variant}`,
      `base-badge--${size}`,
      { 'base-badge--pill': pill }
    ]"
  >
    <!-- Status dot -->
    <span v-if="dot" class="base-badge__dot" aria-hidden="true" />

    <!-- Leading icon slot -->
    <span v-if="$slots.icon" class="base-badge__icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <!-- Label / Default slot -->
    <span class="base-badge__label">
      <slot>{{ label }}</slot>
    </span>

    <!-- Remove button -->
    <button
      v-if="removable"
      type="button"
      class="base-badge__remove"
      aria-label="Eliminar"
      @click.stop="emit('remove')"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.base-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  border: 1.5px solid transparent;
  border-radius: var(--radius-md);
  transition: var(--transition-colors);
}

/* ── Pill ────────────────────────────────────────────────────── */
.base-badge--pill {
  border-radius: var(--radius-full);
}

/* ── Sizes ───────────────────────────────────────────────────── */
.base-badge--sm {
  height: var(--badge-height-sm);
  padding-inline: var(--space-2);
  font-size: var(--font-size-2xs);
}
.base-badge--md {
  height: var(--badge-height-md);
  padding-inline: var(--space-2-5);
  font-size: var(--font-size-xs);
}
.base-badge--lg {
  height: var(--badge-height-lg);
  padding-inline: var(--space-3);
  font-size: var(--font-size-sm);
}

/* ── Variants ────────────────────────────────────────────────── */
.base-badge--default {
  background-color: var(--surface-sunken);
  color: var(--text-secondary);
  border-color: var(--border-subtle);
}

.base-badge--primary {
  background-color: var(--color-brand-100);
  color: var(--color-brand-700);
  border-color: var(--color-brand-200);
}

.base-badge--accent {
  background-color: var(--color-accent-100);
  color: var(--color-accent-700);
  border-color: var(--color-accent-200);
}

.base-badge--success {
  background-color: var(--color-success-50);
  color: var(--color-success-700);
  border-color: rgb(134 239 172 / 0.5);
}

.base-badge--warning {
  background-color: var(--color-warning-50);
  color: var(--color-warning-700);
  border-color: rgb(253 211 77 / 0.5);
}

.base-badge--error {
  background-color: var(--color-error-50);
  color: var(--color-error-700);
  border-color: rgb(252 165 165 / 0.5);
}

.base-badge--info {
  background-color: var(--color-info-50);
  color: var(--color-info-700);
  border-color: rgb(147 197 253 / 0.5);
}

.base-badge--outline {
  background-color: transparent;
  color: var(--text-primary);
  border-color: var(--border-default);
}

/* ── Dark mode overrides ─────────────────────────────────────── */
.dark .base-badge--primary {
  background-color: rgba(61, 98, 245, 0.15);
  color: var(--color-brand-300);
  border-color: rgba(61, 98, 245, 0.3);
}

.dark .base-badge--accent {
  background-color: rgba(168, 85, 247, 0.15);
  color: var(--color-accent-300);
  border-color: rgba(168, 85, 247, 0.3);
}

.dark .base-badge--success {
  background-color: rgba(34, 197, 94, 0.15);
  color: #4ade80;
  border-color: rgba(34, 197, 94, 0.3);
}

.dark .base-badge--warning {
  background-color: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.dark .base-badge--error {
  background-color: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.dark .base-badge--info {
  background-color: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

/* ── Dot ─────────────────────────────────────────────────────── */
.base-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: currentColor;
  flex-shrink: 0;
}

/* ── Icon ────────────────────────────────────────────────────── */
.base-badge__icon {
  display: inline-flex;
  align-items: center;
  font-size: 0.9em;
  flex-shrink: 0;
}

/* ── Label ───────────────────────────────────────────────────── */
.base-badge__label {
  display: inline-flex;
  align-items: center;
}

/* ── Remove ──────────────────────────────────────────────────── */
.base-badge__remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  border-radius: var(--radius-full);
  cursor: pointer;
  color: currentColor;
  opacity: 0.6;
  transition:
    opacity var(--duration-fast) var(--ease-in-out),
    background-color var(--duration-fast) var(--ease-in-out);
  flex-shrink: 0;
  margin-left: var(--space-0-5);
}

.base-badge__remove:hover {
  opacity: 1;
  background-color: rgb(0 0 0 / 0.12);
}

.base-badge__remove svg {
  width: 0.7em;
  height: 0.7em;
}
</style>
