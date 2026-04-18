<template>
  <Suspense>
    <template #default>
      <component :is="layout">
        <router-view />
      </component>
    </template>
    <template #fallback>
      <div class="app-loading-screen">
        Cargando Nexo...
      </div>
    </template>
  </Suspense>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import DefaultLayout from '@/presentation/layouts/DefaultLayout.vue';
import AuthLayout from '@/presentation/layouts/AuthLayout.vue';

const route = useRoute();

// Simple layout resolution based on route meta
const layout = computed(() => {
  if (route.meta.layout === 'AuthLayout') {
    return AuthLayout;
  }
  return DefaultLayout;
});
</script>

<style scoped>
.app-loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  font-family: var(--font-family-sans);
  color: var(--color-primary-500);
  background-color: var(--color-background);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}
</style>
