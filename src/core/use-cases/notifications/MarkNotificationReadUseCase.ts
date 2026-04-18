/**
 * MarkNotificationReadUseCase — Marca una o todas las notificaciones como leídas.
 */
import { INotificationRepository } from '../../ports/repositories/INotificationRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'
import { UserId } from '../../value-objects/UserId'
import { NotificationId } from '../../value-objects/NotificationId'

export interface MarkNotificationReadDTO {
  userId: string
  notificationId?: string // Si no se provee, marca todas como leídas
}

export class MarkNotificationReadUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: MarkNotificationReadDTO): Promise<void> {
    const userId = UserId.fromString(dto.userId)

    if (dto.notificationId) {
      // Marcar una sola
      const notificationId = NotificationId.fromString(dto.notificationId)
      // Primero verificar pertinencia
      const notif = await this.notificationRepository.findById(notificationId)
      if (notif && notif.belongsTo(userId) && !notif.isRead) {
         await this.notificationRepository.markAsRead(notificationId)
         this.eventBus.publish({
            type: DomainEvents.NOTIFICATION_READ,
            timestamp: new Date(),
            payload: { notificationId: dto.notificationId }
         })
      }
    } else {
      // Marcar todas
      await this.notificationRepository.markAllAsRead(userId)
      this.eventBus.publish({
         type: DomainEvents.ALL_NOTIFICATIONS_READ,
         timestamp: new Date(),
         payload: { userId: dto.userId }
      })
    }
  }
}
