<template>
  <div class="explore-page">
    <header class="page-header">
      <h1 class="page-title">Explorar</h1>
      <div class="search-bar">
        <BaseInput type="text" placeholder="Buscar en Nexo..." />
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
}

.page-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.page-title {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-black);
}

.search-bar {
  margin-top: var(--spacing-xs);
}

.feed-section {
  flex: 1;
  padding: var(--spacing-lg) 0;
}
</style>
