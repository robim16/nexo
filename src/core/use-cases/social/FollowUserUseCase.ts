/**
 * FollowUserUseCase — Caso de uso para empezar a seguir a un usuario.
 * Persiste la relación de seguimiento, actualiza contadores y genera notificación.
 */
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { INotificationRepository } from '../../ports/repositories/INotificationRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents, UserFollowedPayload } from '../../ports/events/DomainEvents'
import { Follow } from '../../entities/Follow'
import { Notification } from '../../entities/Notification'
import { UserId } from '../../value-objects/UserId'
import { SocialDomainError } from '../../errors/SocialDomainError'

export interface FollowUserDTO {
  followerId: string
  followingId: string
}

export class FollowUserUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: FollowUserDTO): Promise<void> {
    const followerId = UserId.fromString(dto.followerId)
    const followingId = UserId.fromString(dto.followingId)

    // 1. Validar que el usuario objetivo exista
    const followingUser = await this.userRepository.findById(followingId)
    if (!followingUser) {
      throw SocialDomainError.userNotFound(dto.followingId)
    }

    // 2. Verificar si ya lo sigue
    const isAlreadyFollowing = await this.followRepository.isFollowing(followerId, followingId)
    if (isAlreadyFollowing) {
      throw SocialDomainError.alreadyFollowing(followingUser.displayName.value)
    }

    // 3. Crear Entidad Follow (validará auto-seguimiento internamente)
    const follow = Follow.create(followerId, followingId)

    // 4. Persistir relación
    await this.followRepository.save(follow)

    // 5. Actualizar contadores atomicamente
    // Incrementa seguimientos para el current user
    await this.userRepository.updateCounters(followerId, { followingCount: 1 })
    // Incrementa seguidores para el usuario objetivo
    await this.userRepository.updateCounters(followingId, { followersCount: 1 })

    // 6. Generar Notificación para el usuario objetivo
    const notification = Notification.create({
      recipientId: followingId,
      actorId: followerId,
      type: 'FOLLOW',
    })
    await this.notificationRepository.save(notification)

    // 7. Publicar evento
    const payload: UserFollowedPayload = { followerId: dto.followerId, followingId: dto.followingId }
    this.eventBus.publish({
      type: DomainEvents.USER_FOLLOWED,
      timestamp: new Date(),
      payload,
    })
  }
}
