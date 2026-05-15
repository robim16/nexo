<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="toast-item"
        :class="[`toast-item--${toast.type}`]"
      >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </div>
        <div class="toast-body">
          <span class="toast-message">{{ toast.message }}</span>
          <div v-if="toast.actions && toast.actions.length" class="toast-actions">
            <button
              v-for="action in toast.actions"
              :key="action.label"
              class="toast-action-btn"
              :class="`toast-action-btn--${action.variant ?? 'primary'}`"
              @click="handleAction(toast.id, action)"
            >
              {{ action.label }}
            </button>
          </div>
        </div>
        <button v-if="!toast.actions?.length" class="toast-close" @click="uiStore.removeToast(toast.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useUIStore } from '@/application/stores/ui.store'
import type { ToastAction } from '@/application/stores/ui.store'

const uiStore = useUIStore()

const handleAction = async (toastId: string, action: ToastAction) => {
  uiStore.removeToast(toastId)
  await action.handler()
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 9999;
  pointer-events: none;
}

.toast-item {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border: 1px solid var(--surface-glass-border);
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-width: 400px;
  color: var(--text-primary);
}

.toast-item--success {
  border-left: 4px solid var(--color-success);
}

.toast-item--error {
  border-left: 4px solid var(--color-error);
}

.toast-item--info {
  border-left: 4px solid var(--color-primary);
}

.toast-item--warning {
  border-left: 4px solid var(--color-warning);
}

.toast-item--confirm {
  border-left: 4px solid var(--color-warning);
}

.toast-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-item--success .toast-icon { color: var(--color-success); }
.toast-item--error .toast-icon { color: var(--color-error); }
.toast-item--info .toast-icon { color: var(--color-primary); }
.toast-item--warning .toast-icon { color: var(--color-warning); }
.toast-item--confirm .toast-icon { color: var(--color-warning); }

.toast-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.toast-message {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.toast-actions {
  display: flex;
  gap: var(--space-2);
}

.toast-action-btn {
  padding: 4px 14px;
  border-radius: var(--radius-full);
  border: none;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-sans);
  cursor: pointer;
  transition: var(--transition-base);
}

.toast-action-btn--primary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-secondary);
}

.toast-action-btn--primary:hover {
  background: rgba(255, 255, 255, 0.14);
  color: var(--text-primary);
}

.toast-action-btn--danger {
  background: rgba(var(--color-error-rgb), 0.15);
  color: var(--color-error);
}

.toast-action-btn--danger:hover {
  background: rgba(var(--color-error-rgb), 0.25);
}

.toast-close {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.toast-close svg {
  width: 14px;
  height: 14px;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.9);
}
</style>
