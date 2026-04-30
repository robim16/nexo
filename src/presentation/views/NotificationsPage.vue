<template>
  <div class="notifications-page">
    <header class="page-header">
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
  margin-bottom: var(--space-1);
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

.notifications-container {
  flex: 1;
  padding: var(--space-6) var(--space-2);
}
</style>
