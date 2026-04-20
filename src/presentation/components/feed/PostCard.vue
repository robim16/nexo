<template>
  <BaseCard variant="glass" padding="none" class="post-card" interactive>
    <header class="post-card__header">
      <div class="header-left">
        <BaseAvatar :src="post.authorAvatar" :name="post.authorName" size="md" class="author-avatar" />
        <div class="post-card__meta">
          <h4 class="author-name">{{ post.authorName }}</h4>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>
      <button class="post-options" aria-label="Opciones">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </header>

    <div class="post-card__content">
      <p>{{ post.content }}</p>
    </div>

    <footer class="post-card__actions">
      <button 
        class="action-btn action-btn--like" 
        :class="{ 'action-btn--active': post.isLiked }" 
        @click="toggleLike"
      >
        <span class="icon-wrap">
          <svg v-if="post.isLiked" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </span>
        <span class="count">{{ post.likeCount }}</span>
      </button>
      
      <button class="action-btn action-btn--comment" @click="$emit('comment', post.id)">
        <span class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </span>
        <span class="count">{{ post.commentCount }}</span>
      </button>

      <button class="action-btn action-btn--share" @click="$emit('share', post.id)">
        <span class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </span>
      </button>
    </footer>
  </BaseCard>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import BaseCard from '@/presentation/components/common/BaseCard.vue';
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
  const d = new Date(date);
  return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-Math.round((Date.now() - d.getTime()) / 86400000), 'day');
};
</script>

<style scoped>
.post-card {
  margin-bottom: var(--space-6);
  border-radius: var(--radius-3xl);
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.author-avatar {
  border: 2px solid var(--surface-glass-border);
}

.post-card__meta {
  display: flex;
  flex-direction: column;
}

.author-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.post-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.post-options {
  background: transparent;
  border: none;
  color: var(--text-disabled);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-full);
  transition: var(--transition-base);
}

.post-options:hover {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
}

.post-options svg {
  width: 20px;
  height: 20px;
}

.post-card__content {
  padding: var(--space-2) var(--space-6) var(--space-6);
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  white-space: pre-wrap;
}

.post-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-6) var(--space-4);
  /* Tonal shift instead of border */
  background-color: rgba(255, 255, 255, 0.02);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: transparent;
  border: none;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
}

.icon-wrap svg {
  width: 20px;
  height: 20px;
}

/* Like specific */
.action-btn--like:hover {
  background-color: rgba(255, 0, 127, 0.1);
  color: var(--color-primary);
  filter: drop-shadow(0 0 8px rgba(255, 0, 127, 0.4));
}

.action-btn--active.action-btn--like {
  color: var(--color-primary);
  filter: drop-shadow(0 0 10px rgba(255, 0, 127, 0.3));
}

/* Comment specific */
.action-btn--comment:hover {
  background-color: rgba(0, 251, 251, 0.1);
  color: var(--color-secondary);
  filter: drop-shadow(0 0 8px rgba(0, 251, 251, 0.4));
}

/* Share specific */
.action-btn--share:hover {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
}
</style>
