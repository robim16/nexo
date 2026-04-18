/**
 * Value Object: PostId
 * Identificador inmutable y tipado para publicaciones.
 */
export class PostId {
  private constructor(public readonly value: string) {}

  static fromString(id: string): PostId {
    if (!id || id.trim().length === 0) {
      throw new Error('PostId no puede estar vacío')
    }
    return new PostId(id)
  }

  static generate(): PostId {
    return new PostId(PostId.createUUID())
  }

  static reconstitute(id: string): PostId {
    if (!id || id.trim().length === 0) {
      throw new Error('PostId no puede estar vacío al reconstituir')
    }
    return new PostId(id)
  }

  equals(other: PostId): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  private static createUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }
}
