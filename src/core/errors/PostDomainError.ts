/**
 * PostDomainError — Errores de lógica de negocio relacionados con publicaciones.
 */
import { DomainError } from './DomainError'

export type PostErrorCode =
  | 'POST_NOT_FOUND'
  | 'CONTENT_TOO_SHORT'
  | 'CONTENT_TOO_LONG'
  | 'UNAUTHORIZED_ACTION'
  | 'ALREADY_LIKED'
  | 'NOT_LIKED'
  | 'EDIT_WINDOW_EXPIRED'
  | 'TOO_MANY_IMAGES'
  | 'IMAGE_TOO_LARGE'

export class PostDomainError extends DomainError {
  readonly domain = 'POST'

  constructor(
    public readonly code: PostErrorCode,
    message: string
  ) {
    super(message)
  }

  // --- Factories semánticas ---

  static notFound(postId: string): PostDomainError {
    return new PostDomainError('POST_NOT_FOUND', `No se encontró la publicación con ID "${postId}"`)
  }

  static contentTooShort(minLength: number): PostDomainError {
    return new PostDomainError(
      'CONTENT_TOO_SHORT',
      `El contenido debe tener al menos ${minLength} carácter`
    )
  }

  static contentTooLong(maxLength: number, actual: number): PostDomainError {
    return new PostDomainError(
      'CONTENT_TOO_LONG',
      `El contenido supera el límite de ${maxLength} caracteres (actual: ${actual})`
    )
  }

  static unauthorizedAction(action: string): PostDomainError {
    return new PostDomainError(
      'UNAUTHORIZED_ACTION',
      `No tienes permiso para realizar la acción "${action}" en esta publicación`
    )
  }

  static alreadyLiked(): PostDomainError {
    return new PostDomainError('ALREADY_LIKED', 'Ya has dado like a esta publicación')
  }

  static notLiked(): PostDomainError {
    return new PostDomainError('NOT_LIKED', 'No has dado like a esta publicación')
  }

  static editWindowExpired(hours: number = 24): PostDomainError {
    return new PostDomainError(
      'EDIT_WINDOW_EXPIRED',
      `Las publicaciones solo pueden editarse dentro de las primeras ${hours} horas`
    )
  }

  static tooManyImages(max: number): PostDomainError {
    return new PostDomainError(
      'TOO_MANY_IMAGES',
      `Una publicación puede tener como máximo ${max} imágenes`
    )
  }

  static imageTooLarge(maxMB: number): PostDomainError {
    return new PostDomainError('IMAGE_TOO_LARGE', `Cada imagen no puede superar ${maxMB} MB`)
  }
}
