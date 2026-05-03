<template>
  <article class="post-card" @click="goToPost">
    <header class="post-card__header">
      <div class="header-left">
        <BaseAvatar :src="post.authorAvatar" :name="post.authorName" size="md" class="author-avatar" />
        <div class="post-card__meta">
          <div class="meta-row">
            <h4 class="author-name">{{ post.authorName || 'Unknown' }}</h4>
            <span v-if="post.isEdited" class="edited-badge">edited</span>
          </div>
          <span class="post-date">{{ formatDate(post.createdAt) }}</span>
        </div>
      </div>
      <button class="post-options" aria-label="Post options" @click.stop>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
        </svg>
      </button>
    </header>

    <div class="post-card__content">
      <p>{{ post.content }}</p>
      
      <div v-if="post.images && post.images.length > 0" class="post-card__images" :class="`grid-${Math.min(post.images.length, 4)}`">
        <div v-for="(img, idx) in post.images.slice(0, 4)" :key="idx" class="post-image-wrapper">
          <img :src="img" alt="Post image" class="post-image" loading="lazy" />
        </div>
      </div>
    </div>

    <footer class="post-card__actions">
      <button 
        class="action-btn action-btn--like" 
        :class="{ 'action-btn--active': post.isLiked }" 
        @click.stop="toggleLike"
        :title="post.isLiked ? 'Unlike' : 'Like'"
      >
        <span class="icon-wrap">
          <svg v-if="post.isLiked" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </span>
        <span v-if="post.likesCount" class="count">{{ formatCount(post.likesCount) }}</span>
      </button>
      
      <button class="action-btn action-btn--comment" @click.stop="$emit('comment', post.id)" title="Comment">
        <span class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </span>
        <span v-if="post.commentsCount" class="count">{{ formatCount(post.commentsCount) }}</span>
      </button>

      <button class="action-btn action-btn--share" @click.stop="$emit('share', post.id)" title="Share">
        <span class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </span>
      </button>

      <button class="action-btn action-btn--bookmark" title="Save" @click.stop>
        <span class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </span>
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';

export interface PostDisplay {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string | null;
  content: string;
  images?: string[];
  createdAt: Date | string | number;
  likes: string[];
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isEdited?: boolean;
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

const router = useRouter();

const goToPost = () => {
  if (router.currentRoute.value.path !== `/post/${props.post.id}`) {
    router.push(`/post/${props.post.id}`);
  }
};

const formatCount = (n: number): string => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
};

const formatDate = (date: Date | string | number) => {
  const d = new Date(date);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.post-card {
  background: rgba(19, 19, 19, 0.45);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--space-3);
  transition: var(--transition-base);
  overflow: hidden;
  cursor: pointer;
}

.post-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  background: rgba(19, 19, 19, 0.55);
}

.post-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.author-avatar {
  border: 2px solid rgba(var(--color-secondary-rgb), 0.15);
  flex-shrink: 0;
  transition: var(--transition-base);
}

.post-card:hover .author-avatar {
  border-color: rgba(var(--color-secondary-rgb), 0.3);
}

.post-card__meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.author-name {
  margin: 0;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edited-badge {
  font-size: var(--font-size-2xs);
  color: var(--text-disabled);
  font-style: italic;
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
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
  flex-shrink: 0;
}

.post-options:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: var(--text-secondary);
}

.post-options svg {
  width: 18px;
  height: 18px;
}

.post-card__content {
  padding: var(--space-3) var(--space-4) var(--space-2);
  font-size: var(--font-size-base);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-card__content p {
  margin: 0;
}

.post-card__images {
  margin-top: var(--space-3);
  display: grid;
  gap: var(--space-1);
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.grid-1 {
  grid-template-columns: 1fr;
}
.grid-2 {
  grid-template-columns: 1fr 1fr;
}
.grid-3 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 150px 150px;
}
.grid-3 .post-image-wrapper:nth-child(1) {
  grid-row: span 2;
}
.grid-4 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 150px 150px;
}

.post-image-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 200px;
  background: var(--surface-base);
}

.post-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.post-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-4) var(--space-3);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-base);
  font-variant-numeric: tabular-nums;
}

.action-btn--bookmark {
  margin-left: auto;
}

.icon-wrap {
  display: flex;
  align-items: center;
}

.icon-wrap svg {
  width: 18px;
  height: 18px;
}

.count {
  line-height: 1;
}

/* Like */
.action-btn--like:hover {
  background-color: rgba(255, 0, 127, 0.08);
  color: var(--color-primary);
}

.action-btn--active.action-btn--like {
  color: var(--color-primary);
}

.action-btn--active.action-btn--like .icon-wrap {
  animation: like-pop 0.3s var(--ease-out);
}

@keyframes like-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

/* Comment */
.action-btn--comment:hover {
  background-color: rgba(0, 251, 251, 0.08);
  color: var(--color-secondary);
}

/* Share */
.action-btn--share:hover {
  background-color: rgba(112, 0, 255, 0.08);
  color: var(--color-tertiary);
}

/* Bookmark */
.action-btn--bookmark:hover {
  background-color: rgba(var(--color-secondary-rgb), 0.08);
  color: var(--color-secondary);
}
</style>
