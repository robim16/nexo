<template>
  <div class="profile-page">
    <header class="page-header glass">
      <div class="header-content">
        <BaseButton variant="glass" size="sm" class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </BaseButton>
        <div class="header-info">
          <h1 class="page-title">{{ user.displayName }}</h1>
          <span class="post-count">{{ stats.posts }} posts</span>
        </div>
      </div>
    </header>

    <div class="profile-container">
      <div class="profile-top-section">
        <ProfileHeader :user="user" :isOwnProfile="isOwnProfile" />
        <div class="stats-wrapper">
          <ProfileStats :stats="stats" />
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-tabs glass">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-item" 
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-label">{{ tab.label }}</span>
            <div class="tab-indicator"></div>
          </button>
        </div>

        <div class="feed-wrapper">
          <transition name="fade-slide" mode="out-in">
            <PostList 
              v-if="activeTab === 'posts'"
              :items="postsStore.feed" 
              :loading="postsStore.loading"
              @like="postsStore.toggleLike"
            />
            <div v-else class="empty-state glass">
              <span class="empty-icon">✨</span>
              <p>Nothing to see here yet.</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePostsStore } from '@/application/stores/posts.store';
import { useAuthStore } from '@/application/stores/auth.store';
import ProfileHeader from '@/presentation/components/profile/ProfileHeader.vue';
import ProfileStats from '@/presentation/components/profile/ProfileStats.vue';
import PostList from '@/presentation/components/feed/PostList.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const postsStore = usePostsStore();
const authStore = useAuthStore();
const activeTab = ref('posts');

const tabs = [
  { id: 'posts', label: 'Posts' },
  { id: 'replies', label: 'Replies' },
  { id: 'likes', label: 'Likes' }
];

// Use real user from store, fallback to mock if null (for visual development)
const user = computed(() => authStore.user || {
  id: '123',
  displayName: 'Lumina Explorer',
  avatar: '',
  bio: 'Synthesizing the future of social interaction in the Onyx space.',
  createdAt: new Date(),
  location: 'Cyber Space'
});

const stats = computed(() => ({
  posts: authStore.user?.postsCount || 0,
  followers: authStore.user?.followersCount || 0,
  following: authStore.user?.followingCount || 0
}));

const isOwnProfile = computed(() => authStore.user?.id === user.value.id);

onMounted(() => {
  if (postsStore.feed.length === 0) {
    postsStore.fetchFeed();
  }
});
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-3) var(--space-6);
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--surface-glass);
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.back-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.header-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.post-count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.stats-wrapper {
  padding: 0 var(--space-4);
}

.profile-tabs {
  display: flex;
  margin: var(--space-6) var(--space-4);
  border-radius: var(--radius-2xl);
  background: var(--surface-glass);
  padding: var(--space-1);
}

.tab-item {
  flex: 1;
  padding: var(--space-4);
  background: transparent;
  border: none;
  font-weight: var(--font-weight-bold);
  color: var(--text-tertiary);
  cursor: pointer;
  position: relative;
  transition: var(--transition-base);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.tab-item:hover {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-indicator {
  position: absolute;
  bottom: 8px;
  width: 20px;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  opacity: 0;
  transform: scaleX(0.5);
  transition: var(--transition-base);
  box-shadow: 0 0 10px var(--color-primary);
}

.tab-item.active .tab-indicator {
  opacity: 1;
  transform: scaleX(1);
}

.feed-wrapper {
  padding: 0 var(--space-4) var(--space-12);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  border-radius: var(--radius-3xl);
  color: var(--text-tertiary);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
