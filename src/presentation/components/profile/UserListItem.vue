<template>
  <div class="user-list-item glass-hover" @click="navigateToProfile">
    <div class="user-info">
      <BaseAvatar :src="user.avatar || ''" :alt="user.displayName" size="md" />
      <div class="user-details">
        <span class="display-name">{{ user.displayName }}</span>
        <span class="handle"
          >@{{ user.handle || user.displayName.toLowerCase().replace(/\s/g, '') }}</span
        >
      </div>
    </div>

    <div class="user-actions" @click.stop>
      <FollowButton v-if="!isOwnProfile" :userId="user.id" :initialIsFollowing="false" size="sm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/application/stores/auth.store'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'
import FollowButton from '@/presentation/components/profile/FollowButton.vue'

const props = defineProps<{
  user: any
}>()

const router = useRouter()
const authStore = useAuthStore()

const isOwnProfile = computed(() => authStore.user?.id === props.user.id)

const navigateToProfile = () => {
  router.push(`/profile/${props.user.id}`)
}
</script>

<style scoped>
.user-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: var(--transition-base);
  margin-bottom: var(--space-2);
}

.user-list-item:hover {
  background: var(--surface-glass-bright);
  transform: translateX(4px);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.display-name {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.handle {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.user-actions {
  display: flex;
  align-items: center;
}
</style>
