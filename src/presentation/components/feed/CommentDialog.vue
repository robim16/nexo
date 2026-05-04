<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <header class="modal-header">
        <h3>Agregar comentario</h3>
        <button class="close-btn" @click="close">&times;</button>
      </header>

      <div class="modal-body">
        <div v-if="loadingComments" class="loading-comments">
          <LoadingSpinner size="sm" />
        </div>
        <div v-else-if="comments.length > 0" class="comments-list">
          <CommentItem v-for="c in comments" :key="c.id" :comment="c" />
        </div>
        <div v-else class="no-comments">No hay comentarios aún. ¡Sé el primero!</div>

        <div class="input-section">
          <textarea
            v-model="content"
            placeholder="Escribe tu comentario..."
            class="comment-textarea"
            ref="textareaRef"
          ></textarea>
        </div>
      </div>

      <footer class="modal-footer">
        <button class="btn btn--secondary" @click="close">Cerrar</button>
        <button class="btn btn--primary" :disabled="!content.trim() || loading" @click="submit">
          {{ loading ? 'Enviando...' : 'Comentar' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed } from 'vue'
import { useCommentsStore } from '@/application/stores/comments.store'
import CommentItem from './CommentItem.vue'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue'

const props = defineProps<{
  isOpen: boolean
  postId: string | null
  loading?: boolean
}>()

const emit = defineEmits(['close', 'submit'])

const commentsStore = useCommentsStore()
const content = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const comments = computed(() => {
  if (!props.postId) return []
  return commentsStore.commentsByPost[props.postId] || []
})

const loadingComments = computed(() => commentsStore.loading)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal && props.postId) {
      content.value = ''
      commentsStore.fetchComments(props.postId)
      nextTick(() => {
        textareaRef.value?.focus()
      })
    }
  }
)

const close = () => {
  if (props.loading) return
  emit('close')
}

const submit = () => {
  if (!content.value.trim() || props.loading) return
  emit('submit', content.value)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--surface-glass);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-xl);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: var(--shadow-2xl);
}

.modal-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--surface-glass-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: var(--space-4);
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.loading-comments,
.no-comments {
  text-align: center;
  padding: var(--space-6);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.comments-list {
  display: flex;
  flex-direction: column;
}

.input-section {
  margin-top: auto;
  position: sticky;
  bottom: 0;
  background: var(--surface-glass);
  padding-top: var(--space-4);
}

.comment-textarea {
  width: 100%;
  height: 80px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  padding: var(--space-3);
  resize: none;
  font-family: inherit;
}

.comment-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.modal-footer {
  padding: var(--space-4);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  border-top: 1px solid var(--surface-glass-border);
}

.btn {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-base);
}

.btn--primary {
  background: var(--color-primary);
  color: white;
  border: none;
}

.btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn--secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--surface-glass-border);
}
</style>
