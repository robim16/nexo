<template>
  <div class="home-page">
    <header class="page-header">
      <h1 class="page-title">Inicio</h1>
    </header>
    
    <div class="create-post-section">
      <CreatePostDialog />
    </div>

    <div class="feed-section">
      <VirtualFeed />
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
}

.page-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.85); /* fallback si falta token */
}

@media (prefers-color-scheme: dark) {
  .page-header {
    background: rgba(30, 41, 59, 0.85);
  }
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-black);
}

.create-post-section {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.feed-section {
  flex: 1;
  background-color: var(--color-background);
}
</style>
