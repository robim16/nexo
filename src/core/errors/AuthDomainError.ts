/**
 * AuthDomainError — Errores de lógica de negocio relacionados con autenticación.
 */
import { DomainError } from './DomainError'

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_ALREADY_EXISTS'
  | 'USER_NOT_FOUND'
  | 'ACCOUNT_DISABLED'
  | 'EMAIL_NOT_VERIFIED'
  | 'WEAK_PASSWORD'
  | 'SESSION_EXPIRED'
  | 'UNAUTHORIZED'

export class AuthDomainError extends DomainError {
  readonly domain = 'AUTH'

  constructor(
    public readonly code: AuthErrorCode,
    message: string
  ) {
    super(message)
  }

  // --- Factories semánticas ---

  static invalidCredentials(): AuthDomainError {
    return new AuthDomainError(
      'INVALID_CREDENTIALS',
      'Email o contraseña incorrectos'
    )
  }

  static emailAlreadyExists(email: string): AuthDomainError {
    return new AuthDomainError(
      'EMAIL_ALREADY_EXISTS',
      `El email "${email}" ya está registrado`
    )
  }

  static userNotFound(email: string): AuthDomainError {
    return new AuthDomainError(
      'USER_NOT_FOUND',
      `No existe ningún usuario con el email "${email}"`
    )
  }

  static accountDisabled(): AuthDomainError {
    return new AuthDomainError(
      'ACCOUNT_DISABLED',
      'Tu cuenta ha sido deshabilitada. Contacta al soporte.'
    )
  }

  static emailNotVerified(): AuthDomainError {
    return new AuthDomainError(
      'EMAIL_NOT_VERIFIED',
      'Debes verificar tu email antes de continuar'
    )
  }

  static weakPassword(): AuthDomainError {
    return new AuthDomainError(
      'WEAK_PASSWORD',
      'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número'
    )
  }

  static sessionExpired(): AuthDomainError {
    return new AuthDomainError(
      'SESSION_EXPIRED',
      'Tu sesión ha expirado. Inicia sesión nuevamente.'
    )
  }

  static unauthorized(): AuthDomainError {
    return new AuthDomainError(
      'UNAUTHORIZED',
      'No tienes permisos para realizar esta acción'
    )
  }
}
