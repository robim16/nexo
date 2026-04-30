<template>
  <div class="comment-item">
    <BaseAvatar :src="comment.authorAvatar" :name="comment.authorName" size="sm" class="author-avatar" />
    <div class="comment-content">
      <header class="comment-header">
        <span class="author-name">{{ comment.authorName || 'User' }}</span>
        <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
      </header>
      <p class="comment-text">{{ comment.content }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';

export interface CommentDisplay {
  id: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string | Date;
}

defineProps<{
  comment: CommentDisplay;
}>();

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
</script>

<style scoped>
.comment-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.author-avatar {
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: 2px;
}

.author-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.comment-date {
  font-size: var(--font-size-2xs);
  color: var(--text-tertiary);
}

.comment-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}
</style>
