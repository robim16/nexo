<template>
  <BaseCard variant="glass" padding="md" class="create-post">
    <div class="create-post__input-area">
      <BaseAvatar :src="userAvatar" :alt="userName" size="md" class="user-avatar" />
      <div class="input-wrapper">
        <textarea
          v-model="content"
          class="post-textarea"
          placeholder="What's happening in the Nexo?"
          rows="1"
          @input="autoResize"
        ></textarea>
      </div>
    </div>
    
    <div class="create-post__actions">
      <div class="action-tools">
        <button class="tool-btn" title="Add Image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        <button class="tool-btn" title="Add Emoji">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>
      </div>
      
      <BaseButton 
        variant="primary" 
        size="md"
        :disabled="!content.trim() || isSubmitting"
        @click="submitPost"
      >
        {{ isSubmitting ? 'Pulsing...' : 'Post' }}
      </BaseButton>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import BaseCard from '@/presentation/components/common/BaseCard.vue';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';
import { useAuthStore } from '@/application/stores/auth.store';
import { usePostsStore } from '@/application/stores/posts.store';

const authStore = useAuthStore();
const postsStore = usePostsStore();

const content = ref('');
const isSubmitting = ref(false);

const userAvatar = authStore.user?.avatar || '';
const userName = authStore.user?.displayName || 'You';

const autoResize = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  target.style.height = target.scrollHeight + 'px';
};

const submitPost = async () => {
  if (!content.value.trim() || isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    await postsStore.createPost({ content: content.value });
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
  border-radius: var(--radius-3xl);
  transition: var(--transition-base);
}

.create-post:focus-within {
  background-color: rgba(255, 255, 255, 0.05);
}

.create-post__input-area {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.user-avatar {
  border: 2px solid var(--surface-glass-border);
}

.input-wrapper {
  flex: 1;
}

.post-textarea {
  width: 100%;
  border: none;
  background: transparent;
  resize: none;
  font-family: var(--font-sans);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  outline: none;
  padding-top: var(--space-2);
  min-height: 40px;
}

.post-textarea::placeholder {
  color: var(--text-disabled);
}

.create-post__actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  /* Tonal shift instead of border-top */
  background-color: rgba(255, 255, 255, 0.01);
  margin: 0 calc(-1 * var(--space-6));
  padding-inline: var(--space-6);
}

.action-tools {
  display: flex;
  gap: var(--space-2);
}

.tool-btn {
  background: transparent;
  border: none;
  color: var(--color-secondary);
  padding: var(--space-2);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.1);
  transform: scale(1.1);
}

.tool-btn svg {
  width: 20px;
  height: 20px;
}
</style>
