<template>
  <div class="post-list">
    <template v-if="loading && items.length === 0">
      <SkeletonLoader
        v-for="i in skeletonCount"
        :key="i"
        type="rect"
        height="160px"
        class="mb-md"
      />
    </template>

    <template v-else-if="items.length === 0">
      <EmptyState
        title="No hay publicaciones"
        message="Aún no hay nada que mostrar aquí. Sigue a más gente para ver su contenido."
        icon="📭"
      />
    </template>

    <template v-else>
      <TransitionGroup name="list">
        <PostCard
          v-for="post in items"
          :key="post.id"
          :post="post"
          @like="$emit('like', $event)"
          @unlike="$emit('unlike', $event)"
          @comment="$emit('comment', $event)"
          @share="$emit('share', $event)"
        />
      </TransitionGroup>

      <!-- Custom append slot for infinite loaders -->
      <slot name="append"></slot>

      <div v-if="loading && items.length > 0" class="loading-more">
        <LoadingSpinner size="sm" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import PostCard from './PostCard.vue'
import type { PostDisplay } from './PostCard.vue'
import SkeletonLoader from '@/presentation/components/common/SkeletonLoader.vue'
import EmptyState from '@/presentation/components/common/EmptyState.vue'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue'

defineProps<{
  items: PostDisplay[]
  loading?: boolean
  skeletonCount?: number
}>()

defineEmits(['like', 'unlike', 'comment', 'share'])
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.loading-more {
  display: flex;
  justify-content: center;
  padding: var(--spacing-md);
}

/* Animations for list */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
