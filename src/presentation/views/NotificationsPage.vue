<template>
  <div class="notifications-page">
    <header class="page-header">
      <h1 class="page-title">Notificaciones</h1>
    </header>

    <div class="notifications-section">
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
  min-height: 100%;
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

.notifications-section {
  flex: 1;
}
</style>
