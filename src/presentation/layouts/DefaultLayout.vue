<template>
  <div class="default-layout">
    <aside class="default-layout__sidebar">
      <div class="sidebar__brand">Nexo</div>
      <nav class="sidebar__nav">
        <router-link to="/" class="nav-item" active-class="nav-item--active">
          <span class="icon">🏠</span> Home
        </router-link>
        <router-link to="/explore" class="nav-item" active-class="nav-item--active">
          <span class="icon">🔍</span> Explore
        </router-link>
        <router-link to="/notifications" class="nav-item" active-class="nav-item--active">
          <span class="icon">🔔</span> Notifications
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="nav-item--active">
          <span class="icon">👤</span> Profile
        </router-link>
        <router-link to="/settings" class="nav-item" active-class="nav-item--active">
          <span class="icon">⚙️</span> Settings
        </router-link>
      </nav>
      
      <div class="sidebar__footer">
        <button class="logout-btn" @click="handleLogout">Salir</button>
      </div>
    </aside>

    <main class="default-layout__main">
      <header class="mobile-header">
        <div class="mobile-brand">Nexo</div>
        <button class="mobile-menu-toggle">☰</button>
      </header>
      <div class="content-container">
        <router-view />
      </div>
    </main>

    <aside class="default-layout__rightbar">
      <div class="rightbar__widget">
        <h3>Trending</h3>
        <ul class="trending-list">
          <li>#Vue3</li>
          <li>#CleanArchitecture</li>
          <li>#Firebase</li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/presentation/stores/auth'; // asumiendo esto del Agente 3

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'Login' });
};
</script>

<style scoped>
.default-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-family-sans);
}

.default-layout__sidebar {
  display: none;
  width: 280px;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-surface);
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
}

@media (min-width: 768px) {
  .default-layout__sidebar {
    display: flex;
  }
}

.sidebar__brand {
  font-size: 2rem;
  font-weight: var(--font-weight-black);
  padding: var(--spacing-lg);
  color: var(--color-primary-600);
}

.sidebar__nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-md);
  gap: var(--spacing-sm);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-lg);
  transition: background-color 0.2s, color 0.2s;
}

.nav-item:hover {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
}

.nav-item--active {
  background-color: var(--color-primary-100);
  color: var(--color-primary-800);
  font-weight: var(--font-weight-bold);
}

.sidebar__footer {
  padding: var(--spacing-lg);
}

.logout-btn {
  width: 100%;
  padding: var(--spacing-sm);
  background: transparent;
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  transition: all 0.2s;
}

.logout-btn:hover {
  background: var(--color-error);
  color: white;
  border-color: var(--color-error);
}

.default-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
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
  font-size: 1.5rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
}

.mobile-menu-toggle {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.content-container {
  flex: 1;
  margin: 0 auto;
  width: 100%;
  max-width: 600px;
}

.default-layout__rightbar {
  display: none;
  width: 320px;
  border-left: 1px solid var(--color-border);
  background-color: var(--color-background);
  padding: var(--spacing-lg);
  position: sticky;
  top: 0;
  height: 100vh;
}

@media (min-width: 1200px) {
  .default-layout__rightbar {
    display: block;
  }
}

.rightbar__widget {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
}

.rightbar__widget h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
  font-weight: var(--font-weight-bold);
}

.trending-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.trending-list li {
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  cursor: pointer;
}

.trending-list li:hover {
  text-decoration: underline;
  color: var(--color-primary-600);
}
</style>
