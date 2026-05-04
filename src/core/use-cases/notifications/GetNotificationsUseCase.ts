import { INotificationRepository } from '../../ports/repositories/INotificationRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { Notification } from '../../entities/Notification'
import { UserId } from '../../value-objects/UserId'
import { NotificationId } from '../../value-objects/NotificationId'

export interface GetNotificationsDTO {
  userId: string
  limit?: number
  lastNotificationId?: string
}

export interface EnrichedNotification {
  notification: Notification
  actor: {
    displayName: string
    avatarUrl: string | null
  }
}

export interface GetNotificationsResult {
  notifications: EnrichedNotification[]
  unreadCount: number
  hasMore: boolean
}

export class GetNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GetNotificationsDTO): Promise<GetNotificationsResult> {
    const userId = UserId.fromString(dto.userId)
    const limit = dto.limit ?? 20
    const lastId = dto.lastNotificationId
      ? NotificationId.fromString(dto.lastNotificationId)
      : undefined

    // Carga paralela de notificaciones y count
    const [notifications, unreadCount] = await Promise.all([
      this.notificationRepository.findByRecipient(userId, { limit: limit + 1, lastId }),
      this.notificationRepository.getUnreadCount(userId)
    ])

    const hasMore = notifications.length > limit
    const rawNotifications = hasMore ? notifications.slice(0, limit) : notifications

    // Enriquecer con datos de actores (usuarios)
    if (rawNotifications.length === 0) {
      return { notifications: [], unreadCount, hasMore }
    }

    const actorIds = [...new Set(rawNotifications.map((n) => n.actorId.value))].map((id) =>
      UserId.reconstitute(id)
    )
    const actors = await this.userRepository.findManyByIds(actorIds)
    const actorMap = new Map(actors.map((u) => [u.id.value, u]))

    const enrichedNotifications: EnrichedNotification[] = rawNotifications.map((n) => {
      const actor = actorMap.get(n.actorId.value)
      return {
        notification: n,
        actor: {
          displayName: actor?.displayName.value ?? 'Usuario desconocido',
          avatarUrl: actor?.avatar ?? null
        }
      }
    })

    return { notifications: enrichedNotifications, unreadCount, hasMore }
  }
}
