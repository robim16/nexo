import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { GetNotificationsUseCase } from '../../core/use-cases/notifications/GetNotificationsUseCase';
import type { MarkNotificationReadUseCase } from '../../core/use-cases/notifications/MarkNotificationReadUseCase';
import { container } from '../../dependency-injection';
import { useAuthStore } from './auth.store';

export interface NotificationDTO {
  id: string;
  type: string;
  message: string;
  fromUserId: string;
  postId?: string;
  isRead: boolean;
  createdAt: string;
}

export const useNotificationsStore = defineStore('notifications', () => {
  const authStore = useAuthStore();

  // --- Estado ---
  const notifications = ref<NotificationDTO[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Getters ---
  const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length);

  // --- Acciones ---

  /**
   * Carga las notificaciones del usuario.
   */
  async function fetchNotifications() {
    const userId = authStore.currentUserId;
    if (!userId) return;

    loading.value = true;
    try {
      const useCase = container.get<GetNotificationsUseCase>('GetNotificationsUseCase');
      const result = await useCase.execute({ userId });
      
      // Mapear a DTO simple para la UI
      notifications.value = result.map(n => ({
        id: n.id.value,
        type: n.type,
        message: n.message,
        fromUserId: n.fromUserId.value,
        postId: n.postId?.value,
        isRead: n.isRead,
        createdAt: n.createdAt.toISOString()
      }));
    } catch (err: any) {
      error.value = err.message || 'Error al cargar notificaciones';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Marca una notificación como leída.
   */
  async function markAsRead(notificationId: string) {
    const useCase = container.get<MarkNotificationReadUseCase>('MarkNotificationReadUseCase');
    try {
      await useCase.execute({ notificationId });
      
      const notification = notifications.value.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    } catch (err: any) {
      error.value = err.message || 'Error al marcar notificación';
    }
  }

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead
  };
});
