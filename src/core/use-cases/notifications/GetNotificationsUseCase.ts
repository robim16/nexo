/**
 * GetNotificationsUseCase — Retorna las notificaciones para un usuario.
 */
import { INotificationRepository } from '../../ports/repositories/INotificationRepository'
import { Notification } from '../../entities/Notification'
import { UserId } from '../../value-objects/UserId'
import { NotificationId } from '../../value-objects/NotificationId'

export interface GetNotificationsDTO {
  userId: string
  limit?: number
  lastNotificationId?: string
}

export interface GetNotificationsResult {
  notifications: Notification[]
  unreadCount: number
  hasMore: boolean
}

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  async execute(dto: GetNotificationsDTO): Promise<GetNotificationsResult> {
    const userId = UserId.fromString(dto.userId)
    const limit = dto.limit ?? 20
    const lastId = dto.lastNotificationId ? NotificationId.fromString(dto.lastNotificationId) : undefined

    // Carga paralela de notificaciones y count
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.findByRecipient(userId, { limit: limit + 1, lastId }),
      this.notificationRepository.getUnreadCount(userId)
    ])

    const hasMore = notifications.length > limit
    const result = hasMore ? notifications.slice(0, limit) : notifications

    return { notifications: result, unreadCount, hasMore }
  }
}
