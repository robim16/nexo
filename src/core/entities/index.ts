// Entities — Barrel Export
// Entidades ricas del dominio Nexo

export { User } from './User'
export type { UserPlainObject, CreateUserData, ReconstituteUserData } from './User'

export { Post } from './Post'
export type { PostPlainObject, CreatePostData, ReconstitutePostData } from './Post'

export { Comment } from './Comment'
export type { CommentPlainObject, CreateCommentData, ReconstituteCommentData } from './Comment'

export { Follow } from './Follow'
export type { FollowPlainObject, ReconstituteFollowData } from './Follow'

export { Notification } from './Notification'
export type {
  NotificationType,
  NotificationPlainObject,
  CreateNotificationData,
  ReconstituteNotificationData,
} from './Notification'
