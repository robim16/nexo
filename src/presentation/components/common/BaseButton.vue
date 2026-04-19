<script setup lang="ts">
/**
 * BaseButton — Componente base de botón (Nexo Lumina Edition)
 * Sin lógica de negocio. Solo presentación y estados.
 */

interface Props {
  /** Variante visual */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline' | 'gradient' | 'glass'
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
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: var(--btn-radius);
  cursor: pointer;
  user-select: none;
  transition: var(--transition-base);
  -webkit-tap-highlight-color: transparent;
  text-decoration: none;
  outline: none;
}

.base-btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.base-btn:not(:disabled):active {
  transform: scale(0.96);
}

/* ── Sizes ──────────────────────────────────────────────────── */
.base-btn--xs {
  height: 2rem;
  padding-inline: var(--space-3);
  font-size: var(--font-size-2xs);
  border-radius: var(--radius-md);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}
.base-btn--sm {
  height: 2.5rem;
  padding-inline: var(--space-4);
  font-size: var(--font-size-xs);
}
.base-btn--md {
  height: 3rem;
  padding-inline: var(--space-6);
  font-size: var(--font-size-sm);
}
.base-btn--lg {
  height: 3.5rem;
  padding-inline: var(--space-8);
  font-size: var(--font-size-base);
}
.base-btn--xl {
  height: 4rem;
  padding-inline: var(--space-12);
  font-size: var(--font-size-md);
}

/* ── Modifiers ─────────────────────────────────────────────── */
.base-btn--pill { border-radius: var(--radius-full); }
.base-btn--full { width: 100%; }
.base-btn--icon-only { padding: 0; aspect-ratio: 1; }

/* ── Variants ───────────────────────────────────────────────── */

/* Primary (Neon Pink) */
.base-btn--primary {
  background-color: var(--color-primary);
  color: var(--text-inverse);
  box-shadow: var(--glow-primary);
}
.base-btn--primary:hover:not(:disabled) {
  background-color: var(--interactive-primary-hover);
  box-shadow: 0 0 30px rgba(255, 0, 127, 0.6);
  transform: translateY(-2px);
}

/* Secondary (Glass) */
.base-btn--secondary {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
  border-color: var(--surface-glass-border);
  backdrop-filter: var(--backdrop-blur);
}
.base-btn--secondary:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Glass Variant (Explicit) */
.base-btn--glass {
  background: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  border-color: rgba(var(--color-primary-rgb), 0.2);
  backdrop-filter: var(--backdrop-blur);
}
.base-btn--glass:hover:not(:disabled) {
  background: rgba(var(--color-primary-rgb), 0.2);
  box-shadow: var(--glow-primary);
}

/* Ghost */
.base-btn--ghost {
  background-color: transparent;
  color: var(--text-secondary);
}
.base-btn--ghost:hover:not(:disabled) {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
}

/* Outline */
.base-btn--outline {
  background-color: transparent;
  color: var(--color-secondary);
  border-color: var(--color-secondary);
}
.base-btn--outline:hover:not(:disabled) {
  background-color: rgba(0, 251, 251, 0.05);
  box-shadow: var(--glow-secondary);
}

/* Danger */
.base-btn--danger {
  background-color: var(--color-error);
  color: var(--text-inverse);
}
.base-btn--danger:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 0 20px rgba(255, 61, 113, 0.4);
}

/* Success */
.base-btn--success {
  background-color: var(--color-success);
  color: var(--text-inverse);
}
.base-btn--success:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 0 20px rgba(0, 245, 160, 0.4);
}

/* Gradient (Pink to Cyan) */
.base-btn--gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: var(--text-inverse);
  box-shadow: 0 0 20px rgba(127, 127, 255, 0.3);
}
.base-btn--gradient:hover:not(:disabled) {
  filter: saturate(1.2);
  box-shadow: 0 0 30px rgba(127, 127, 255, 0.5);
  transform: translateY(-2px);
}

/* ── Disabled ───────────────────────────────────────────────── */
.base-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

/* ── Loading ────────────────────────────────────────────────── */
.base-btn--loading {
  cursor: wait;
}

.base-btn__spinner {
  width: 1.25em;
  height: 1.25em;
}

.base-btn__spinner svg {
  animation: spin 0.8s linear infinite;
}

/* ── Icon ───────────────────────────────────────────────────── */
.base-btn__icon,
.base-btn__trailing {
  display: inline-flex;
  align-items: center;
  font-size: 1.2em;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
