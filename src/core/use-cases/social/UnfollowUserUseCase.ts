/**
 * UnfollowUserUseCase — Caso de uso para dejar de seguir a un usuario.
 * Elimina la relación de seguimiento y actualiza contadores.
 */
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'
import { UserId } from '../../value-objects/UserId'
import { SocialDomainError } from '../../errors/SocialDomainError'

export interface UnfollowUserDTO {
  followerId: string
  followingId: string
}

export class UnfollowUserUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: UnfollowUserDTO): Promise<void> {
    const followerId = UserId.fromString(dto.followerId)
    const followingId = UserId.fromString(dto.followingId)

    // 1. Verificar si realmente lo sigue
    const isFollowing = await this.followRepository.isFollowing(followerId, followingId)
    if (!isFollowing) {
      const followingUser = await this.userRepository.findById(followingId)
      throw SocialDomainError.notFollowing(followingUser?.displayName.value)
    }

    // 2. Eliminar relación
    await this.followRepository.deleteByUsers(followerId, followingId)

    // 3. Actualizar contadores
    await this.userRepository.updateCounters(followerId, { followingCount: -1 })
    await this.userRepository.updateCounters(followingId, { followersCount: -1 })

    // 4. Publicar evento de dominio
    this.eventBus.publish({
      type: DomainEvents.USER_UNFOLLOWED,
      timestamp: new Date(),
      payload: { followerId: dto.followerId, followingId: dto.followingId },
    })
  }
}
