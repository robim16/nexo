<script setup lang="ts">
/**
 * ErrorBoundary — Atrapa errores en componentes descendientes
 * Usando onErrorCaptured.
 */
import { ref, onErrorCaptured } from 'vue'

const hasError = ref(false)
const errorData = ref<Error | null>(null)
const errorInfo = ref<string>('')

interface Props {
  /** Mensaje amigable al usuario (opcional) */
  fallbackMessage?: string
  /** Mostrar detalles técnicos */
  showDetails?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  fallbackMessage: 'Ha ocurrido un error inesperado al renderizar este componente.',
  showDetails: false
})

const emit = defineEmits<{
  error: [error: Error, info: string]
}>()

onErrorCaptured((err: unknown, instance, info) => {
  hasError.value = true
  if (err instanceof Error) {
    errorData.value = err
  } else {
    errorData.value = new Error(String(err))
  }
  errorInfo.value = info

  emit('error', errorData.value, info)

  // Retornar falso previene que el error se propague más arriba en el árbol
  return false
})

function resetError() {
  hasError.value = false
  errorData.value = null
  errorInfo.value = ''
}
</script>

<template>
  <template v-if="hasError">
    <div class="error-boundary-wrapper">
      <slot name="fallback" :error="errorData" :reset="resetError">
        <div
          class="error-boundary-ui base-card base-card--elevated base-card--p-lg base-card--r-lg"
        >
          <div class="error-boundary-ui__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 class="error-boundary-ui__title">Algo salió mal</h3>
          <p class="error-boundary-ui__desc">{{ fallbackMessage }}</p>

          <details v-if="showDetails && errorData" class="error-boundary-ui__details">
            <summary>Ver detalles técnicos</summary>
            <pre><code>{{ errorData.message }}
{{ errorData.stack }}
Component Info: {{ errorInfo }}</code></pre>
          </details>

          <button class="base-btn base-btn--secondary base-btn--md" @click="resetError">
            Intentar nuevamente
          </button>
        </div>
      </slot>
    </div>
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<style scoped>
.error-boundary-wrapper {
  padding: var(--space-4);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.error-boundary-ui {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-3);
  max-width: var(--container-md);
  margin: 0 auto;
}

.error-boundary-ui__icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-error-500);
}

.error-boundary-ui__icon svg {
  width: 100%;
  height: 100%;
}

.error-boundary-ui__title {
  color: var(--text-primary);
  margin: 0;
}

.error-boundary-ui__desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin: 0;
}

.error-boundary-ui__details {
  text-align: left;
  width: 100%;
  margin-top: var(--space-4);
  background-color: var(--surface-sunken);
  border-radius: var(--radius-md);
  padding: var(--space-3);
}

.error-boundary-ui__details summary {
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  cursor: pointer;
  user-select: none;
}

.error-boundary-ui__details pre {
  margin-top: var(--space-2);
  margin-bottom: 0;
  font-size: var(--font-size-xs);
  color: var(--text-primary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
