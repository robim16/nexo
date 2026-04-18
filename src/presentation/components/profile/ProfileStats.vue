<template>
  <div class="profile-stats">
    <div class="stat-item">
      <span class="stat-value">{{ formatNumber(stats.posts) }}</span>
      <span class="stat-label">Publicaciones</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{{ formatNumber(stats.followers) }}</span>
      <span class="stat-label">Seguidores</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{{ formatNumber(stats.following) }}</span>
      <span class="stat-label">Siguiendo</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

const props = defineProps<{
  stats?: { posts: number, followers: number, following: number };
}>();

const stats = props.stats || { posts: 42, followers: 1337, following: 404 };

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};
</script>

<style scoped>
.profile-stats {
  display: flex;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-surface);
  gap: var(--spacing-xl);
}

.stat-item {
  display: flex;
  gap: var(--spacing-xs);
  align-items: baseline;
  cursor: pointer;
}

.stat-item:hover .stat-label {
  text-decoration: underline;
}

.stat-value {
  font-weight: var(--font-weight-black);
  color: var(--color-text);
  font-size: var(--font-size-lg);
}

.stat-label {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}
</style>
