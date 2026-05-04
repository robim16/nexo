<script setup lang="ts">
/**
 * EmptyState — Componente para estados vacíos de listas, búsquedas, etc.
 * Sin lógica de negocio.
 */

interface Props {
  /** Título principal */
  title: string
  /** Descripción secundaria */
  description?: string
  /** Ícono opcional (SVG string, pero preferimos slots) */
  icon?: string
}

defineProps<Props>()
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <slot name="icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </slot>
    </div>

    <div class="empty-state__content">
      <h3 class="empty-state__title">{{ title }}</h3>
      <p v-if="description" class="empty-state__description">{{ description }}</p>
    </div>

    <div v-if="$slots.action" class="empty-state__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────────── */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-12) var(--space-6);
  width: 100%;
}

/* ── Icon ───────────────────────────────────────────────────── */
.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  color: var(--icon-tertiary);
  margin-bottom: var(--space-4);
  background-color: var(--surface-sunken);
  border-radius: var(--radius-full);
  padding: var(--space-3);
  animation: scale-in var(--duration-slow) var(--ease-spring);
}

.empty-state__icon :deep(svg) {
  width: 100%;
  height: 100%;
}

/* ── Content ────────────────────────────────────────────────── */
.empty-state__content {
  max-width: 400px;
  animation: slide-up var(--duration-base) var(--ease-out);
}

.empty-state__title {
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-2) 0;
}

.empty-state__description {
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* ── Actions ────────────────────────────────────────────────── */
.empty-state__action {
  margin-top: var(--space-6);
  animation: fade-in var(--duration-slow) var(--ease-out);
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
