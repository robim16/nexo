<template>
  <BaseButton
    :variant="isFollowing ? 'glass' : 'primary'"
    :size="size"
    :disabled="loading"
    @click="toggleFollow"
    class="follow-button"
  >
    {{ loading ? '...' : (isFollowing ? 'Following' : 'Follow') }}
  </BaseButton>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from 'vue';
import { useUsersStore } from '@/application/stores/users.store';
import { useAuthStore } from '@/application/stores/auth.store';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const props = withDefaults(defineProps<{
  userId: string;
  initialIsFollowing?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  size: 'md'
});

const usersStore = useUsersStore();
const authStore = useAuthStore();
const loading = ref(false);

const isFollowing = computed(() => {
  // El usuario actual no se sigue a sí mismo
  if (authStore.user?.id === props.userId) return false;

  // Si tenemos el ID en nuestra lista local de seguidos del usuario autenticado, esa es la fuente de verdad definitiva
  if (usersStore.myFollowingIds.includes(props.userId)) {
    return true;
  }

  // Si no está en la lista pero es el perfil principal que estamos viendo y ya comprobamos el estado
  if (usersStore.profiles[props.userId] && usersStore.isFollowingProfile && props.userId === usersStore.profiles[props.userId]?.id) {
    return true;
  }

  return props.initialIsFollowing;
});

const toggleFollow = async () => {
  if (loading.value || !authStore.isAuthenticated) return;
  
  loading.value = true;
  try {
    if (isFollowing.value) {
      await usersStore.unfollowUser(props.userId);
    } else {
      await usersStore.followUser(props.userId);
    }
  } catch (error) {
    console.error('Follow action failed', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.follow-button {
  min-width: 110px;
  font-weight: var(--font-weight-bold);
}
</style>
