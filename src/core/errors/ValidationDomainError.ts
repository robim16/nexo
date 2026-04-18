/**
 * ValidationDomainError — Error de validación de datos de entrada.
 * Incluye el campo y el valor que causó el error.
 */
import { DomainError } from './DomainError'

export class ValidationDomainError extends DomainError {
  readonly code = 'VALIDATION_ERROR'
  readonly domain = 'VALIDATION'

  constructor(
    message: string,
    /** Campo que falló la validación */
    public readonly field: string,
    /** Valor que se intentó asignar */
    public readonly invalidValue: unknown
  ) {
    super(message)
  }

  toJSON(): object {
    return {
      ...super.toJSON(),
      field: this.field,
      invalidValue: this.invalidValue,
    }
  }

  // --- Factories semánticas ---

  static required(field: string): ValidationDomainError {
    return new ValidationDomainError(
      `El campo "${field}" es obligatorio`,
      field,
      null
    )
  }

  static tooShort(field: string, min: number, value: string): ValidationDomainError {
    return new ValidationDomainError(
      `El campo "${field}" debe tener al menos ${min} caracteres (actual: ${value.length})`,
      field,
      value
    )
  }

  static tooLong(field: string, max: number, value: string): ValidationDomainError {
    return new ValidationDomainError(
      `El campo "${field}" no puede superar ${max} caracteres (actual: ${value.length})`,
      field,
      value
    )
  }

  static invalidFormat(field: string, value: unknown, expected: string): ValidationDomainError {
    return new ValidationDomainError(
      `El campo "${field}" tiene un formato inválido. Se espera: ${expected}`,
      field,
      value
    )
  }

  static outOfRange(field: string, value: number, min: number, max: number): ValidationDomainError {
    return new ValidationDomainError(
      `El campo "${field}" debe estar entre ${min} y ${max} (actual: ${value})`,
      field,
      value
    )
  }
}
