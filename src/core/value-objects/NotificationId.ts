/**
 * Value Object: NotificationId
 * Identificador inmutable de notificación.
 */
export class NotificationId {
  private constructor(public readonly value: string) {}

  static fromString(id: string): NotificationId {
    if (!id || id.trim().length === 0) {
      throw new Error('NotificationId no puede estar vacío')
    }
    return new NotificationId(id)
  }

  static generate(): NotificationId {
    return new NotificationId(NotificationId.createUUID())
  }

  static reconstitute(id: string): NotificationId {
    if (!id || id.trim().length === 0) {
      throw new Error('NotificationId no puede estar vacío al reconstituir')
    }
    return new NotificationId(id)
  }

  equals(other: NotificationId): boolean {
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
