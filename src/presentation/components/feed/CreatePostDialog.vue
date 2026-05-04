<template>
  <div class="create-post" :class="{ 'create-post--focused': isFocused }">
    <div class="create-post__input-area">
      <BaseAvatar :src="userAvatar" :alt="userName" size="md" class="user-avatar" />
      <div class="input-wrapper">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="post-textarea"
          placeholder="Share something with the Nexo..."
          rows="1"
          @input="autoResize"
          @focus="isFocused = true"
          @blur="handleBlur"
        ></textarea>
        <div
          v-if="content.length > 0"
          class="char-counter"
          :class="{
            'char-counter--warn': content.length > 450,
            'char-counter--danger': content.length > 490
          }"
        >
          {{ content.length }}/500
        </div>
      </div>
    </div>

    <div v-if="selectedImages.length > 0" class="image-previews">
      <div v-for="(img, index) in imagePreviews" :key="index" class="preview-item">
        <img :src="img" alt="preview" />
        <button class="remove-btn" @click="removeImage(index)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="actions">
      <div
        v-if="isFocused || content.trim() || selectedImages.length > 0"
        class="create-post__actions"
      >
        <div class="action-tools">
          <button class="tool-btn" title="Add Image" @click="triggerImageUpload">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
          <input
            type="file"
            ref="fileInput"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleFileSelected"
          />
          <button class="tool-btn" title="Add GIF">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
              <line x1="17" y1="17" x2="22" y2="17" />
            </svg>
          </button>
          <button class="tool-btn" title="Add Emoji">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </button>
        </div>

        <BaseButton
          variant="primary"
          size="md"
          :disabled="
            (!content.trim() && selectedImages.length === 0) || isSubmitting || content.length > 500
          "
          @click="submitPost"
        >
          <span class="btn-content">
            <svg
              v-if="isSubmitting"
              class="spinner"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round" />
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            {{ isSubmitting ? 'Sending...' : 'Post' }}
          </span>
        </BaseButton>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import { useAuthStore } from '@/application/stores/auth.store'
import { usePostsStore } from '@/application/stores/posts.store'

const authStore = useAuthStore()
const postsStore = usePostsStore()

const content = ref('')
const isSubmitting = ref(false)
const isFocused = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedImages = ref<File[]>([])
const imagePreviews = ref<string[]>([])

const userAvatar = authStore.user?.avatar || ''
const userName = authStore.user?.displayName || 'You'

const handleBlur = () => {
  if (!content.value.trim() && selectedImages.value.length === 0) {
    isFocused.value = false
  }
}

const triggerImageUpload = () => {
  fileInput.value?.click()
}

const handleFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)
  const remainingSlots = 4 - selectedImages.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`El archivo ${file.name} es muy grande. Máximo 10MB.`)
      return
    }
    selectedImages.value.push(file)
    imagePreviews.value.push(URL.createObjectURL(file))
  })

  if (target.files.length > remainingSlots) {
    alert(`Solo puedes subir hasta 4 imágenes por publicación.`)
  }

  target.value = ''
  isFocused.value = true
}

const removeImage = (index: number) => {
  URL.revokeObjectURL(imagePreviews.value[index])
  selectedImages.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = Math.min(target.scrollHeight, 200) + 'px'
}

const submitPost = async () => {
  if ((!content.value.trim() && selectedImages.value.length === 0) || isSubmitting.value) return

  isSubmitting.value = true
  try {
    await postsStore.createPost({
      content: content.value,
      visibility: 'public',
      images: selectedImages.value
    })
    content.value = ''
    imagePreviews.value.forEach((url) => URL.revokeObjectURL(url))
    selectedImages.value = []
    imagePreviews.value = []
    isFocused.value = false
    // Reset textarea height
    await nextTick()
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
    }
  } catch (error) {
    console.error('Failed to create post', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.create-post {
  background: rgba(19, 19, 19, 0.5);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-2xl);
  padding: var(--space-4);
  transition: var(--transition-base);
}

.create-post--focused {
  border-color: rgba(var(--color-primary-rgb), 0.25);
  background: rgba(19, 19, 19, 0.7);
  box-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.06);
}

.image-previews {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-3);
  padding-left: calc(var(--space-10) + var(--space-3)); /* Align with textarea */
  flex-wrap: wrap;
}

.preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--surface-glass-border);
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  backdrop-filter: blur(4px);
}

.remove-btn:hover {
  background: var(--color-error);
}

.create-post__input-area {
  display: flex;
  gap: var(--space-3);
}

.user-avatar {
  border: 2px solid rgba(var(--color-primary-rgb), 0.2);
  flex-shrink: 0;
  transition: var(--transition-base);
}

.create-post--focused .user-avatar {
  border-color: rgba(var(--color-primary-rgb), 0.4);
  box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.15);
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.post-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  outline: none;
  padding: var(--space-2) 0;
  min-height: 40px;
  line-height: var(--line-height-normal);
}

.post-textarea::placeholder {
  color: var(--text-disabled);
}

.char-counter {
  position: absolute;
  right: 0;
  bottom: 0;
  font-size: var(--font-size-2xs);
  color: var(--text-disabled);
  font-variant-numeric: tabular-nums;
  transition: var(--transition-base);
}

.char-counter--warn {
  color: var(--color-warning);
}

.char-counter--danger {
  color: var(--color-error);
}

.create-post__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-3);
  margin-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.action-tools {
  display: flex;
  gap: var(--space-1);
}

.tool-btn {
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  padding: var(--space-2);
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.08);
  color: var(--color-secondary);
}

.tool-btn svg {
  width: 20px;
  height: 20px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-content svg {
  width: 16px;
  height: 16px;
}

.spinner {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Transition for actions */
.actions-enter-active {
  transition: all 0.3s var(--ease-out);
}
.actions-leave-active {
  transition: all 0.2s ease-in;
}
.actions-enter-from,
.actions-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
