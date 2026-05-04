/**
 * GetFollowingUseCase — Retorna la lista de usuarios que un usuario dado sigue.
 */
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { User } from '../../entities/User'
import { UserId } from '../../value-objects/UserId'

export interface GetFollowingDTO {
  userId: string
  limit?: number
}

export class GetFollowingUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GetFollowingDTO): Promise<User[]> {
    const userId = UserId.fromString(dto.userId)

    // 1. Obtener las relaciones Follow donde el usuario es el seguidor
    const follows = await this.followRepository.findFollowing(userId, dto.limit)
    if (follows.length === 0) return []

    // 2. Extraer los IDs de los usuarios seguidos
    const followingIds = follows.map((f) => f.followingId)

    // 3. Buscar los perfiles de los usuarios (batch read)
    return this.userRepository.findManyByIds(followingIds)
  }
}
