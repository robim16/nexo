/**
 * Value Object: CommentId
 * Identificador inmutable de comentario.
 */
export class CommentId {
  private constructor(public readonly value: string) {}

  static fromString(id: string): CommentId {
    if (!id || id.trim().length === 0) {
      throw new Error('CommentId no puede estar vacío')
    }
    return new CommentId(id)
  }

  static generate(): CommentId {
    return new CommentId(CommentId.createUUID())
  }

  static reconstitute(id: string): CommentId {
    if (!id || id.trim().length === 0) {
      throw new Error('CommentId no puede estar vacío al reconstituir')
    }
    return new CommentId(id)
  }

  equals(other: CommentId): boolean {
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
