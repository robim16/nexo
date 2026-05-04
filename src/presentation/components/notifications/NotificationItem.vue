<template>
  <div class="notification-item" :class="{ unread: !notification.isRead, interactive: true }">
    <div class="actor-visual">
      <BaseAvatar
        :src="notification.actorAvatar || ''"
        :alt="notification.actorName"
        size="md"
        class="actor-avatar"
      />
      <div class="type-indicator" :class="notification.type.toLowerCase()">
        <span class="type-icon">{{ typeIcon }}</span>
      </div>
    </div>

    <div class="notification-content">
      <div class="content-text">
        <span class="actor-name">{{ notification.actorName }}</span>
        <span class="action-text">{{ actionText }}</span>
      </div>
      <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
    </div>

    <div v-if="!notification.isRead" class="unread-pulse"></div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'

export interface AppNotification {
  id: string
  type: string
  actorName: string
  actorAvatar?: string
  createdAt: Date | string | number
  isRead: boolean
  postId?: string
  fromUserId?: string
}

const props = defineProps<{
  notification: AppNotification
}>()

const actionText = computed(() => {
  switch (props.notification.type) {
    case 'LIKE':
      return 'liked your pulse.'
    case 'COMMENT':
      return 'commented on your pulse.'
    case 'FOLLOW':
      return 'is now following you.'
    case 'MENTION':
      return 'mentioned you in a pulse.'
    case 'SHARE':
      return 'shared your pulse.'
    case 'REACTION_FOLLOWED':
      return 'reacted to a pulse.'
    default:
      return 'interacted with you.'
  }
})

const typeIcon = computed(() => {
  switch (props.notification.type) {
    case 'LIKE':
      return '❤️'
    case 'COMMENT':
      return '💬'
    case 'FOLLOW':
      return '👤'
    case 'MENTION':
      return '🏷️'
    case 'SHARE':
      return '🔄'
    case 'REACTION_FOLLOWED':
      return '⚡'
    default:
      return '✨'
  }
})

const formatTime = (date: Date | string | number) => {
  const d = new Date(date)
  return new Intl.RelativeTimeFormat('en', { style: 'short', numeric: 'auto' }).format(
    -Math.round((Date.now() - d.getTime()) / (1000 * 60)),
    'minute'
  )
}
</script>

<style scoped>
.notification-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  position: relative;
  transition: var(--transition-base);
  border-radius: var(--radius-2xl);
  margin-bottom: var(--space-1);
}

.notification-item:hover {
  background-color: var(--surface-glass-bright);
  transform: translateX(4px);
}

.unread {
  background-color: rgba(var(--color-primary-rgb), 0.05);
}

.unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 4px;
  background-color: var(--color-primary);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  box-shadow: 0 0 10px var(--color-primary);
}

.actor-visual {
  position: relative;
}

.actor-avatar {
  border: 2px solid var(--surface-glass-border);
}

.type-indicator {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  border: 2px solid var(--surface-base);
  z-index: 2;
}

.type-indicator.like {
  background-color: var(--color-primary);
  box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.5);
}

.type-indicator.comment,
.type-indicator.follow {
  background-color: var(--color-secondary);
  box-shadow: 0 0 10px rgba(var(--color-secondary-rgb), 0.5);
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.content-text {
  font-size: var(--font-size-md);
  color: var(--text-primary);
  line-height: var(--line-height-normal);
}

.actor-name {
  font-family: var(--font-display);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-right: var(--space-1);
}

.action-text {
  color: var(--text-secondary);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.unread-pulse {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  box-shadow: 0 0 10px var(--color-primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
