/**
 * Value Object: FollowId
 * Identificador de la relación de seguimiento entre dos usuarios.
 * Convención: "{followerId}_{followingId}" como clave compuesta.
 */
export class FollowId {
  private constructor(public readonly value: string) {}

  /** Crea FollowId a partir de ID compuesto follower_following */
  static fromString(id: string): FollowId {
    if (!id || id.trim().length === 0) {
      throw new Error('FollowId no puede estar vacío')
    }
    return new FollowId(id)
  }

  /** Genera un FollowId compuesto desde los IDs de los dos usuarios */
  static fromUserIds(followerId: string, followingId: string): FollowId {
    if (!followerId || !followingId) {
      throw new Error('FollowId requiere followerId y followingId válidos')
    }
    return new FollowId(`${followerId}_${followingId}`)
  }

  /** Genera un FollowId con UUID (para Firestore doc ID independiente) */
  static generate(): FollowId {
    return new FollowId(FollowId.createUUID())
  }

  static reconstitute(id: string): FollowId {
    if (!id || id.trim().length === 0) {
      throw new Error('FollowId no puede estar vacío al reconstituir')
    }
    return new FollowId(id)
  }

  equals(other: FollowId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  private static createUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
