import { container } from '../../dependency-injection'
import type { INotificationRepository } from '../../core/ports/repositories/INotificationRepository'
import { UserId } from '../../core/value-objects/UserId'

/**
 * NotificationService
 * Gestiona la lógica de tiempo real y suscripciones de notificaciones.
 */
export class NotificationService {
  /**
   * Se suscribe a notificaciones en tiempo real para un usuario.
   */
  subscribeToNotifications(userId: string, onUpdate: (count: number) => void): () => void {
    const repository = container.get<INotificationRepository>('INotificationRepository')

    // Asumiendo que el repositorio tiene un método para escuchar cambios (onSnapshot en Firebase)
    // En este diseño, el repositorio es el que conoce el detalle de implementación.
    // Si no existe, simulamos un retorno vacío de limpieza.
    if ((repository as any).listenUnreadCount) {
      return (repository as any).listenUnreadCount(UserId.reconstitute(userId), onUpdate)
    }

    return () => {}
  }
}

export const notificationService = new NotificationService()
