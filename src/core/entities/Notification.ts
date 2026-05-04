/**
 * Entidad Rica: Notification
 * Notificación generada por eventos de la red social (likes, follows, menciones, comentarios).
 */
import { NotificationId } from '../value-objects/NotificationId'
import { UserId } from '../value-objects/UserId'
import { PostId } from '../value-objects/PostId'
import { Timestamp } from '../value-objects/Timestamp'

/** Tipos de evento que generan notificaciones */
export type NotificationType =
  | 'FOLLOW'
  | 'LIKE'
  | 'COMMENT'
  | 'MENTION'
  | 'SHARE'
  | 'REACTION_FOLLOWED'

export interface NotificationPlainObject {
  id: string
  recipientId: string
  actorId: string
  type: NotificationType
  postId: string | null
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface CreateNotificationData {
  recipientId: UserId
  actorId: UserId
  type: NotificationType
  postId?: PostId | null
}

export interface ReconstituteNotificationData {
  id: string
  recipientId: string
  actorId: string
  type: NotificationType
  postId: string | null
  message: string
  isRead: boolean
  createdAt: Date | string
  readAt: Date | string | null
}

export class Notification {
  private constructor(
    public readonly id: NotificationId,
    public readonly recipientId: UserId,
    public readonly actorId: UserId,
    public readonly type: NotificationType,
    public readonly postId: PostId | null,
    private _message: string,
    private _isRead: boolean,
    public readonly createdAt: Timestamp,
    private _readAt: Timestamp | null
  ) {}

  // ─── Getters ──────────────────────────────────────────────────────────────

  get message(): string {
    return this._message
  }
  get isRead(): boolean {
    return this._isRead
  }
  get readAt(): Timestamp | null {
    return this._readAt
  }

  // ─── Comportamiento de Negocio ────────────────────────────────────────────

  /** Marca la notificación como leída */
  markAsRead(): void {
    if (this._isRead) return // Idempotente
    this._isRead = true
    this._readAt = Timestamp.now()
  }

  /** Verifica si esta notificación pertenece al usuario dato */
  belongsTo(userId: UserId): boolean {
    return this.recipientId.equals(userId)
  }

  /** Indica si fue enviada por el actor dado */
  isFrom(userId: UserId): boolean {
    return this.actorId.equals(userId)
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  static create(data: CreateNotificationData): Notification {
    const message = Notification.buildMessage(data.type)
    return new Notification(
      NotificationId.generate(),
      data.recipientId,
      data.actorId,
      data.type,
      data.postId ?? null,
      message,
      false,
      Timestamp.now(),
      null
    )
  }

  static reconstitute(data: ReconstituteNotificationData): Notification {
    return new Notification(
      NotificationId.reconstitute(data.id),
      UserId.reconstitute(data.recipientId),
      UserId.reconstitute(data.actorId),
      data.type,
      data.postId ? PostId.reconstitute(data.postId) : null,
      data.message,
      data.isRead,
      Timestamp.reconstitute(data.createdAt),
      data.readAt ? Timestamp.reconstitute(data.readAt) : null
    )
  }

  // ─── Serialización ────────────────────────────────────────────────────────

  toPlainObject(): NotificationPlainObject {
    return {
      id: this.id.value,
      recipientId: this.recipientId.value,
      actorId: this.actorId.value,
      type: this.type,
      postId: this.postId?.value ?? null,
      message: this._message,
      isRead: this._isRead,
      createdAt: this.createdAt.toISO(),
      readAt: this._readAt?.toISO() ?? null
    }
  }

  // ─── Helpers Privados ─────────────────────────────────────────────────────

  private static buildMessage(type: NotificationType): string {
    const messages: Record<NotificationType, string> = {
      FOLLOW: 'empezó a seguirte',
      LIKE: 'le dio like a tu publicación',
      COMMENT: 'comentó en tu publicación',
      MENTION: 'te mencionó en una publicación',
      SHARE: 'compartió tu publicación',
      REACTION_FOLLOWED: 'reaccionó a una publicación'
    }
    return messages[type]
  }
}
