/**
 * Value Object: Bio
 * Descripción/biografía del perfil de usuario.
 * Puede estar vacía pero no exceder 500 caracteres.
 */
export class Bio {
  static readonly MAX_LENGTH = 500

  private constructor(public readonly value: string) {}

  static create(rawBio: string = ''): Bio {
    const trimmed = rawBio.trim()

    if (trimmed.length > Bio.MAX_LENGTH) {
      throw new Error(
        `La biografía no puede superar ${Bio.MAX_LENGTH} caracteres ` +
          `(actual: ${trimmed.length})`
      )
    }

    return new Bio(trimmed)
  }

  /** Crea una bio vacía */
  static empty(): Bio {
    return new Bio('')
  }

  static reconstitute(value: string): Bio {
    return new Bio(value)
  }

  get isEmpty(): boolean {
    return this.value.length === 0
  }

  get remainingChars(): number {
    return Bio.MAX_LENGTH - this.value.length
  }

  /** Vista previa truncada para cards de perfil */
  preview(maxChars: number = 100): string {
    if (this.value.length <= maxChars) return this.value
    return this.value.slice(0, maxChars).trimEnd() + '…'
  }

  equals(other: Bio): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
