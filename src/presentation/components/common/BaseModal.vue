<script setup lang="ts">
/**
 * BaseModal — Componente base de modal/diálogo
 * Sin lógica de negocio. Maneja a11y, foco trampa y cierre keyboard.
 */
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useId } from 'vue'

interface Props {
  /** Visibilidad del modal */
  modelValue: boolean
  /** Título accesible */
  title?: string
  /** Tamaño del modal */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Cerrar al hacer click en overlay */
  closeOnOverlay?: boolean
  /** Cerrar con Escape */
  closeOnEscape?: boolean
  /** Mostrar botón de cierre */
  showClose?: boolean
  /** Centrado vertical */
  centered?: boolean
  /** Variante de fondo del backdrop */
  backdrop?: 'blur' | 'dark' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closeOnOverlay: true,
  closeOnEscape: true,
  showClose: true,
  centered: true,
  backdrop: 'blur'
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  open: []
}>()

const dialogRef = ref<HTMLDivElement | null>(null)
const titleId = useId()
const descId = useId()

function close() {
  emit('update:modelValue', false)
  emit('close')
}

function onKeydown(event: KeyboardEvent) {
  if (!props.modelValue) return
  if (event.key === 'Escape' && props.closeOnEscape) {
    event.preventDefault()
    close()
  }
  if (event.key === 'Tab') trapFocus(event)
}

function trapFocus(event: KeyboardEvent) {
  if (!dialogRef.value) return
  const focusable = dialogRef.value.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault()
      last?.focus()
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault()
      first?.focus()
    }
  }
}

// Focus first focusable element on open
watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
      await nextTick()
      const firstFocusable = dialogRef.value?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      firstFocusable?.focus()
      emit('open')
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  }
)

onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div
        v-if="modelValue"
        :class="['base-modal__backdrop', `base-modal__backdrop--${backdrop}`]"
        :aria-hidden="!modelValue"
        @click.self="closeOnOverlay && close()"
      >
        <Transition name="scale-fade">
          <div
            v-if="modelValue"
            ref="dialogRef"
            role="dialog"
            :aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            :aria-describedby="$slots.default ? descId : undefined"
            :class="['base-modal', `base-modal--${size}`, { 'base-modal--centered': centered }]"
          >
            <!-- Header -->
            <div v-if="title || showClose || $slots.header" class="base-modal__header">
              <slot name="header">
                <h2 v-if="title" :id="titleId" class="base-modal__title">
                  {{ title }}
                </h2>
              </slot>
              <button
                v-if="showClose"
                type="button"
                class="base-modal__close"
                aria-label="Cerrar modal"
                @click="close"
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
            </div>

            <!-- Body -->
            <div :id="descId" class="base-modal__body">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="base-modal__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ── Backdrop ────────────────────────────────────────────────── */
.base-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  overflow-y: auto;
}

.base-modal__backdrop--blur {
  background-color: var(--surface-overlay);
  backdrop-filter: var(--backdrop-blur-sm);
  -webkit-backdrop-filter: var(--backdrop-blur-sm);
}

.base-modal__backdrop--dark {
  background-color: rgba(0, 0, 0, 0.6);
}

.base-modal__backdrop--none {
  background-color: transparent;
}

/* ── Modal panel ─────────────────────────────────────────────── */
.base-modal {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  max-height: calc(100dvh - var(--space-8));
  overflow: hidden;
}

.base-modal--centered {
  margin: auto;
}

/* ── Sizes ───────────────────────────────────────────────────── */
.base-modal--xs {
  max-width: var(--container-xs);
}
.base-modal--sm {
  max-width: var(--container-sm);
}
.base-modal--md {
  max-width: var(--container-md);
}
.base-modal--lg {
  max-width: var(--container-3xl);
}
.base-modal--xl {
  max-width: var(--container-5xl);
}
.base-modal--full {
  max-width: 100%;
  max-height: 100dvh;
  border-radius: 0;
  margin: 0;
}

/* ── Header ──────────────────────────────────────────────────── */
.base-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.base-modal__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
  margin: 0;
}

/* ── Close button ────────────────────────────────────────────── */
.base-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: var(--radius-lg);
  color: var(--icon-secondary);
  cursor: pointer;
  flex-shrink: 0;
  transition:
    background-color var(--duration-base) var(--ease-in-out),
    color var(--duration-base) var(--ease-in-out);
}

.base-modal__close:hover {
  background-color: var(--interactive-secondary-hover);
  color: var(--text-primary);
}

.base-modal__close:focus-visible {
  outline: 2px solid var(--border-brand);
  outline-offset: 2px;
}

.base-modal__close svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* ── Body ────────────────────────────────────────────────────── */
.base-modal__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  overscroll-behavior: contain;
}

/* ── Footer ──────────────────────────────────────────────────── */
.base-modal__footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

/* ── Transitions ─────────────────────────────────────────────── */
.overlay-enter-active,
.overlay-leave-active {
  transition: opacity var(--duration-slow) var(--ease-in-out);
}
.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.scale-fade-enter-active {
  transition:
    opacity var(--duration-slow) var(--ease-out),
    transform var(--duration-slow) var(--ease-spring);
}
.scale-fade-leave-active {
  transition:
    opacity var(--duration-base) var(--ease-in),
    transform var(--duration-base) var(--ease-in);
}
.scale-fade-enter-from,
.scale-fade-leave-to {
  opacity: 0;
  transform: scale(0.94) translateY(8px);
}

/* ── Mobile ──────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .base-modal__backdrop {
    align-items: flex-end;
    padding: 0;
  }

  .base-modal {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    max-height: 90dvh;
  }

  .scale-fade-enter-from,
  .scale-fade-leave-to {
    opacity: 0;
    transform: translateY(100%);
  }
}
</style>
