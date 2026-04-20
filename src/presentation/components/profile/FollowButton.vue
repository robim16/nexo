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
import { ref, defineProps, defineEmits } from 'vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const props = withDefaults(defineProps<{
  userId: string;
  initialIsFollowing?: boolean;
  size?: 'sm' | 'md' | 'lg';
}>(), {
  size: 'md'
});

const emit = defineEmits(['update:following']);

const isFollowing = ref(props.initialIsFollowing || false);
const loading = ref(false);

const toggleFollow = async () => {
  if (loading.value) return;
  
  loading.value = true;
  try {
    // optimistic
    isFollowing.value = !isFollowing.value;
    emit('update:following', isFollowing.value);
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
  min-width: 110px;
  font-weight: var(--font-weight-bold);
}
</style>
