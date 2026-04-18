<template>
  <div class="create-post">
    <div class="create-post__input-area">
      <BaseAvatar :src="userAvatar" :alt="userName" size="md" />
      <div class="input-wrapper">
        <textarea
          v-model="content"
          class="post-textarea"
          placeholder="¿Qué estás pensando?"
          rows="3"
          @input="autoResize"
        ></textarea>
      </div>
    </div>
    
    <div class="create-post__actions">
      <div class="action-tools">
        <button class="tool-btn" title="Añadir imagen">📷</button>
        <button class="tool-btn" title="Añadir emoji">😊</button>
      </div>
      <BaseButton 
        variant="primary" 
        :disabled="!content.trim() || isSubmitting"
        @click="submitPost"
      >
        {{ isSubmitting ? 'Publicando...' : 'Publicar' }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';
import { useAuthStore } from '@/presentation/stores/auth'; // asumiendo
import { useFeedStore } from '@/presentation/stores/feed'; // asumiendo

const authStore = useAuthStore();
const feedStore = useFeedStore();

const content = ref('');
const isSubmitting = ref(false);

const userAvatar = authStore.user?.avatar || '';
const userName = authStore.user?.displayName || 'Tú';

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = target.scrollHeight + 'px';
};

const submitPost = async () => {
  if (!content.value.trim() || isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    await feedStore.createPost(content.value);
    content.value = '';
  } catch (error) {
    console.error('Failed to create post', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.create-post {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.create-post__input-area {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.input-wrapper {
  flex: 1;
}

.post-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-family: inherit;
  font-size: var(--font-size-lg);
  color: var(--color-text);
  outline: none;
  transition: all 0.2s;
}

.post-textarea::placeholder {
  color: var(--color-text-muted);
}

.create-post__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-sm);
}

.action-tools {
  display: flex;
  gap: var(--spacing-sm);
}

.tool-btn {
  background: transparent;
  border: none;
  font-size: 1.2rem;
  padding: var(--spacing-xs);
  cursor: pointer;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.tool-btn:hover {
  background: var(--color-primary-50);
}
</style>
