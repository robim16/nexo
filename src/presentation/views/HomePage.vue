<template>
  <div class="home-page">
    <header class="page-header glass">
      <h1 class="page-title">Feed</h1>
      <div class="header-actions">
        <!-- Optional actions can go here -->
      </div>
    </header>
    
    <div class="page-content">
      <div class="create-post-section">
        <CreatePostDialog />
      </div>

      <div class="feed-section">
        <VirtualFeed />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CreatePostDialog from '@/presentation/components/feed/CreatePostDialog.vue';
import VirtualFeed from '@/presentation/components/feed/VirtualFeed.vue';
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-6) var(--space-8);
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--surface-glass);
  border: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
  filter: drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.2));
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: var(--space-8) 0;
}

.create-post-section {
  padding: 0 var(--space-4);
}

.feed-section {
  flex: 1;
}

/* ── Mobile Overrides ────────────────────────────────────── */
@media (max-width: 768px) {
  .page-header {
    padding: var(--space-4) var(--space-6);
  }
  
  .page-title {
    font-size: 1.5rem;
  }
}
</style>
