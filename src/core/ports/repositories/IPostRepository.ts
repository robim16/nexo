/**
 * IPostRepository — Contrato de acceso a datos de publicaciones.
 * Implementado por FirebasePostRepository en infraestructura.
 */
import { IBaseRepository } from './IBaseRepository'
import { Post } from '../../entities/Post'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'

/** Función para limpiar una suscripción en tiempo real */
export type Unsubscribe = () => void

export interface FeedOptions {
  limit?: number
  /** ID del último post cargado (cursor para paginación) */
  lastPostId?: PostId
}

export interface IPostRepository extends IBaseRepository<Post, PostId> {
  /** Obtiene los posts de un autor específico */
  findByAuthor(authorId: UserId, options?: FeedOptions): Promise<Post[]>

  /**
   * Obtiene el feed para un usuario basado en los IDs de los usuarios que sigue.
   * Paginación por cursor (lastPostId).
   */
  getFeed(userId: UserId, followingIds: string[], options?: FeedOptions): Promise<Post[]>

  /** Da like a un post (operación atómica en infraestructura) */
  like(postId: PostId, userId: UserId): Promise<void>

  /** Quita el like de un post (operación atómica) */
  unlike(postId: PostId, userId: UserId): Promise<void>

  /** Incrementa el contador de comentarios */
  incrementCommentsCount(postId: PostId): Promise<void>

  /** Decrementa el contador de comentarios */
  decrementCommentsCount(postId: PostId): Promise<void>

  /** Incrementa el contador de compartidos (shares) */
  incrementShareCount(postId: PostId): Promise<void>

  /**
   * Suscripción en tiempo real a un post individual.
   * Retorna una función para cancelar la suscripción.
   */
  subscribeToPost(postId: PostId, callback: (post: Post | null) => void): Unsubscribe

  /**
   * Suscripción en tiempo real al feed de un usuario.
   * Retorna una función para cancelar la suscripción.
   */
  subscribeToFeed(followingIds: string[], callback: (posts: Post[]) => void): Unsubscribe

  /**
   * Suscripción en tiempo real a las publicaciones de un usuario específico.
   */
  subscribeToUserPosts(userId: UserId, callback: (posts: Post[]) => void): Unsubscribe

  /** Cuenta las publicaciones de un usuario */
  countPosts(userId: UserId): Promise<number>

  /** Obtiene los hashtags más populares */
  getTrendingHashtags(limit?: number): Promise<{ tag: string; count: number }[]>

  /** Busca publicaciones por hashtag o contenido (búsqueda parcial) */
  search(query: string, limit?: number): Promise<Post[]>

  /** Guarda un post para un usuario */
  savePost(postId: PostId, userId: UserId): Promise<void>

  /** Quita un post de los guardados del usuario */
  unsavePost(postId: PostId, userId: UserId): Promise<void>

  /** Verifica si un post está guardado por un usuario */
  isPostSaved(postId: PostId, userId: UserId): Promise<boolean>

  /** Obtiene la lista de posts guardados por un usuario */
  getSavedPosts(userId: UserId, options?: FeedOptions): Promise<Post[]>
}
