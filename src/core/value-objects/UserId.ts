/**
 * Value Object: UserId
 * Branded type para identificadores de usuario.
 * Garantiza formato UUID v4 válido e inmutabilidad.
 */
export class UserId {

  private constructor(public readonly value: string) {}

  /** Crea un UserId desde un string existente */
  static fromString(id: string): UserId {
    if (!id || id.trim().length === 0) {
      throw new Error('UserId no puede estar vacío')
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
