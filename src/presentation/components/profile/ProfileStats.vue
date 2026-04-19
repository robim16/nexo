<template>
  <div class="profile-stats glass">
    <div class="stat-item" v-for="item in statList" :key="item.label">
      <span class="stat-value">{{ formatNumber(item.value) }}</span>
      <span class="stat-label">{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue';

const props = defineProps<{
  stats?: { posts: number, followers: number, following: number };
}>();

const stats = props.stats || { posts: 42, followers: 1337, following: 404 };

const statList = computed(() => [
  { label: 'Posts', value: stats.posts },
  { label: 'Followers', value: stats.followers },
  { label: 'Following', value: stats.following }
]);

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
};
</script>

<style scoped>
.profile-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--space-6) var(--space-8);
  margin: var(--space-4) 0;
  border-radius: var(--radius-2xl);
  background: var(--surface-glass);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  cursor: pointer;
  transition: var(--transition-base);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-xl);
}

.stat-item:hover {
  background-color: var(--surface-glass-bright);
  transform: translateY(-2px);
}

.stat-value {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary);
  font-size: var(--font-size-xl);
  text-shadow: 0 0 10px rgba(var(--color-secondary-rgb), 0.3);
}

.stat-label {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  font-weight: var(--font-weight-semibold);
}

@media (max-width: 640px) {
  .profile-stats {
    padding: var(--space-4);
    gap: var(--space-2);
  }
  
  .stat-value {
    font-size: var(--font-size-lg);
  }
}
</style>
