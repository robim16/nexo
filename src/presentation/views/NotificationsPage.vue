<template>
  <div class="notifications-page">
    <header class="page-header glass">
      <div class="header-content">
        <h1 class="page-title">Notifications</h1>
        <p class="page-subtitle">Stay connected with your network pulses</p>
      </div>
    </header>

    <div class="notifications-container">
      <NotificationList />
    </div>
  </div>
</template>

<script setup lang="ts">
import NotificationList from '@/presentation/components/notifications/NotificationList.vue';
</script>

<style scoped>
.notifications-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-8) var(--space-6);
  background: var(--surface-glass);
  margin-bottom: var(--space-8);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
  filter: drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.2));
}

.page-subtitle {
  margin: var(--space-2) 0 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-md);
}

.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  padding: 0 var(--space-4) var(--space-12);
}
</style>
