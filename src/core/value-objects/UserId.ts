/**
 * Value Object: UserId
 * Branded type para identificadores de usuario.
 * Garantiza formato UUID v4 válido e inmutabilidad.
 */
export class UserId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

  private constructor(public readonly value: string) {}

  /** Crea un UserId desde un string existente, validando el formato UUID */
  static fromString(id: string): UserId {
    if (!id || id.trim().length === 0) {
      throw new Error('UserId no puede estar vacío')
    }
    if (!UserId.UUID_REGEX.test(id)) {
      throw new Error(`UserId inválido: "${id}" no es un UUID v4 válido`)
    }
    return new UserId(id)
  }

  /** Genera un nuevo UserId con UUID v4 aleatorio */
  static generate(): UserId {
    const uuid = UserId.createUUID()
    return new UserId(uuid)
  }

  /** Factory que acepta formato UUID o string arbitrario (para reconstitución desde DB) */
  static reconstitute(id: string): UserId {
    if (!id || id.trim().length === 0) {
      throw new Error('UserId no puede estar vacío al reconstituir')
    }
    return new UserId(id)
  }

  equals(other: UserId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  private static createUUID(): string {
    // Implementación RFC 4122 v4 sin dependencias externas
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
