<template>
  <div class="profile-header">
    <div class="profile-header__cover">
      <!-- Decorativo -->
    </div>
    
    <div class="profile-header__info">
      <div class="avatar-wrapper">
        <BaseAvatar :src="user.avatar || ''" :alt="user.displayName" size="xl" />
      </div>
      
      <div class="profile-header__actions" v-if="!isOwnProfile">
        <FollowButton :userId="user.id" :initialIsFollowing="isFollowing" />
      </div>
      <div class="profile-header__actions" v-else>
        <BaseButton variant="outline" @click="$router.push('/settings')">
          Editar Perfil
        </BaseButton>
      </div>

      <div class="profile-details">
        <h2 class="display-name">{{ user.displayName }}</h2>
        <p class="handle">@{{ user.handle || user.displayName.toLowerCase().replace(/\s/g, '') }}</p>
        <p class="bio">{{ user.bio || 'Sin biografía.' }}</p>
        
        <div class="join-date">
          <span class="icon">📅</span> Se unió en {{ formatJoinDate(user.createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';
import FollowButton from './FollowButton.vue';

const props = defineProps<{
  user?: any; // Mock User model
  isOwnProfile?: boolean;
  isFollowing?: boolean;
}>();

// mock data if user not provided
const user = props.user || {
  id: '123',
  displayName: 'Usuario Demo',
  avatar: '',
  bio: 'Explorando Nexo.',
  createdAt: new Date()
};

const formatJoinDate = (date: any) => {
  return new Date(date).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
};
</script>

<style scoped>
.profile-header {
  background: var(--color-surface);
  position: relative;
}

.profile-header__cover {
  height: 150px;
  background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-400));
}

.profile-header__info {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  position: relative;
}

.avatar-wrapper {
  margin-top: -50px;
  border: 4px solid var(--color-surface);
  border-radius: 50%;
  display: inline-block;
  background: var(--color-surface);
  margin-bottom: var(--spacing-sm);
}

.profile-header__actions {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-lg);
}

.profile-details {
  margin-top: var(--spacing-xs);
}

.display-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-black);
  color: var(--color-text);
}

.handle {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
}

.bio {
  margin: 0 0 var(--spacing-md) 0;
  line-height: 1.5;
  color: var(--color-text);
}

.join-date {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}
</style>
