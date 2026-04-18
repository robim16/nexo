<template>
  <div class="notification-item" :class="{ 'notification-item--unread': !notification.read }">
    <BaseAvatar :src="notification.actorAvatar || ''" :alt="notification.actorName" size="md" />
    
    <div class="notification-content">
      <p class="notification-text">
        <span class="actor-name">{{ notification.actorName }}</span>
        {{ actionText }}
      </p>
      <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
    </div>

    <div v-if="!notification.read" class="unread-dot"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';

export interface AppNotification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW';
  actorName: string;
  actorAvatar?: string;
  createdAt: Date | string | number;
  read: boolean;
  targetId?: string; // post id or user id
}

const props = defineProps<{
  notification: AppNotification;
}>();

const actionText = computed(() => {
  switch (props.notification.type) {
    case 'LIKE': return 'le ha gustado tu publicación.';
    case 'COMMENT': return 'comentó en tu publicación.';
    case 'FOLLOW': return 'ha empezado a seguirte.';
    default: return 'interactuó contigo.';
  }
});

const formatTime = (date: Date | string | number) => {
  const d = new Date(date);
  return new Intl.RelativeTimeFormat('es', { style: 'short', numeric: 'auto' }).format(-Math.round((Date.now() - d.getTime()) / (1000 * 60)), 'minute');
};
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  transition: background-color 0.2s;
  cursor: pointer;
}

.notification-item:hover {
  background: var(--color-background);
}

.notification-item--unread {
  background: var(--color-primary-50);
}

.notification-content {
  flex: 1;
}

.notification-text {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-md);
  color: var(--color-text);
}

.actor-name {
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
}

.notification-time {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.unread-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-primary-600);
}
</style>
