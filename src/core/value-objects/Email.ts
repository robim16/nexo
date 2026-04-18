/**
 * Value Object: Email
 * Encapsula validación de formato de correo electrónico.
 * Normaliza a minúsculas y elimina espacios en blanco.
 * Inmutable por diseño (constructor privado).
 */
export class Email {
  // RFC 5322 simplificado — cubre casos comunes robustamente
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

  private static readonly MAX_LENGTH = 254 // RFC 5321

  private constructor(public readonly value: string) {}

  /**
   * Crea y valida un nuevo Email.
   * @throws Error si el formato es inválido o la longitud excede el límite.
   */
  static create(rawEmail: string): Email {
    if (!rawEmail || rawEmail.trim().length === 0) {
      throw new Error('El email no puede estar vacío')
    }

    const normalized = rawEmail.toLowerCase().trim()

    if (normalized.length > Email.MAX_LENGTH) {
      throw new Error(`El email excede la longitud máxima de ${Email.MAX_LENGTH} caracteres`)
    }

    if (!Email.EMAIL_REGEX.test(normalized)) {
      throw new Error(`El email "${normalized}" no tiene un formato válido`)
    }

    return new Email(normalized)
  }

  /** Reconstitución desde persistencia (sin re-validar, confía en datos guardados) */
  static reconstitute(value: string): Email {
    return new Email(value)
  }

  /** Obtiene el dominio del email (ej: "gmail.com") */
  get domain(): string {
    return this.value.split('@')[1]
  }

  /** Obtiene la parte local del email (ej: "usuario") */
  get localPart(): string {
    return this.value.split('@')[0]
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
