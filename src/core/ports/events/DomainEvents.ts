/**
 * DomainEvents — Constantes de tipos de eventos de dominio.
 * Centraliza todos los string types para evitar errores tipográficos.
 * Importar estas constantes en lugar de strings literales.
 */

export const DomainEvents = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  USER_REGISTERED: 'USER_REGISTERED',
  USER_LOGGED_IN: 'USER_LOGGED_IN',
  USER_LOGGED_OUT: 'USER_LOGGED_OUT',
  USER_VERIFIED: 'USER_VERIFIED',

  // ─── Perfil ────────────────────────────────────────────────────────────────
  USER_PROFILE_UPDATED: 'USER_PROFILE_UPDATED',
  USER_AVATAR_UPDATED: 'USER_AVATAR_UPDATED',
  USER_DEACTIVATED: 'USER_DEACTIVATED',

  // ─── Posts ─────────────────────────────────────────────────────────────────
  POST_CREATED: 'POST_CREATED',
  POST_EDITED: 'POST_EDITED',
  POST_DELETED: 'POST_DELETED',
  POST_LIKED: 'POST_LIKED',
  POST_UNLIKED: 'POST_UNLIKED',
  POST_SHARED: 'POST_SHARED',
  POST_VISIBILITY_CHANGED: 'POST_VISIBILITY_CHANGED',

  // ─── Comentarios ───────────────────────────────────────────────────────────
  COMMENT_CREATED: 'COMMENT_CREATED',
  COMMENT_EDITED: 'COMMENT_EDITED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  COMMENT_LIKED: 'COMMENT_LIKED',

  // ─── Social ────────────────────────────────────────────────────────────────
  USER_FOLLOWED: 'USER_FOLLOWED',
  USER_UNFOLLOWED: 'USER_UNFOLLOWED',

  // ─── Notificaciones ────────────────────────────────────────────────────────
  NOTIFICATION_CREATED: 'NOTIFICATION_CREATED',
  NOTIFICATION_READ: 'NOTIFICATION_READ',
  ALL_NOTIFICATIONS_READ: 'ALL_NOTIFICATIONS_READ',
} as const

export type DomainEventType = typeof DomainEvents[keyof typeof DomainEvents]

// ─── Payloads tipados para cada evento ─────────────────────────────────────

export interface UserRegisteredPayload {
  userId: string
  email: string
  displayName: string
}

export interface PostCreatedPayload {
  postId: string
  authorId: string
  hasImages: boolean
  mentionedUsers: string[]
  hashtags: string[]
}

export interface PostLikedPayload {
  postId: string
  authorId: string
  userId: string
}

export interface UserFollowedPayload {
  followerId: string
  followingId: string
}

export interface NotificationCreatedPayload {
  notificationId: string
  recipientId: string
  type: string
}
