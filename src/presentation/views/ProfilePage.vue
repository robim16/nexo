<template>
  <div class="profile-page">
    <header class="page-header">
      <!-- Mock back button or title depending on route -->
      <h1 class="page-title">Perfil</h1>
    </header>

    <div class="profile-top">
      <ProfileHeader />
      <ProfileStats />
    </div>

    <div class="profile-content">
      <div class="tabs">
        <button class="tab active">Publicaciones</button>
        <button class="tab">Me gusta</button>
      </div>
      <PostList />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProfileHeader from '@/presentation/components/profile/ProfileHeader.vue';
import ProfileStats from '@/presentation/components/profile/ProfileStats.vue';
import PostList from '@/presentation/components/feed/PostList.vue';
</script>

<style scoped>
.profile-page {
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
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-black);
}

.profile-top {
  border-bottom: 1px solid var(--color-border);
}

.tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.tab {
  flex: 1;
  padding: var(--spacing-md);
  background: transparent;
  border: none;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab:hover {
  background: var(--color-primary-50);
}

.tab.active {
  color: var(--color-primary-600);
  border-bottom-color: var(--color-primary-600);
}
</style>
