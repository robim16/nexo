<template>
  <div class="user-search-result" @click="navigateToProfile">
    <div class="avatar-wrapper">
      <img 
        v-if="user.avatar" 
        :src="user.avatar" 
        :alt="user.displayName" 
        class="avatar-img"
      />
      <div v-else class="avatar-placeholder">
        {{ user.displayName.charAt(0).toUpperCase() }}
      </div>
    </div>
    
    <div class="user-info">
      <div class="display-name">{{ user.displayName }}</div>
      <div class="username">@{{ user.email.split('@')[0] }}</div>
    </div>

    <div class="action-wrapper">
      <button 
        class="view-profile-btn"
        @click.stop="navigateToProfile"
      >
        View
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { UserPlainObject } from '@/core/entities/User';

const props = defineProps<{
  user: UserPlainObject;
}>();

const router = useRouter();

const navigateToProfile = () => {
  router.push(`/profile/${props.user.id}`);
};
</script>

<style scoped>
.user-search-result {
  display: flex;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-glass);
  border: 1px solid var(--surface-glass-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.user-search-result:hover {
  background: var(--surface-glass-hover);
  border-color: var(--primary-color);
  transform: translateY(-1px);
}

.avatar-wrapper {
  flex-shrink: 0;
}

.avatar-img, .avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--surface-glass-border);
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-gradient);
  color: white;
  font-weight: var(--font-weight-bold);
  font-size: 1.25rem;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.display-name {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.username {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.view-profile-btn {
  padding: var(--space-1) var(--space-3);
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-profile-btn:hover {
  background: var(--primary-color);
  color: white;
}
</style>
