/**
 * Value Object: PostVisibility
 * Define quién puede ver una publicación, con lógica de permisos encapsulada.
 */
export type VisibilityLevel = 'public' | 'followers' | 'private'

export class PostVisibility {
  private static readonly VALID_LEVELS: VisibilityLevel[] = ['public', 'followers', 'private']

  private constructor(public readonly value: VisibilityLevel) {}

  static create(level: string): PostVisibility {
    const normalizedLevel = level.toLowerCase() as VisibilityLevel
    if (!PostVisibility.VALID_LEVELS.includes(normalizedLevel)) {
      throw new Error(
        `Visibilidad inválida: "${level}". Debe ser: ${PostVisibility.VALID_LEVELS.join(' | ')}`
      )
    }
    return new PostVisibility(normalizedLevel)
  }

  /** Visibilidad pública — todos pueden ver */
  static public(): PostVisibility {
    return new PostVisibility('public')
  }

  /** Solo seguidores pueden ver */
  static followers(): PostVisibility {
    return new PostVisibility('followers')
  }

  /** Solo el autor puede ver */
  static private(): PostVisibility {
    return new PostVisibility('private')
  }

  /** Reconstitución desde persistencia */
  static reconstitute(value: string): PostVisibility {
    return PostVisibility.create(value)
  }

  /**
   * Determina si un usuario puede ver el post dado su relación con el autor.
   * @param viewerId - ID del usuario que intenta ver el post
   * @param authorId - ID del autor del post
   * @param isFollowing - Si viewerId sigue al autor
   */
  canBeViewedBy(viewerId: string, authorId: string, isFollowing: boolean): boolean {
    if (viewerId === authorId) return true

    switch (this.value) {
      case 'public':
        return true
      case 'followers':
        return isFollowing
      case 'private':
        return false
    }
  }

  isPublic(): boolean {
    return this.value === 'public'
  }

  isFollowersOnly(): boolean {
    return this.value === 'followers'
  }

  isPrivate(): boolean {
    return this.value === 'private'
  }

  equals(other: PostVisibility): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
