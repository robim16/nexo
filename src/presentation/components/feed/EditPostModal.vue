<template>
  <BaseModal :modelValue="show" size="xs" title="Edit Post" @close="$emit('close')">
    <div class="edit-post">
      <div class="edit-post__header">
        <BaseAvatar :src="post.authorAvatar" :name="post.authorName" size="sm" />
        <span class="author-name">{{ post.authorName }}</span>
      </div>

      <div class="edit-post__content">
        <textarea
          ref="textareaRef"
          v-model="content"
          class="edit-textarea"
          placeholder="What's on your mind?"
          rows="4"
          @input="autoResize"
        ></textarea>
        
        <div class="image-section">
          <div v-if="allImages.length > 0" class="image-preview-grid">
            <div v-for="(img, idx) in allImages" :key="idx" class="image-item">
              <img :src="img.url" alt="Post image" />
              <button class="remove-btn" @click="removeImage(idx)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="allImages.length < 4" class="add-image-container">
            <button class="add-image-btn" @click="triggerFileUpload">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span>Add Image</span>
            </button>
            <input
              type="file"
              ref="fileInputRef"
              accept="image/*"
              multiple
              style="display: none"
              @change="handleFileSelected"
            />
          </div>
        </div>
      </div>

      <div class="edit-post__footer">
        <div class="char-count" :class="{ 'char-count--error': content.length > 500 }">
          {{ content.length }}/500
        </div>
        <div class="actions">
          <BaseButton variant="ghost" size="md" @click="$emit('close')" :disabled="isSubmitting">
            Cancel
          </BaseButton>
          <BaseButton
            variant="primary"
            size="md"
            :disabled="!isValid || isSubmitting"
            :loading="isSubmitting"
            @click="handleSave"
          >
            Save Changes
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import BaseModal from '@/presentation/components/common/BaseModal.vue'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import type { PostDisplay } from './PostCard.vue'
import { container } from '@/dependency-injection'
import type { IStorageService } from '@/core/ports/services/IStorageService'
import { useAuthStore } from '@/application/stores/auth.store'

interface ImageItem {
  url: string
  file?: File
  isNew: boolean
}

const props = defineProps<{
  show: boolean
  post: PostDisplay
}>()

const emit = defineEmits(['close', 'save'])

const authStore = useAuthStore()
const content = ref(props.post.content)
const isSubmitting = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// Initialize with existing images
const allImages = ref<ImageItem[]>(
  (props.post.images || []).map(url => ({ url, isNew: false }))
)

const isValid = computed(() => {
  return (content.value.trim().length > 0 || allImages.value.length > 0) && 
         content.value.length <= 500
})

const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px'
  }
}

const cleanup = () => {
  allImages.value.forEach(item => {
    if (item.isNew) {
      URL.revokeObjectURL(item.url)
    }
  })
}

watch(() => props.show, (isShowing) => {
  if (isShowing) {
    content.value = props.post.content
    allImages.value = (props.post.images || []).map(url => ({ url, isNew: false }))
    nextTick(() => {
      autoResize()
      textareaRef.value?.focus()
    })
  } else {
    cleanup()
  }
})

onUnmounted(() => {
  cleanup()
})

const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

const handleFileSelected = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files) return

  const files = Array.from(target.files)
  const remainingSlots = 4 - allImages.value.length
  const filesToAdd = files.slice(0, remainingSlots)

  filesToAdd.forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`The file ${file.name} is too large. Maximum 10MB.`)
      return
    }
    const url = URL.createObjectURL(file)
    allImages.value.push({ url, file, isNew: true })
  })

  target.value = ''
}

const removeImage = (index: number) => {
  const item = allImages.value[index]
  if (item.isNew) {
    URL.revokeObjectURL(item.url)
  }
  allImages.value.splice(index, 1)
}

const handleSave = async () => {
  if (!isValid.value || isSubmitting.value) return
  
  isSubmitting.value = true
  try {
    const storageService = container.get<IStorageService>('IStorageService')
    const userId = authStore.currentUserId!
    
    // Upload new images
    const finalImageUrls: string[] = []
    
    for (const item of allImages.value) {
      if (item.isNew && item.file) {
        const result = await storageService.uploadImage(item.file, `posts/${userId}`)
        finalImageUrls.push(result.downloadUrl)
      } else {
        finalImageUrls.push(item.url)
      }
    }
    
    emit('save', content.value, finalImageUrls)
  } catch (error: any) {
    console.error('Error saving post:', error)
    alert('Failed to save post. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  nextTick(() => {
    autoResize()
    textareaRef.value?.focus()
  })
})
</script>

<style scoped>
.edit-post {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.edit-post__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.author-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.edit-textarea {
  width: 100%;
  background: transparent;
  border: none;
  resize: none;
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  padding: 0;
  outline: none;
  min-height: 120px;
}

.image-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-2);
}

.image-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--surface-glass-border);
}

.image-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  padding: 4px;
}

.remove-btn:hover {
  background: var(--color-error);
}

.remove-btn svg {
  width: 16px;
  height: 16px;
}

.add-image-container {
  display: flex;
}

.add-image-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed var(--surface-glass-border);
  color: var(--text-secondary);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: var(--transition-base);
}

.add-image-btn:hover {
  background: rgba(var(--color-secondary-rgb), 0.05);
  border-color: var(--color-secondary);
  color: var(--color-secondary);
}

.add-image-btn svg {
  width: 18px;
  height: 18px;
}

.edit-post__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--surface-glass-border);
}

.char-count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.char-count--error {
  color: var(--color-error);
}

.actions {
  display: flex;
  gap: var(--space-2);
}
</style>
