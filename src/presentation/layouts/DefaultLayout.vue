<template>
  <div class="default-layout">
    <!-- Sidebar Navigation -->
    <aside class="default-layout__sidebar">
      <div class="sidebar__brand">
        <div class="brand-icon">
          <svg viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke="url(#brandGrad)" stroke-width="2.5" />
            <path
              d="M10 20 L16 10 L22 20"
              stroke="url(#brandGrad)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="var(--color-primary)" />
                <stop offset="100%" stop-color="var(--color-secondary)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="brand-text">Nexo</span>
      </div>

      <nav class="sidebar__nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          active-class="nav-item--active"
          :exact="item.exact"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </router-link>
      </nav>

      <div class="sidebar__footer">
        <div class="user-peek">
          <BaseAvatar :src="userAvatar" :name="userDisplayName" size="md" class="peek-avatar" />
          <div class="peek-info">
            <span class="peek-name">{{ userDisplayName }}</span>
            <span class="peek-handle">{{ userHandle }}</span>
          </div>
        </div>
        <button class="logout-btn" title="Sign out" @click="handleLogout">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="default-layout__main">
      <header class="mobile-header">
        <div class="mobile-brand">Nexo</div>
        <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      <div class="content-container">
        <slot />
      </div>
    </main>

    <!-- Right Sidebar (Widgets) -->
    <aside class="default-layout__rightbar">
      <div class="rightbar__content">
        <!-- Search Widget -->
        <div class="widget widget--search">
          <div class="search-input-wrapper">
            <svg
              class="search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" class="search-input" placeholder="Search Nexo..." />
          </div>
        </div>

        <!-- Trending Widget -->
        <div class="widget">
          <h3 class="widget-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-secondary)"
              stroke-width="2"
              style="width: 18px; height: 18px; margin-right: 8px"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Trending
          </h3>
          <ul class="trending-list">
            <template v-if="postsStore.loadingTrends">
              <li v-for="i in 3" :key="'skeleton-' + i" class="trend-item skeleton">
                <div class="trend-rank-skeleton"></div>
                <div class="trend-body-skeleton">
                  <div class="trend-name-skeleton"></div>
                  <div class="trend-stats-skeleton"></div>
                </div>
              </li>
            </template>
            <li v-for="(trend, i) in trends" v-else :key="trend.tag" class="trend-item">
              <span class="trend-rank">#{{ i + 1 }}</span>
              <div class="trend-body">
                <span class="trend-name">{{ trend.tag }}</span>
                <span class="trend-stats">{{ trend.count }} posts</span>
              </div>
            </li>
            <li
              v-if="!postsStore.loadingTrends && (!trends || trends.length === 0)"
              class="empty-trends"
            >
              No trends today
            </li>
          </ul>
        </div>

        <!-- Suggestions Widget -->
        <div class="widget">
          <h3 class="widget-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-primary)"
              stroke-width="2"
              style="width: 18px; height: 18px; margin-right: 8px"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
            Who to Follow
          </h3>
          <div class="follow-list">
            <div v-for="user in suggestedUsers" :key="user.id" class="follow-item">
              <BaseAvatar
                :src="user.avatar"
                :name="user.displayName"
                size="sm"
                class="follow-avatar"
              />
              <div class="follow-info">
                <span class="follow-name">{{ user.displayName }}</span>
                <span class="follow-handle">@{{ user.email.split('@')[0] }}</span>
              </div>
              <button class="follow-btn" @click="handleFollow(user.id)">Follow</button>
            </div>
            <div v-if="!suggestedUsers || suggestedUsers.length === 0" class="empty-suggestions">
              No new suggestions
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Menu Overlay -->
    <Teleport to="body">
      <Transition name="overlay">
        <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/application/stores/auth.store'
import { useUsersStore } from '@/application/stores/users.store'
import { usePostsStore } from '@/application/stores/posts.store'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'

const router = useRouter()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const postsStore = usePostsStore()
const mobileMenuOpen = ref(false)

const userDisplayName = computed(() => authStore.user?.displayName || 'Explorer')
const userHandle = computed(() => {
  if (authStore.user?.email) {
    return `@${authStore.user.email.split('@')[0]}`
  }
  return '@guest'
})

const userAvatar = computed(() => authStore.user?.avatar || null)

interface NavItem {
  to: string
  label: string
  icon: string
  exact?: boolean
  badge?: string | number
}

const navItems: NavItem[] = [
  {
    to: '/',
    label: 'Home',
    exact: true,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>'
  },
  {
    to: '/explore',
    label: 'Explore',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>'
  },
  {
    to: '/notifications',
    label: 'Notifications',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>'
  },
  {
    to: '/profile',
    label: 'Profile',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
  },
  {
    to: '/saved',
    label: 'Saved',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>'
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
  }
]

const trends = computed(() => postsStore.trendingTags || [])

const suggestedUsers = computed(() => usersStore.suggestedUsers || [])

const handleFollow = async (userId: string) => {
  await usersStore.followUser(userId)
  await usersStore.fetchSuggestedUsers() // Refresh suggestions
}

onMounted(() => {
  usersStore.fetchSuggestedUsers()
  usersStore.fetchMyFollowingIds()
  postsStore.fetchTrendingTags()
  postsStore.fetchSavedPosts()
})

watch(
  () => authStore.currentUserId,
  (newId) => {
    if (newId) {
      usersStore.fetchSuggestedUsers()
    }
  }
)

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--surface-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
}

/* ── Sidebar ────────────────────────────────────────────────── */
.default-layout__sidebar {
  display: none;
  width: var(--nav-width);
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  padding: var(--space-6) var(--space-4);
  z-index: 50;
  background: linear-gradient(180deg, rgba(19, 19, 19, 0.8) 0%, rgba(10, 10, 11, 0.95) 100%);
  backdrop-filter: var(--backdrop-blur-lg);
  -webkit-backdrop-filter: var(--backdrop-blur-lg);
  border-right: 1px solid var(--surface-glass-border);
}

@media (min-width: 768px) {
  .default-layout__sidebar {
    display: flex;
  }
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4) var(--space-8);
}

.brand-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(var(--color-primary-rgb), 0.4));
  animation: brand-pulse 3s ease-in-out infinite;
}

@keyframes brand-pulse {
  0%,
  100% {
    filter: drop-shadow(0 0 8px rgba(var(--color-primary-rgb), 0.4));
  }
  50% {
    filter: drop-shadow(0 0 16px rgba(var(--color-secondary-rgb), 0.5));
  }
}

.brand-text {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding: 0 var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-base);
  position: relative;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item--active {
  background: linear-gradient(
    135deg,
    rgba(var(--color-primary-rgb), 0.12),
    rgba(var(--color-secondary-rgb), 0.06)
  );
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
}

.nav-item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: var(--radius-full);
  background: linear-gradient(180deg, var(--color-primary), var(--color-secondary));
  box-shadow: 0 0 12px rgba(var(--color-primary-rgb), 0.5);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.nav-icon :deep(svg) {
  width: 22px;
  height: 22px;
}

.nav-item--active .nav-icon :deep(svg) {
  filter: drop-shadow(0 0 6px var(--color-primary));
}

.nav-badge {
  margin-left: auto;
  background: var(--color-primary);
  color: white;
  font-size: var(--font-size-2xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.4);
}

.sidebar__footer {
  padding-top: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  border-top: 1px solid var(--surface-glass-border);
  margin: 0 var(--space-2);
  padding: var(--space-4) var(--space-2) 0;
}

.user-peek {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
  padding: var(--space-2);
  border-radius: var(--radius-xl);
  transition: var(--transition-base);
}

.user-peek:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.peek-avatar {
  border: 2px solid rgba(var(--color-primary-rgb), 0.3);
  flex-shrink: 0;
}

.peek-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.peek-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.peek-handle {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: transparent;
  color: var(--text-tertiary);
  border: 1px solid transparent;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.logout-btn svg {
  width: 18px;
  height: 18px;
}

.logout-btn:hover {
  background-color: rgba(255, 61, 113, 0.08);
  border-color: rgba(255, 61, 113, 0.2);
  color: var(--color-error);
}

/* ── Main ───────────────────────────────────────────────────── */
.default-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: rgba(10, 10, 11, 0.85);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--surface-glass-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

@media (min-width: 768px) {
  .mobile-header {
    display: none;
  }
}

.mobile-brand {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mobile-menu-toggle {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-menu-toggle svg {
  width: 22px;
  height: 22px;
}

.content-container {
  flex: 1;
  width: 100%;
  max-width: 680px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* ── Rightbar ───────────────────────────────────────────────── */
.default-layout__rightbar {
  display: none;
  width: 340px;
  padding: var(--space-6) var(--space-4);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-left: 1px solid var(--surface-glass-border);
}

.default-layout__rightbar::-webkit-scrollbar {
  width: 0;
}

@media (min-width: 1200px) {
  .default-layout__rightbar {
    display: block;
  }
}

.rightbar__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Search Widget */
.widget--search {
  padding: 0;
  background: none;
  border: none;
  box-shadow: none;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  width: 16px;
  height: 16px;
  color: var(--text-disabled);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) calc(var(--space-4) + 24px);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-full);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  outline: none;
  transition: var(--transition-base);
}

.search-input::placeholder {
  color: var(--text-disabled);
}

.search-input:focus {
  border-color: rgba(var(--color-primary-rgb), 0.4);
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.1);
}

/* Widgets */
.widget {
  padding: var(--space-4);
  border-radius: var(--radius-2xl);
  background: rgba(19, 19, 19, 0.5);
  border: 1px solid var(--surface-glass-border);
}

.widget-title {
  display: flex;
  align-items: center;
  margin: 0 0 var(--space-4);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.trend-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  padding: var(--space-3) var(--space-2);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.trend-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.trend-rank {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--text-disabled);
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.trend-body {
  display: flex;
  flex-direction: column;
}

.trend-name {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.trend-stats {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.empty-trends {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--surface-glass-border);
}

/* Skeletons */
.trend-item.skeleton {
  cursor: default;
  pointer-events: none;
}

.trend-rank-skeleton {
  width: 24px;
  height: 14px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s infinite;
}

.trend-body-skeleton {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.trend-name-skeleton {
  width: 60%;
  height: 14px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s infinite;
}

.trend-stats-skeleton {
  width: 40%;
  height: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-xs);
  animation: pulse 1.5s infinite 0.2s;
}

@keyframes pulse {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.5;
  }
}

.follow-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.follow-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.follow-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.follow-avatar {
  border: 1px solid var(--surface-glass-border);
  flex-shrink: 0;
}

.follow-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.follow-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.follow-handle {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.follow-btn {
  padding: 6px var(--space-4);
  background: linear-gradient(135deg, var(--color-primary), #cc0066);
  color: white;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: var(--transition-base);
  flex-shrink: 0;
}

.follow-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 14px rgba(var(--color-primary-rgb), 0.4);
}

.empty-suggestions {
  padding: var(--space-4);
  text-align: center;
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-lg);
  border: 1px dashed var(--surface-glass-border);
}

/* ── Mobile Overlay ─────────────────────────────────────────── */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 40;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.3s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
