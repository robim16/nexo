/**
 * Value Object: DisplayName
 * Nombre visible del usuario. Validación de longitud y caracteres permitidos.
 */
export class DisplayName {
  static readonly MIN_LENGTH = 2
  static readonly MAX_LENGTH = 50

  // Permite letras (incluyendo acentos), números, espacios, guiones y puntos
  private static readonly VALID_CHARS_REGEX = /^[a-zA-ZÀ-ÿ0-9\s._'-]+$/

  private constructor(public readonly value: string) {}

  static create(rawName: string): DisplayName {
    if (!rawName || rawName.trim().length === 0) {
      throw new Error('El nombre de usuario no puede estar vacío')
    }

    const sanitized = rawName.trim().replace(/\s+/g, ' ')

    if (sanitized.length < DisplayName.MIN_LENGTH) {
      throw new Error(
        `El nombre debe tener al menos ${DisplayName.MIN_LENGTH} caracteres`
      )
    }

    if (sanitized.length > DisplayName.MAX_LENGTH) {
      throw new Error(
        `El nombre no puede superar ${DisplayName.MAX_LENGTH} caracteres`
      )
    }

    if (!DisplayName.VALID_CHARS_REGEX.test(sanitized)) {
      throw new Error(
        'El nombre solo puede contener letras, números, espacios, guiones y puntos'
      )
    }

    return new DisplayName(sanitized)
  }

  static reconstitute(value: string): DisplayName {
    return new DisplayName(value)
  }

  /** Versión abreviada para espacios pequeños (ej: "John D.") */
  get abbreviated(): string {
    const parts = this.value.split(' ')
    if (parts.length === 1) return this.value
    return `${parts[0]} ${parts[1][0]}.`
  }

  /** Iniciales para avatares (ej: "JD") */
  get initials(): string {
    return this.value
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }

  equals(other: DisplayName): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
