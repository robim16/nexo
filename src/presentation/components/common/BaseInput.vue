<script setup lang="ts">
/**
 * BaseInput — Componente base de campo de texto (Nexo Lumina Edition)
 * Sin lógica de negocio. Solo presentación y estados.
 */
import { ref, computed, useId } from 'vue'

interface Props {
  /** Valor (v-model) */
  modelValue?: string | number
  /** Tipo de input */
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' | 'textarea'
  /** Label */
  label?: string
  /** Placeholder */
  placeholder?: string
  /** Texto de ayuda */
  hint?: string
  /** Mensaje de error */
  error?: string
  /** Tamaño */
  size?: 'sm' | 'md' | 'lg'
  /** Deshabilitado */
  disabled?: boolean
  /** Solo lectura */
  readonly?: boolean
  /** Requerido */
  required?: boolean
  /** Ancho completo */
  fullWidth?: boolean
  /** Número de filas (sólo textarea) */
  rows?: number
  /** Máximo de caracteres */
  maxLength?: number
  /** Autofocus */
  autofocus?: boolean
  /** Autocomplete */
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'md',
  disabled: false,
  readonly: false,
  required: false,
  fullWidth: true,
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
}>()

const inputId = useId()
const isFocused = ref(false)
const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type
})

const charCount = computed(() => {
  const val = String(props.modelValue ?? '')
  return val.length
})

function onInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div :class="['base-input-wrapper', { 'base-input-wrapper--full': fullWidth }]">
    <!-- Label -->
    <label v-if="label" :for="inputId" class="base-input__label">
      {{ label }}
      <span v-if="required" class="base-input__required" aria-hidden="true">*</span>
    </label>

    <!-- Field container -->
    <div
      :class="[
        'base-input__field',
        `base-input__field--${size}`,
        {
          'base-input__field--focused': isFocused,
          'base-input__field--error': !!error,
          'base-input__field--disabled': disabled,
          'base-input__field--readonly': readonly
        }
      ]"
    >
      <!-- Leading icon slot -->
      <span
        v-if="$slots.leading"
        class="base-input__icon base-input__icon--leading"
        aria-hidden="true"
      >
        <slot name="leading" />
      </span>

      <!-- Textarea -->
      <textarea
        v-if="type === 'textarea'"
        :id="inputId"
        :value="String(modelValue ?? '')"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :rows="rows"
        :maxlength="maxLength"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        class="base-input__control base-input__control--textarea"
        @input="onInput"
        @focus="
          isFocused = true;
          $emit('focus', $event);
        "
        @blur="
          isFocused = false;
          $emit('blur', $event);
        "
        @keydown="$emit('keydown', $event)"
      />

      <!-- Regular input -->
      <input
        v-else
        :id="inputId"
        :type="inputType"
        :value="String(modelValue ?? '')"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :maxlength="maxLength"
        :autofocus="autofocus"
        :autocomplete="autocomplete"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined"
        class="base-input__control"
        @input="onInput"
        @focus="
          isFocused = true;
          $emit('focus', $event);
        "
        @blur="
          isFocused = false;
          $emit('blur', $event);
        "
        @keydown="$emit('keydown', $event)"
      />

      <!-- Password toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="base-input__icon base-input__icon--trailing base-input__toggle"
        :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
        @click="showPassword = !showPassword"
      >
        <svg
          v-if="!showPassword"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
          />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
      </button>

      <!-- Trailing icon slot -->
      <span
        v-else-if="$slots.trailing"
        class="base-input__icon base-input__icon--trailing"
        aria-hidden="true"
      >
        <slot name="trailing" />
      </span>
    </div>

    <!-- Bottom row: error/hint + char count -->
    <div class="base-input__bottom">
      <p
        v-if="error"
        :id="`${inputId}-error`"
        class="base-input__error"
        role="alert"
        aria-live="polite"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ error }}
      </p>
      <p v-else-if="hint" :id="`${inputId}-hint`" class="base-input__hint">
        {{ hint }}
      </p>
      <span v-else />

      <span
        v-if="maxLength"
        class="base-input__counter"
        :class="{ 'base-input__counter--over': charCount > maxLength }"
      >
        {{ charCount }}/{{ maxLength }}
      </span>
    </div>
  </div>
</template>

<style scoped>
/* ── Wrapper ────────────────────────────────────────────────── */
.base-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.base-input-wrapper--full {
  width: 100%;
}

/* ── Label ──────────────────────────────────────────────────── */
.base-input__label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  line-height: var(--line-height-tight);
}

.base-input__required {
  color: var(--color-primary);
  font-size: var(--font-size-sm);
}

/* ── Field container ────────────────────────────────────────── */
.base-input__field {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--surface-sunken);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--input-radius);
  transition: var(--transition-base);
  backdrop-filter: var(--backdrop-blur);
}

/* Sizes */
.base-input__field--sm {
  min-height: 2.5rem;
}
.base-input__field--md {
  min-height: 3rem;
}
.base-input__field--lg {
  min-height: 3.5rem;
}

/* States */
.base-input__field--focused {
  border-color: var(--color-secondary);
  background-color: var(--surface-glass);
  box-shadow: var(--glow-secondary);
}

.base-input__field--error {
  border-color: var(--color-error);
  box-shadow: 0 0 15px rgba(255, 61, 113, 0.2);
}

.base-input__field--disabled {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(1);
}

.base-input__field--readonly {
  background-color: transparent;
  border-style: dashed;
}

/* ── Control ────────────────────────────────────────────────── */
.base-input__control {
  flex: 1;
  width: 100%;
  padding-inline: var(--space-4);
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

.base-input__control::placeholder {
  color: var(--text-disabled);
}

.base-input__control--textarea {
  padding-block: var(--space-3);
  resize: vertical;
  min-height: 6rem;
}

/* ── Icons ──────────────────────────────────────────────────── */
.base-input__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: color var(--duration-base);
}

.base-input__field--focused .base-input__icon {
  color: var(--color-secondary);
}

.base-input__icon--leading {
  padding-left: var(--space-4);
}
.base-input__icon--trailing {
  padding-right: var(--space-4);
}

.base-input__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* ── Password toggle ────────────────────────────────────────── */
.base-input__toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
}

.base-input__toggle:hover {
  color: var(--text-primary);
}

/* ── Bottom row ─────────────────────────────────────────────── */
.base-input__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: 1.25rem;
}

.base-input__hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.base-input__error {
  display: flex;
  align-items: center;
  gap: var(--space-1-5);
  font-size: var(--font-size-xs);
  color: var(--color-error);
  font-weight: var(--font-weight-medium);
  animation: slide-up 0.3s var(--ease-out);
}

.base-input__counter {
  font-size: var(--font-size-xs);
  color: var(--text-disabled);
  font-variant-numeric: tabular-nums;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
