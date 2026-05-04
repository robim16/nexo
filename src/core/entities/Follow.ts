/**
 * Entidad: Follow
 * Representa la relación de seguimiento entre dos usuarios.
 * Entidad simple (sin comportamiento mutable post-creación).
 */
import { FollowId } from '../value-objects/FollowId'
import { UserId } from '../value-objects/UserId'
import { Timestamp } from '../value-objects/Timestamp'
import { SocialDomainError } from '../errors/SocialDomainError'

export interface FollowPlainObject {
  id: string
  followerId: string
  followingId: string
  createdAt: string
}

export interface ReconstituteFollowData {
  id: string
  followerId: string
  followingId: string
  createdAt: Date | string
}

export class Follow {
  private constructor(
    public readonly id: FollowId,
    public readonly followerId: UserId,
    public readonly followingId: UserId,
    public readonly createdAt: Timestamp
  ) {}

  // ─── Reglas de Negocio ────────────────────────────────────────────────────

  /** Verifica si el seguidor y el seguido son la misma persona */
  isSelfFollow(): boolean {
    return this.followerId.equals(this.followingId)
  }

  /** Verifica si este Follow conecta a dos usuarios dados */
  connects(userId1: UserId, userId2: UserId): boolean {
    return (
      (this.followerId.equals(userId1) && this.followingId.equals(userId2)) ||
      (this.followerId.equals(userId2) && this.followingId.equals(userId1))
    )
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  /**
   * Crea una nueva relación de seguimiento.
   * Regla de negocio: un usuario no puede seguirse a sí mismo.
   */
  static create(followerId: UserId, followingId: UserId): Follow {
    if (followerId.equals(followingId)) {
      throw SocialDomainError.cannotFollowSelf()
    }
    return new Follow(
      FollowId.fromUserIds(followerId.value, followingId.value),
      followerId,
      followingId,
      Timestamp.now()
    )
  }

  static reconstitute(data: ReconstituteFollowData): Follow {
    return new Follow(
      FollowId.reconstitute(data.id),
      UserId.reconstitute(data.followerId),
      UserId.reconstitute(data.followingId),
      Timestamp.reconstitute(data.createdAt)
    )
  }

  // ─── Serialización ────────────────────────────────────────────────────────

  toPlainObject(): FollowPlainObject {
    return {
      id: this.id.value,
      followerId: this.followerId.value,
      followingId: this.followingId.value,
      createdAt: this.createdAt.toISO()
    }
  }
}
