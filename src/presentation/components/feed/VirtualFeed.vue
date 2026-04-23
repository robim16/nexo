<template>
  <div class="virtual-feed">
    <PostList
      :items="posts"
      :loading="loading"
      :skeletonCount="3"
      @like="handleLike"
      @unlike="handleUnlike"
    >
      <template #append>
        <!-- The load trigger for Infinite Scroll -->
        <div ref="loadTrigger" class="infinite-scroll-trigger"></div>
      </template>
    </PostList>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import PostList from './PostList.vue';
import { usePostsStore } from '@/application/stores/posts.store';

const postsStore = usePostsStore();
const posts = computed(() => postsStore.feed);
const loading = computed(() => postsStore.loading);
const loadTrigger = ref<HTMLElement | null>(null);

let observer: IntersectionObserver;

const loadMore = async () => {
  try {
    await postsStore.fetchFeed();
  } catch (err) {
    console.error('Error fetching feed', err);
  }
};

onMounted(() => {
  // Initial load
  loadMore();

  // Setup infinite scroll observer
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  }, {
    rootMargin: '200px' // Trigger slightly before the bottom
  });

  if (loadTrigger.value) {
    observer.observe(loadTrigger.value);
  }
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
  }
});

// Delegate like/unlike to store (it handles optimistic updates)
const handleLike = (id: string) => {
  postsStore.toggleLike(id);
};

const handleUnlike = (id: string) => {
  postsStore.toggleLike(id);
};
</script>

<style scoped>
.virtual-feed {
  width: 100%;
}

.infinite-scroll-trigger {
  height: 1px;
  width: 100%;
}
</style>
