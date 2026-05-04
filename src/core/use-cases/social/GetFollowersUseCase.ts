/**
 * GetFollowersUseCase — Retorna la lista de usuarios que siguen a uno dado.
 */
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { User } from '../../entities/User'
import { UserId } from '../../value-objects/UserId'

export interface GetFollowersDTO {
  userId: string
  limit?: number
}

export class GetFollowersUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GetFollowersDTO): Promise<User[]> {
    const userId = UserId.fromString(dto.userId)

    // 1. Obtener las relaciones Follow
    const follows = await this.followRepository.findFollowers(userId, dto.limit)
    if (follows.length === 0) return []

    // 2. Extraer los IDs de los seguidores
    const followerIds = follows.map((f) => f.followerId)

    // 3. Buscar los perfiles de los usuarios (batch read)
    return this.userRepository.findManyByIds(followerIds)
  }
}
