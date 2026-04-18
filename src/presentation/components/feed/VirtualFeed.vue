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
import { ref, onMounted, onUnmounted } from 'vue';
import PostList from './PostList.vue';
import type { PostDisplay } from './PostCard.vue';
import { useFeedStore } from '@/presentation/stores/feed'; // asumiendo su existencia

const feedStore = useFeedStore();
const posts = ref<PostDisplay[]>([]);
const loading = ref(false);
const loadTrigger = ref<HTMLElement | null>(null);

let observer: IntersectionObserver;

const loadMore = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const newPosts = await feedStore.fetchNextPage();
    if (newPosts && newPosts.length > 0) {
      posts.value = [...posts.value, ...newPosts];
    }
  } catch (err) {
    console.error('Error fetching feed', err);
  } finally {
    loading.value = false;
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

const handleLike = (id: string) => {
  // Optimistic UI update
  const post = posts.value.find(p => p.id === id);
  if (post) {
    post.isLiked = true;
    post.likeCount++;
  }
  // feedStore.likePost(id);
};

const handleUnlike = (id: string) => {
  const post = posts.value.find(p => p.id === id);
  if (post) {
    post.isLiked = false;
    post.likeCount = Math.max(0, post.likeCount - 1);
  }
  // feedStore.unlikePost(id);
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
