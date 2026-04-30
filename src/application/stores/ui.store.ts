import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useUIStore = defineStore('ui', () => {
  // --- Estado ---
  const isSidebarOpen = ref(false);
  const theme = ref<'light' | 'dark'>('light');
  const toasts = ref<Toast[]>([]);
  const activeModals = ref<string[]>([]);

  // --- Acciones ---

  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value;
  }

  function setTheme(newTheme: 'light' | 'dark') {
    theme.value = newTheme;
    document.documentElement.setAttribute('data-theme', newTheme);
  }

  function showToast(message: string, type: ToastType = 'info', duration = 3000) {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, message, type, duration };
    toasts.value.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  function openModal(modalId: string) {
    if (!activeModals.value.includes(modalId)) {
      activeModals.value.push(modalId);
    }
  }

  function closeModal(modalId: string) {
    activeModals.value = activeModals.value.filter(id => id !== modalId);
  }

  return {
    isSidebarOpen,
    theme,
    toasts,
    activeModals,
    toggleSidebar,
    setTheme,
    showToast,
    removeToast,
    openModal,
    closeModal
  };
}, {
  persist: {
    paths: ['theme', 'isSidebarOpen'],
    storage: localStorage
  }
});
