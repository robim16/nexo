<template>
  <div class="explore-page">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Explore</h1>
        <p class="page-subtitle">Discover what's trending in the Nexo</p>
      </div>
      <div class="search-bar">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <BaseInput type="text" placeholder="Search posts, people, hashtags..." />
        </div>
      </div>
    </header>

    <div class="feed-section">
      <PostList 
        :items="postsStore.feed" 
        :loading="postsStore.loading"
        @like="postsStore.toggleLike"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { usePostsStore } from '@/application/stores/posts.store';
import BaseInput from '@/presentation/components/common/BaseInput.vue';
import PostList from '@/presentation/components/feed/PostList.vue';

const postsStore = usePostsStore();

onMounted(() => {
  if (postsStore.feed.length === 0) {
    postsStore.fetchFeed();
  }
});
</script>

<style scoped>
.explore-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-6) var(--space-4);
  background: rgba(10, 10, 11, 0.8);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--surface-glass-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-content {
  margin-bottom: var(--space-4);
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
}

.page-subtitle {
  margin: 2px 0 0;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.search-bar {
  max-width: 100%;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  width: 16px;
  height: 16px;
  color: var(--text-disabled);
  pointer-events: none;
  z-index: 1;
}

.feed-section {
  flex: 1;
  padding: var(--space-6) var(--space-2);
}
</style>
