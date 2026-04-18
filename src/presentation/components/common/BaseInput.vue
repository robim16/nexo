<script setup lang="ts">
/**
 * BaseInput — Componente base de campo de texto
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
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'keydown': [event: KeyboardEvent]
}>()

const inputId  = useId()
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
  <div
    :class="[
      'base-input-wrapper',
      { 'base-input-wrapper--full': fullWidth },
    ]"
  >
    <!-- Label -->
    <label
      v-if="label"
      :for="inputId"
      class="base-input__label"
    >
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
          'base-input__field--readonly': readonly,
        },
      ]"
    >
      <!-- Leading icon slot -->
      <span v-if="$slots.leading" class="base-input__icon base-input__icon--leading" aria-hidden="true">
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
        @focus="isFocused = true; $emit('focus', $event)"
        @blur="isFocused = false; $emit('blur', $event)"
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
        @focus="isFocused = true; $emit('focus', $event)"
        @blur="isFocused = false; $emit('blur', $event)"
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
        <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </button>

      <!-- Trailing icon slot -->
      <span v-else-if="$slots.trailing" class="base-input__icon base-input__icon--trailing" aria-hidden="true">
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {{ error }}
      </p>
      <p
        v-else-if="hint"
        :id="`${inputId}-hint`"
        class="base-input__hint"
      >
        {{ hint }}
      </p>
      <span v-else />

      <span v-if="maxLength" class="base-input__counter" :class="{ 'base-input__counter--over': charCount > maxLength }">
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
  gap: var(--space-1-5);
}

.base-input-wrapper--full {
  width: 100%;
}

/* ── Label ──────────────────────────────────────────────────── */
.base-input__label {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  line-height: var(--line-height-tight);
}

.base-input__required {
  color: var(--color-error-500);
  font-size: var(--font-size-sm);
}

/* ── Field container ────────────────────────────────────────── */
.base-input__field {
  position: relative;
  display: flex;
  align-items: center;
  background-color: var(--input-bg);
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-lg);
  transition:
    border-color var(--duration-base) var(--ease-in-out),
    box-shadow var(--duration-base) var(--ease-in-out),
    background-color var(--duration-base) var(--ease-in-out);
}

/* Sizes */
.base-input__field--sm { min-height: var(--input-height-sm); }
.base-input__field--md { min-height: var(--input-height-md); }
.base-input__field--lg { min-height: var(--input-height-lg); }

/* States */
.base-input__field--focused {
  border-color: var(--input-border-focus);
  box-shadow: var(--input-shadow-focus);
}

.base-input__field--error {
  border-color: var(--color-error-500);
  box-shadow: var(--shadow-error);
}

.base-input__field--disabled {
  opacity: 0.55;
  cursor: not-allowed;
  background-color: var(--surface-sunken);
}

.base-input__field--readonly {
  background-color: var(--surface-sunken);
}

/* Textarea */
.base-input__field:has(.base-input__control--textarea) {
  align-items: flex-start;
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
  line-height: var(--line-height-relaxed);
}

.base-input__field--sm .base-input__control { padding-inline: var(--space-3); font-size: var(--font-size-xs); }
.base-input__field--lg .base-input__control { padding-inline: var(--space-5); font-size: var(--font-size-base); }

.base-input__control::placeholder {
  color: var(--text-tertiary);
}

.base-input__control:disabled {
  cursor: not-allowed;
}

.base-input__control--textarea {
  padding-block: var(--space-3);
  resize: vertical;
  min-height: 5rem;
}

/* Adjust padding when leading icon present */
.base-input__icon--leading ~ .base-input__control { padding-left: 0; }

/* ── Icons ──────────────────────────────────────────────────── */
.base-input__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--icon-secondary);
}

.base-input__icon--leading { padding-left: var(--space-3); }
.base-input__icon--trailing { padding-right: var(--space-3); }

.base-input__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

/* ── Password toggle ────────────────────────────────────────── */
.base-input__toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-md);
  transition: color var(--duration-base) var(--ease-in-out),
              background-color var(--duration-base) var(--ease-in-out);
}

.base-input__toggle:hover {
  color: var(--text-primary);
  background-color: var(--interactive-secondary-hover);
}

/* ── Bottom row ─────────────────────────────────────────────── */
.base-input__bottom {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-2);
  min-height: 1rem;
}

/* ── Hint / Error ────────────────────────────────────────────── */
.base-input__hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  line-height: var(--line-height-snug);
}

.base-input__error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-error-500);
  font-weight: var(--font-weight-medium);
  animation: slide-down 0.2s var(--ease-out);
}

.base-input__error svg {
  width: 0.875rem;
  height: 0.875rem;
  flex-shrink: 0;
}

/* ── Char counter ────────────────────────────────────────────── */
.base-input__counter {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.base-input__counter--over {
  color: var(--color-error-500);
  font-weight: var(--font-weight-medium);
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
