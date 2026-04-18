<template>
  <article class="post-card">
    <header class="post-card__header">
      <BaseAvatar :src="post.authorAvatar || ''" :alt="post.authorName" size="md" />
      <div class="post-card__meta">
        <h4 class="author-name">{{ post.authorName }}</h4>
        <span class="post-date">{{ formatDate(post.createdAt) }}</span>
      </div>
      <button class="post-options" aria-label="Opciones">
        ⋮
      </button>
    </header>

    <div class="post-card__content">
      <p>{{ post.content }}</p>
    </div>

    <footer class="post-card__actions">
      <button class="action-btn" :class="{ 'action-btn--active': post.isLiked }" @click="toggleLike">
        <span class="icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
        <span>{{ post.likeCount }}</span>
      </button>
      <button class="action-btn" @click="$emit('comment', post.id)">
        <span class="icon">💬</span>
        <span>{{ post.commentCount }}</span>
      </button>
      <button class="action-btn" @click="$emit('share', post.id)">
        <span class="icon">📤</span>
        <span>Compartir</span>
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';

export interface PostDisplay {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date | string | number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

const props = defineProps<{
  post: PostDisplay;
}>();

const emit = defineEmits(['like', 'unlike', 'comment', 'share']);

const toggleLike = () => {
  if (props.post.isLiked) {
    emit('unlike', props.post.id);
  } else {
    emit('like', props.post.id);
  }
};

const formatDate = (date: Date | string | number) => {
  // Mock formatter
  const d = new Date(date);
  return new Intl.RelativeTimeFormat('es', { numeric: 'auto' }).format(-Math.round((Date.now() - d.getTime()) / 86400000), 'day');
};
</script>

<style scoped>
.post-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: var(--shadow-md);
}

.post-card__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.post-card__meta {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-name {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.post-date {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.post-options {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: 50%;
}

.post-options:hover {
  background: var(--color-background);
}

.post-card__content {
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-md);
  color: var(--color-text);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-card__actions {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-sm);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  background: transparent;
  border: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
}

.action-btn--active {
  color: var(--color-error); /* Heart active color typically red */
}
</style>
