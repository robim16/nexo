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
          <BaseInput 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search posts, people, hashtags..." 
            class="search-input"
          />
        </div>
      </div>
    </header>

    <div class="page-content">
      <!-- Search Results -->
      <div v-if="searchQuery.length >= 2" class="results-section">
        <div v-if="searchStore.isLoading" class="search-status">
          <div class="loader"></div>
          Searching...
        </div>

        <div v-else-if="searchStore.userResults.length === 0 && searchStore.postResults.length === 0" class="search-status">
          No results found for "{{ searchQuery }}"
        </div>

        <div v-else class="results-container">
          <!-- User Results -->
          <section v-if="searchStore.userResults.length > 0" class="results-group">
            <h2 class="section-label">People</h2>
            <div class="users-grid">
              <UserSearchResult 
                v-for="user in searchStore.userResults" 
                :key="user.id" 
                :user="user" 
              />
            </div>
          </section>

          <!-- Post Results -->
          <section v-if="searchStore.postResults.length > 0" class="results-group">
            <h2 class="section-label">Posts</h2>
            <PostList 
              :items="searchStore.postResults" 
              :loading="false"
              @like="postsStore.toggleLike"
              @comment="handleComment"
              @share="handleShare"
            />
          </section>
        </div>
      </div>

      <!-- Trending Feed (Default) -->
      <div v-else class="feed-section">
        <h2 class="section-label px-4">Trending Now</h2>
        <PostList 
          :items="postsStore.feed" 
          :loading="postsStore.loading"
          @like="postsStore.toggleLike"
          @comment="handleComment"
          @share="handleShare"
        />
      </div>
      
      <CommentDialog 
        :is-open="isCommentDialogOpen"
        :post-id="activePostId"
        :loading="isCommenting"
        @close="isCommentDialogOpen = false"
        @submit="submitComment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import BaseInput from '@/presentation/components/common/BaseInput.vue';
import PostList from '@/presentation/components/feed/PostList.vue';
import CommentDialog from '@/presentation/components/feed/CommentDialog.vue';
import UserSearchResult from '@/presentation/components/search/UserSearchResult.vue';
import { useCommentsStore } from '@/application/stores/comments.store';
import { usePostsStore } from '@/application/stores/posts.store';
import { useSearchStore } from '@/application/stores/search.store';
import { useDebounce } from '@/application/composables/utils';

const postsStore = usePostsStore();
const commentsStore = useCommentsStore();
const searchStore = useSearchStore();

const searchQuery = ref('');
const debouncedSearch = useDebounce(searchQuery, 400);

const isCommentDialogOpen = ref(false);
const isCommenting = ref(false);
const activePostId = ref<string | null>(null);

const handleComment = (id: string) => {
  activePostId.value = id;
  isCommentDialogOpen.value = true;
};

const handleShare = async (id: string) => {
  const post = postsStore.feed.find(p => p.id === id) || searchStore.postResults.find(p => p.id === id);
  if (!post) return;
  
  const url = `${window.location.origin}/post/${id}`;
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Post de ${post.authorName || 'Nexo'}`,
        text: post.content,
        url,
      });
      await postsStore.sharePost(id);
    } catch (err) {
      console.error('Error sharing', err);
    }
  } else {
    try {
      await navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
      await postsStore.sharePost(id);
    } catch (err) {
      console.error('Error copying to clipboard', err);
    }
  }
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

watch(debouncedSearch, (val) => {
  searchStore.performSearch(val);
});

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

.search-input :deep(input) {
  padding-left: var(--space-10);
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: var(--space-6) 0 var(--space-4);
}

.px-4 {
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}

.feed-section, .results-section {
  padding: 0 var(--space-2) var(--space-8);
}

.results-container {
  padding: 0 var(--space-2);
}

.results-group {
  margin-bottom: var(--space-8);
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-3);
}

.search-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-4);
  color: var(--text-tertiary);
  gap: var(--space-4);
}

.loader {
  width: 24px;
  height: 24px;
  border: 2px solid var(--surface-glass-border);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .users-grid {
    grid-template-columns: 1fr;
  }
}
</style>
