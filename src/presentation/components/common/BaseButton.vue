<script setup lang="ts">
/**
 * BaseButton — Componente base de botón
 * Sin lógica de negocio. Solo presentación y estados.
 */

interface Props {
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'gradient'
  /** Tamaño del botón */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Estado de carga */
  loading?: boolean
  /** Estado deshabilitado */
  disabled?: boolean
  /** Ícono solo (cuadrado) */
  iconOnly?: boolean
  /** Ancho completo */
  fullWidth?: boolean
  /** Tipo HTML */
  type?: 'button' | 'submit' | 'reset'
  /** Pill (bordes redondeados completos) */
  pill?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  iconOnly: false,
  fullWidth: false,
  type: 'button',
  pill: false,
})

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :aria-disabled="disabled || loading"
    :class="[
      'base-btn',
      `base-btn--${variant}`,
      `base-btn--${size}`,
      {
        'base-btn--loading': loading,
        'base-btn--icon-only': iconOnly,
        'base-btn--full': fullWidth,
        'base-btn--pill': pill,
      },
    ]"
    @click="!disabled && !loading && $emit('click', $event)"
  >
    <!-- Leading slot -->
    <span v-if="$slots.icon && !loading" class="base-btn__icon" aria-hidden="true">
      <slot name="icon" />
    </span>

    <!-- Spinner cuando loading -->
    <span v-if="loading" class="base-btn__spinner" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="12" cy="12" r="10"
          stroke="currentColor" stroke-width="2.5"
          stroke-linecap="round"
          stroke-dasharray="31.42"
          stroke-dashoffset="10"
          class="base-btn__spinner-circle"
        />
      </svg>
    </span>

    <!-- Label -->
    <span v-if="!iconOnly" class="base-btn__label">
      <slot />
    </span>

    <!-- Trailing slot -->
    <span v-if="$slots.trailing && !loading" class="base-btn__trailing" aria-hidden="true">
      <slot name="trailing" />
    </span>
  </button>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.base-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  font-family: var(--font-sans);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  white-space: nowrap;
  border: 1.5px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  user-select: none;
  transition:
    background-color var(--duration-base) var(--ease-in-out),
    border-color var(--duration-base) var(--ease-in-out),
    color var(--duration-base) var(--ease-in-out),
    box-shadow var(--duration-base) var(--ease-in-out),
    transform var(--duration-fast) var(--ease-spring),
    opacity var(--duration-base) var(--ease-in-out);
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
  outline: none;
}

.base-btn:focus-visible {
  outline: 2px solid var(--border-brand);
  outline-offset: 2px;
}

.base-btn:not(:disabled):active {
  transform: scale(0.97);
}

/* ── Sizes ──────────────────────────────────────────────────── */
.base-btn--xs {
  height: var(--btn-height-xs);
  padding-inline: var(--space-2-5);
  font-size: var(--font-size-xs);
  border-radius: var(--radius-md);
  gap: var(--space-1);
}
.base-btn--sm {
  height: var(--btn-height-sm);
  padding-inline: var(--space-3-5);
  font-size: var(--font-size-sm);
}
.base-btn--md {
  height: var(--btn-height-md);
  padding-inline: var(--space-5);
  font-size: var(--font-size-sm);
}
.base-btn--lg {
  height: var(--btn-height-lg);
  padding-inline: var(--space-6);
  font-size: var(--font-size-base);
}
.base-btn--xl {
  height: var(--btn-height-xl);
  padding-inline: var(--space-8);
  font-size: var(--font-size-md);
}

/* ── Pill modifier ──────────────────────────────────────────── */
.base-btn--pill { border-radius: var(--radius-full); }

/* ── Full width ─────────────────────────────────────────────── */
.base-btn--full { width: 100%; }

/* ── Icon only ──────────────────────────────────────────────── */
.base-btn--icon-only { padding: 0; aspect-ratio: 1; }

/* ── Variants ───────────────────────────────────────────────── */

/* Primary */
.base-btn--primary {
  background-color: var(--interactive-primary);
  color: var(--text-inverse);
  border-color: var(--interactive-primary);
}
.base-btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
  border-color: var(--interactive-primary-hover);
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(61, 98, 245, 0.15);
}

/* Secondary */
.base-btn--secondary {
  background-color: var(--interactive-secondary);
  color: var(--text-primary);
  border-color: var(--border-subtle);
}
.base-btn--secondary:hover:not(:disabled) {
  background-color: var(--interactive-secondary-hover);
  border-color: var(--border-default);
}

/* Ghost */
.base-btn--ghost {
  background-color: transparent;
  color: var(--text-primary);
  border-color: transparent;
}
.base-btn--ghost:hover:not(:disabled) {
  background-color: var(--interactive-secondary);
  border-color: var(--border-subtle);
}

/* Outline */
.base-btn--outline {
  background-color: transparent;
  color: var(--interactive-primary);
  border-color: var(--border-brand);
}
.base-btn--outline:hover:not(:disabled) {
  background-color: var(--color-brand-50);
  box-shadow: 0 0 0 3px rgba(61, 98, 245, 0.1);
}

/* Danger */
.base-btn--danger {
  background-color: var(--interactive-danger);
  color: var(--text-inverse);
  border-color: var(--interactive-danger);
}
.base-btn--danger:hover:not(:disabled) {
  background-color: var(--interactive-danger-hover);
  border-color: var(--interactive-danger-hover);
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(239, 68, 68, 0.15);
}

/* Success */
.base-btn--success {
  background-color: var(--color-success-500);
  color: var(--text-inverse);
  border-color: var(--color-success-500);
}
.base-btn--success:hover:not(:disabled) {
  background-color: var(--color-success-700);
  border-color: var(--color-success-700);
  box-shadow: var(--shadow-md), 0 0 0 3px rgba(34, 197, 94, 0.15);
}

/* Gradient */
.base-btn--gradient {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-accent-500));
  color: var(--text-inverse);
  border-color: transparent;
}
.base-btn--gradient:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--color-brand-600), var(--color-accent-600));
  box-shadow: var(--shadow-glow-brand);
}

/* ── Disabled ───────────────────────────────────────────────── */
.base-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

/* ── Loading state ──────────────────────────────────────────── */
.base-btn--loading {
  cursor: wait;
}

/* ── Spinner ────────────────────────────────────────────────── */
.base-btn__spinner {
  width: 1em;
  height: 1em;
  flex-shrink: 0;
}

.base-btn__spinner svg {
  width: 100%;
  height: 100%;
  animation: spin 0.75s linear infinite;
}

.base-btn__spinner-circle {
  transform-origin: center;
}

/* ── Icon ───────────────────────────────────────────────────── */
.base-btn__icon,
.base-btn__trailing {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 1.1em;
}

/* ── Label ──────────────────────────────────────────────────── */
.base-btn__label {
  display: inline-flex;
  align-items: center;
}

/* ── Dark mode overrides ────────────────────────────────────── */
.dark .base-btn--outline:hover:not(:disabled) {
  background-color: rgba(61, 98, 245, 0.1);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
