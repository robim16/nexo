/**
 * IFollowRepository — Contrato de acceso a datos de relaciones de seguimiento.
 * Implementado por FirebaseFollowRepository en infraestructura.
 */
import { Follow } from '../../entities/Follow'
import { FollowId } from '../../value-objects/FollowId'
import { UserId } from '../../value-objects/UserId'

export interface IFollowRepository {
  /** Persiste una nueva relación de seguimiento */
  save(follow: Follow): Promise<void>

  /** Elimina la relación de seguimiento por su ID */
  delete(id: FollowId): Promise<void>

  /** Elimina la relación follower → following (búsqueda por ambos IDs) */
  deleteByUsers(followerId: UserId, followingId: UserId): Promise<void>

  /**
   * Busca si existe una relación entre dos usuarios.
   * Retorna null si no existe.
   */
  findByFollowerAndFollowing(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null>

  /** Obtiene todos los seguidores de un usuario */
  findFollowers(userId: UserId, limit?: number): Promise<Follow[]>

  /** Obtiene todos los usuarios que sigue un usuario */
  findFollowing(userId: UserId, limit?: number): Promise<Follow[]>

  /**
   * Verifica si un usuario sigue a otro (más eficiente que findByFollowerAndFollowing).
   */
  isFollowing(followerId: UserId, followingId: UserId): Promise<boolean>

  /**
   * Retorna los IDs de todos los usuarios que sigue el usuario dado.
   * Útil para construir el feed.
   */
  getFollowingIds(userId: UserId): Promise<string[]>
}
