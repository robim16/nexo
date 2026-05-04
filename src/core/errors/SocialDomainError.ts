/**
 * SocialDomainError — Errores de lógica de negocio relacionados con relaciones sociales.
 */
import { DomainError } from './DomainError'

export type SocialErrorCode =
  | 'ALREADY_FOLLOWING'
  | 'NOT_FOLLOWING'
  | 'CANNOT_FOLLOW_SELF'
  | 'USER_NOT_FOUND'
  | 'FOLLOW_LIMIT_REACHED'
  | 'ACCOUNT_PRIVATE'

export class SocialDomainError extends DomainError {
  readonly domain = 'SOCIAL'

  constructor(
    public readonly code: SocialErrorCode,
    message: string
  ) {
    super(message)
  }

  // --- Factories semánticas ---

  static alreadyFollowing(targetDisplayName?: string): SocialDomainError {
    return new SocialDomainError(
      'ALREADY_FOLLOWING',
      targetDisplayName ? `Ya sigues a ${targetDisplayName}` : 'Ya sigues a este usuario'
    )
  }

  static notFollowing(targetDisplayName?: string): SocialDomainError {
    return new SocialDomainError(
      'NOT_FOLLOWING',
      targetDisplayName ? `No sigues a ${targetDisplayName}` : 'No sigues a este usuario'
    )
  }

  static cannotFollowSelf(): SocialDomainError {
    return new SocialDomainError('CANNOT_FOLLOW_SELF', 'No puedes seguirte a ti mismo')
  }

  static userNotFound(userId: string): SocialDomainError {
    return new SocialDomainError('USER_NOT_FOUND', `No se encontró el usuario con ID "${userId}"`)
  }

  static followLimitReached(limit: number): SocialDomainError {
    return new SocialDomainError(
      'FOLLOW_LIMIT_REACHED',
      `Has alcanzado el límite de ${limit} usuarios que puedes seguir`
    )
  }

  static accountPrivate(): SocialDomainError {
    return new SocialDomainError(
      'ACCOUNT_PRIVATE',
      'Esta cuenta es privada. Envía una solicitud de seguimiento.'
    )
  }
}
