<template>
  <BaseButton
    :variant="isFollowing ? 'outline' : 'primary'"
    :disabled="loading"
    @click="toggleFollow"
    class="follow-button"
  >
    {{ loading ? '...' : (isFollowing ? 'Siguiendo' : 'Seguir') }}
  </BaseButton>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits } from 'vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';
// import { useSocialStore } from '@/presentation/stores/social'; // mock

const props = defineProps<{
  userId: string;
  initialIsFollowing?: boolean;
}>();

const emit = defineEmits(['update:following']);

const isFollowing = ref(props.initialIsFollowing || false);
const loading = ref(false);

const toggleFollow = async () => {
  if (loading.value) return;
  
  loading.value = true;
  // const socialStore = useSocialStore();
  try {
    // optimistic
    isFollowing.value = !isFollowing.value;
    emit('update:following', isFollowing.value);
    
    // if (isFollowing.value) {
    //   await socialStore.follow(props.userId);
    // } else {
    //   await socialStore.unfollow(props.userId);
    // }
  } catch (error) {
    // revert
    isFollowing.value = !isFollowing.value;
    emit('update:following', isFollowing.value);
    console.error('Follow action failed', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.follow-button {
  min-width: 100px;
}
</style>
