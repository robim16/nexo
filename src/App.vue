<template>
  <router-view v-slot="{ Component, route }">
    <component :is="resolveLayout(route)">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </component>
  </router-view>
</template>

<script setup lang="ts">
import { markRaw } from 'vue';
import DefaultLayout from '@/presentation/layouts/DefaultLayout.vue';
import AuthLayout from '@/presentation/layouts/AuthLayout.vue';

// Resolve layout based on route metadata
const resolveLayout = (route: any) => {
  if (route.meta.layout === 'AuthLayout') {
    return markRaw(AuthLayout);
  }
  return markRaw(DefaultLayout);
};
</script>

<style>
/* Global Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

<style scoped>
.app-loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background-color: var(--surface-base);
  color: var(--text-primary);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.loading-logo {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: var(--font-weight-bold);
  background: linear-gradient(to right, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pulse-glow 2s infinite ease-in-out;
}

.loading-bar {
  width: 200px;
  height: 2px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-full);
  overflow: hidden;
  position: relative;
}

.loading-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 40%;
  background: linear-gradient(to right, transparent, var(--color-primary), transparent);
  animation: loading-slide 1.5s infinite linear;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.8; filter: drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.2)); }
  50% { opacity: 1; filter: drop-shadow(0 0 20px rgba(var(--color-primary-rgb), 0.4)); }
}

@keyframes loading-slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(250%); }
}
</style>
