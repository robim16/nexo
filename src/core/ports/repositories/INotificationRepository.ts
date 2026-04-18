/**
 * INotificationRepository — Contrato de acceso a datos de notificaciones.
 * Implementado por FirebaseNotificationRepository en infraestructura.
 */
import { Notification } from '../../entities/Notification'
import { NotificationId } from '../../value-objects/NotificationId'
import { UserId } from '../../value-objects/UserId'

export type Unsubscribe = () => void

export interface INotificationRepository {
  /** Persiste una nueva notificación */
  save(notification: Notification): Promise<void>

  /** Busca una notificación por ID */
  findById(id: NotificationId): Promise<Notification | null>

  /**
   * Obtiene las notificaciones de un usuario, ordenadas por fecha desc.
   * Soporta paginación via cursor.
   */
  findByRecipient(
    recipientId: UserId,
    options?: { limit?: number; lastId?: NotificationId }
  ): Promise<Notification[]>

  /** Marca una notificación como leída */
  markAsRead(id: NotificationId): Promise<void>

  /** Marca todas las notificaciones de un usuario como leídas */
  markAllAsRead(recipientId: UserId): Promise<void>

  /** Retorna el número de notificaciones no leídas de un usuario */
  getUnreadCount(recipientId: UserId): Promise<number>

  /** Elimina una notificación */
  delete(id: NotificationId): Promise<void>

  /**
   * Suscripción en tiempo real a las notificaciones de un usuario.
   */
  subscribeToRecipient(
    recipientId: UserId,
    callback: (notifications: Notification[]) => void
  ): Unsubscribe
}
