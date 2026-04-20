<template>
  <div class="default-layout">
    <!-- Sidebar Navigation -->
    <aside class="default-layout__sidebar glass">
      <div class="sidebar__brand">
        <span class="brand-text">Nexo</span>
        <div class="brand-dot"></div>
      </div>
      
      <nav class="sidebar__nav">
        <router-link to="/" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">🏠</span> 
          <span class="nav-label">Home</span>
        </router-link>
        <router-link to="/explore" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">🔍</span> 
          <span class="nav-label">Explore</span>
        </router-link>
        <router-link to="/notifications" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">🔔</span> 
          <span class="nav-label">Notifications</span>
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">👤</span> 
          <span class="nav-label">Profile</span>
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="nav-item--active">
          <span class="nav-icon">⚙️</span> 
          <span class="nav-label">Settings</span>
        </router-link>
      </nav>
      
      <div class="sidebar__footer">
        <div class="user-peek">
          <BaseAvatar 
            :src="userAvatar" 
            :name="userDisplayName" 
            size="md" 
            class="peek-avatar"
          />
          <div class="peek-info">
            <span class="peek-name">{{ userDisplayName }}</span>
            <span class="peek-handle">{{ userHandle }}</span>
          </div>
        </div>
        <button class="logout-btn" @click="handleLogout">
          <span>Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="default-layout__main">
      <header class="mobile-header glass">
        <div class="mobile-brand">Nexo</div>
        <button class="mobile-menu-toggle">☰</button>
      </header>
      
      <div class="content-container">
        <slot />
      </div>
    </main>

    <!-- Right Sidebar (Widgets) -->
    <aside class="default-layout__rightbar">
      <div class="rightbar__content">
        <div class="widget glass">
          <h3 class="widget-title">Trending Ethereal</h3>
          <ul class="trending-list">
            <li class="trend-item">
              <span class="trend-category">Tech</span>
              <span class="trend-name">#VueLumina</span>
              <span class="trend-stats">12.5k posts</span>
            </li>
            <li class="trend-item">
              <span class="trend-category">Art</span>
              <span class="trend-name">#Glassmorphism</span>
              <span class="trend-stats">8.2k posts</span>
            </li>
            <li class="trend-item">
              <span class="trend-category">Cyber</span>
              <span class="trend-name">#NexoPulse</span>
              <span class="trend-stats">5.1k posts</span>
            </li>
          </ul>
        </div>
        
        <div class="widget glass">
          <h3 class="widget-title">Who to Follow</h3>
          <div class="follow-list">
            <!-- Placeholders for future user items -->
            <div class="follow-item">
              <BaseAvatar name="Cyber Artist" size="sm" class="follow-avatar" />
              <div class="follow-info">
                <span class="follow-name">Cyber Artist</span>
                <span class="follow-handle">@cyber_art</span>
              </div>
              <button class="follow-btn">Follow</button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/application/stores/auth.store';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';

const router = useRouter();
const authStore = useAuthStore();

const userDisplayName = computed(() => authStore.user?.displayName || 'Explorer');
const userHandle = computed(() => {
  if (authStore.user?.email) {
    return `@${authStore.user.email.split('@')[0]}`;
  }
  return '@guest';
});

const userAvatar = computed(() => authStore.user?.avatar || null);

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'Login' });
};
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
  padding: var(--space-8) var(--space-6);
  z-index: 50;
  border: none;
  background: var(--surface-glass);
}

@media (min-width: 768px) {
  .default-layout__sidebar {
    display: flex;
  }
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-bottom: var(--space-12);
  padding-left: var(--space-4);
}

.brand-text {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  background: linear-gradient(to bottom right, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.3));
}

.brand-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-secondary);
  border-radius: var(--radius-full);
  box-shadow: var(--glow-secondary);
  margin-top: 1rem;
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-base);
}

.nav-item:hover {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
  transform: translateX(4px);
}

.nav-item--active {
  background-color: rgba(var(--color-primary-rgb), 0.1);
  color: var(--color-primary);
  font-weight: var(--font-weight-semibold);
  box-shadow: inset 0 0 20px rgba(var(--color-primary-rgb), 0.05);
}

.nav-item--active .nav-icon {
  filter: drop-shadow(0 0 5px var(--color-primary));
}

.sidebar__footer {
  padding-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.user-peek {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-2xl);
}

.peek-avatar {
  border: 2px solid var(--surface-glass-border);
}

.peek-info {
  display: flex;
  flex-direction: column;
}

.peek-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.peek-handle {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.logout-btn {
  width: 100%;
  padding: var(--space-3);
  background: transparent;
  color: var(--color-error);
  border: 1px solid rgba(255, 61, 113, 0.2);
  border-radius: var(--radius-xl);
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: var(--transition-base);
}

.logout-btn:hover {
  background-color: rgba(255, 61, 113, 0.1);
  box-shadow: 0 0 15px rgba(255, 61, 113, 0.1);
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
  background-color: var(--surface-glass);
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
  color: var(--color-primary);
}

.mobile-menu-toggle {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-primary);
  cursor: pointer;
}

.content-container {
  flex: 1;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-4);
}

/* ── Rightbar ───────────────────────────────────────────────── */
.default-layout__rightbar {
  display: none;
  width: 350px;
  padding: var(--space-8) var(--space-6);
  position: sticky;
  top: 0;
  height: 100vh;
}

@media (min-width: 1200px) {
  .default-layout__rightbar {
    display: block;
  }
}

.rightbar__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.widget {
  padding: var(--space-6);
  border-radius: var(--radius-3xl);
  background: var(--surface-glass);
}

.widget-title {
  margin-bottom: var(--space-4);
  font-size: var(--font-size-lg);
  color: var(--text-primary);
}

.trending-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.trend-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: var(--transition-base);
}

.trend-item:hover {
  background-color: var(--surface-glass-bright);
}

.trend-category {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.trend-name {
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary);
}

.trend-stats {
  font-size: var(--font-size-2xs);
  color: var(--text-disabled);
}

.follow-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.follow-avatar {
  border: 1px solid var(--surface-glass-border);
}

.follow-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.follow-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.follow-handle {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.follow-btn {
  padding: var(--space-1) var(--space-4);
  background-color: var(--text-primary);
  color: var(--surface-base);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
}

</style>
