<script setup lang="ts">
/**
 * BaseCard — Componente base de tarjeta (Nexo Lumina Edition)
 * Sin lógica de negocio. Contenedor visual reutilizable.
 */

interface Props {
  /** Variante visual */
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost' | 'glass'
  /** Padding interno */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /** Hover interactivo */
  interactive?: boolean
  /** Clickeable (agrega cursor pointer) */
  clickable?: boolean
  /** Radius del borde */
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
  /** Tag HTML */
  as?: string
}

withDefaults(defineProps<BaseCardProps>(), {
  variant: 'default',
  padding: 'md',
  interactive: false,
  clickable: false,
  radius: '2xl',
  as: 'div'
})

type BaseCardProps = Props

defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <component
    :is="as"
    :class="[
      'base-card',
      `base-card--${variant}`,
      `base-card--p-${padding}`,
      `base-card--r-${radius}`,
      {
        'base-card--interactive': interactive,
        'base-card--clickable': clickable
      }
    ]"
    @click="clickable && $emit('click', $event)"
  >
    <!-- Optional header slot -->
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </div>

    <!-- Default (body) slot -->
    <div
      :class="[
        'base-card__body',
        {
          'base-card__body--no-header': !$slots.header,
          'base-card__body--no-footer': !$slots.footer
        }
      ]"
    >
      <slot />
    </div>

    <!-- Optional footer slot -->
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </component>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.base-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: var(--transition-base);
  border: 1px solid transparent;
}

/* ── Variants ───────────────────────────────────────────────── */
.base-card--default {
  background-color: var(--surface-elevated);
  box-shadow: var(--shadow-sm);
}

.base-card--elevated {
  background-color: var(--surface-elevated);
  box-shadow: var(--shadow-lg);
}

.base-card--outlined {
  background-color: transparent;
  border-color: var(--border-default);
  box-shadow: none;
}

.base-card--ghost {
  background-color: transparent;
  border: none;
  box-shadow: none;
}

.base-card--glass {
  background: var(--card-glass);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-color: var(--surface-glass-border);
  box-shadow: var(--shadow-md);
}

/* ── Radius ─────────────────────────────────────────────────── */
.base-card--r-sm {
  border-radius: var(--radius-sm);
}
.base-card--r-md {
  border-radius: var(--radius-md);
}
.base-card--r-lg {
  border-radius: var(--radius-lg);
}
.base-card--r-xl {
  border-radius: var(--radius-xl);
}
.base-card--r-2xl {
  border-radius: var(--radius-2xl);
}
.base-card--r-3xl {
  border-radius: var(--radius-3xl);
}

/* ── Padding ────────────────────────────────────────────────── */
.base-card--p-none .base-card__header,
.base-card--p-none .base-card__body,
.base-card--p-none .base-card__footer {
  padding: 0;
}

.base-card--p-sm .base-card__header,
.base-card--p-sm .base-card__body,
.base-card--p-sm .base-card__footer {
  padding: var(--space-3);
}

.base-card--p-md .base-card__header,
.base-card--p-md .base-card__body,
.base-card--p-md .base-card__footer {
  padding: var(--space-4);
}

.base-card--p-lg .base-card__header,
.base-card--p-lg .base-card__body,
.base-card--p-lg .base-card__footer {
  padding: var(--space-6);
}

.base-card--p-xl .base-card__header,
.base-card--p-xl .base-card__body,
.base-card--p-xl .base-card__footer {
  padding: var(--space-8);
}

/* ── Sections (No-Line Principle) ────────────────────────── */
.base-card__header {
  /* No divider lines, use tonal shifts or spacing */
  background-color: rgba(255, 255, 255, 0.02);
}

.base-card__footer {
  /* No divider lines, use tonal shifts or spacing */
  background-color: rgba(255, 255, 255, 0.02);
  margin-top: auto;
}

.base-card__body {
  flex: 1;
}

/* ── Interactive ────────────────────────────────────────────── */
.base-card--interactive:hover,
.base-card--clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), var(--glow-primary);
  border-color: rgba(255, 0, 127, 0.2);
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.base-card--interactive:active,
.base-card--clickable:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md), var(--glow-primary);
}

.base-card--clickable {
  cursor: pointer;
}
</style>
