<template>
  <div class="virtual-feed">
    <PostList
      :items="posts"
      :loading="loading"
      :skeletonCount="3"
      @like="handleLike"
      @unlike="handleUnlike"
      @comment="handleComment"
    >
      <template #append>
        <!-- The load trigger for Infinite Scroll -->
        <div ref="loadTrigger" class="infinite-scroll-trigger"></div>
      </template>
    </PostList>

    <CommentDialog 
      :is-open="isCommentDialogOpen"
      :post-id="activePostId"
      :loading="isCommenting"
      @close="isCommentDialogOpen = false"
      @submit="submitComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import PostList from './PostList.vue';
import CommentDialog from './CommentDialog.vue';
import { usePostsStore } from '@/application/stores/posts.store';
import { useCommentsStore } from '@/application/stores/comments.store';

const postsStore = usePostsStore();
const commentsStore = useCommentsStore();
const posts = computed(() => postsStore.feed);
const loading = computed(() => postsStore.loading);
const loadTrigger = ref<HTMLElement | null>(null);

const isCommentDialogOpen = ref(false);
const isCommenting = ref(false);
const activePostId = ref<string | null>(null);

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

const handleComment = (id: string) => {
  activePostId.value = id;
  isCommentDialogOpen.value = true;
};

const submitComment = async (content: string) => {
  if (!activePostId.value) return;
  
  isCommenting.value = true;
  try {
    await commentsStore.addComment(activePostId.value, content);
    isCommentDialogOpen.value = false;
  } catch (err) {
    console.error('Error submitting comment', err);
  } finally {
    isCommenting.value = false;
  }
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
