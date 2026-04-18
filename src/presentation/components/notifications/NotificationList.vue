<template>
  <div class="notification-list">
    <template v-if="loading">
      <SkeletonLoader v-for="i in 5" :key="i" type="list-item" class="p-md border-b" />
    </template>
    
    <template v-else-if="notifications.length === 0">
      <EmptyState
        title="Todo tranquilo aquí"
        message="Aún no tienes notificaciones. ¡Interactúa con la comunidad!"
        icon="🔔"
      />
    </template>

    <template v-else>
      <div class="notifications-header">
        <BaseButton variant="text" size="sm" @click="markAllAsRead">
          Marcar todas como leídas
        </BaseButton>
      </div>
      <NotificationItem
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @click="handleNotificationClick(notification)"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import NotificationItem from './NotificationItem.vue';
import type { AppNotification } from './NotificationItem.vue';
import SkeletonLoader from '@/presentation/components/common/SkeletonLoader.vue';
import EmptyState from '@/presentation/components/common/EmptyState.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';
// import { useNotificationStore } from '@/presentation/stores/notifications';

const router = useRouter();
const loading = ref(true);
const notifications = ref<AppNotification[]>([]);

onMounted(() => {
  // const notifStore = useNotificationStore();
  // notifications.value = notifStore.notifications;
  // Mock data for visual completeness
  setTimeout(() => {
    notifications.value = [
      { id: '1', type: 'LIKE', actorName: 'Maria', read: false, createdAt: new Date(Date.now() - 120000) },
      { id: '2', type: 'FOLLOW', actorName: 'Carlos', read: true, createdAt: new Date(Date.now() - 86400000) },
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
  background: var(--color-surface);
}

.p-md {
  padding: var(--spacing-md);
}

.border-b {
  border-bottom: 1px solid var(--color-border);
}

.notifications-header {
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
}
</style>
