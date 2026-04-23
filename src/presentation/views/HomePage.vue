<template>
  <div class="home-page">
    <header class="page-header">
      <div class="header-left">
        <h1 class="page-title">Feed</h1>
        <span class="page-subtitle">Your network pulse</span>
      </div>
      <div class="header-actions">
        <button class="header-btn" title="Refresh feed" @click="refreshFeed">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ spinning: isRefreshing }">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </header>
    
    <div class="page-content">
      <section class="create-post-section">
        <CreatePostDialog />
      </section>

      <section class="feed-section">
        <VirtualFeed />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CreatePostDialog from '@/presentation/components/feed/CreatePostDialog.vue';
import VirtualFeed from '@/presentation/components/feed/VirtualFeed.vue';
import { usePostsStore } from '@/application/stores/posts.store';

const postsStore = usePostsStore();
const isRefreshing = ref(false);

const refreshFeed = async () => {
  isRefreshing.value = true;
  try {
    await postsStore.fetchFeed(true);
  } finally {
    setTimeout(() => { isRefreshing.value = false }, 600);
  }
};
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-6) var(--space-4);
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(10, 10, 11, 0.8);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--surface-glass-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  flex-direction: column;
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
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: var(--space-2);
}

.header-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-base);
}

.header-btn svg {
  width: 18px;
  height: 18px;
}

.header-btn:hover {
  background: rgba(var(--color-primary-rgb), 0.1);
  border-color: rgba(var(--color-primary-rgb), 0.3);
  color: var(--color-primary);
}

.header-btn svg.spinning {
  animation: spin 0.6s linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6) 0;
}

.create-post-section {
  padding: 0 var(--space-2);
}

.feed-section {
  flex: 1;
  padding: 0 var(--space-2);
}

/* ── Mobile ────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    padding: var(--space-4);
  }
  
  .page-title {
    font-size: 1.375rem;
  }
}
</style>
