<template>
  <div class="notification-list">
    <div class="list-header glass">
      <h3 class="header-title">Recent Activity</h3>
      <BaseButton 
        v-if="notifications.length > 0" 
        variant="glass" 
        size="sm" 
        class="mark-read-btn"
        @click="markAllAsRead"
      >
        Mark all as read
      </BaseButton>
    </div>

    <div class="list-container">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="skeleton-item glass">
          <div class="skeleton-avatar"></div>
          <div class="skeleton-content">
            <div class="skeleton-line"></div>
            <div class="skeleton-line short"></div>
          </div>
        </div>
      </template>
      
      <template v-else-if="notifications.length === 0">
        <div class="empty-notifications glass">
          <span class="empty-icon">🔔</span>
          <h4 class="empty-title">All caught up!</h4>
          <p class="empty-desc">No new pulses in your network right now.</p>
        </div>
      </template>

      <template v-else>
        <div class="notification-group">
          <NotificationItem
            v-for="notification in notifications"
            :key="notification.id"
            :notification="notification"
            @click="handleNotificationClick(notification)"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NotificationItem from './NotificationItem.vue';
import type { AppNotification } from './NotificationItem.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const router = useRouter();
const loading = ref(true);
const notifications = ref<AppNotification[]>([]);

onMounted(() => {
  // Mock data for visual completeness
  setTimeout(() => {
    notifications.value = [
      { id: '1', type: 'LIKE', actorName: 'Maria Lumina', read: false, createdAt: new Date(Date.now() - 120000) },
      { id: '2', type: 'FOLLOW', actorName: 'Cyber Carlos', read: true, createdAt: new Date(Date.now() - 86400000) },
      { id: '3', type: 'COMMENT', actorName: 'Echo Ghost', read: false, createdAt: new Date(Date.now() - 1200000) },
    ];
    loading.value = false;
  }, 1000);
});

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true);
};

const handleNotificationClick = (notification: AppNotification) => {
  notification.read = true;
  if (notification.type === 'FOLLOW') {
    router.push(`/profile/${notification.actorName}`);
  }
};
</script>

<style scoped>
.notification-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-2xl);
}

.header-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.empty-notifications {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  border-radius: var(--radius-3xl);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-title {
  margin: 0 0 var(--space-1);
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  color: var(--text-primary);
}

.empty-desc {
  color: var(--text-tertiary);
  font-size: var(--font-size-md);
}

/* Skeletons */
.skeleton-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-2xl);
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: rgba(255, 255, 255, 0.05);
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.skeleton-line {
  height: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-sm);
  width: 60%;
}

.skeleton-line.short {
  width: 30%;
}
</style>
