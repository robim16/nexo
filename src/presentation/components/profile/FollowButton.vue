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
  // Si es el perfil actual que estamos viendo en ProfilePage, usar el estado global
  if (usersStore.profiles[props.userId]) {
    // Aquí hay un pequeño dilema: si estamos en una lista, queremos el estado de esa persona específica.
    // Pero por ahora, usemos el isFollowingProfile si coincide con el ID, o asumamos que la prop es correcta
    return usersStore.isFollowingProfile && props.userId === usersStore.profiles[props.userId]?.id 
      ? true 
      : props.initialIsFollowing;
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
