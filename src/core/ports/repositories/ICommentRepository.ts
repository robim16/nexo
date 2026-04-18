/**
 * ICommentRepository — Contrato de acceso a datos de comentarios.
 * Implementado por FirebaseCommentRepository en infraestructura.
 */
import { Comment } from '../../entities/Comment'
import { CommentId } from '../../value-objects/CommentId'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'

export interface ICommentRepository {
  /** Persiste un nuevo comentario */
  save(comment: Comment): Promise<void>

  /** Busca un comentario por su ID */
  findById(id: CommentId): Promise<Comment | null>

  /**
   * Obtiene los comentarios de un post, ordenados por fecha asc.
   */
  findByPost(postId: PostId, limit?: number): Promise<Comment[]>

  /** Actualiza el contenido de un comentario */
  update(comment: Comment): Promise<void>

  /** Elimina un comentario */
  delete(id: CommentId): Promise<void>

  /** Da like a un comentario */
  like(commentId: CommentId, userId: UserId): Promise<void>

  /** Quita el like de un comentario */
  unlike(commentId: CommentId, userId: UserId): Promise<void>

  /** Cuenta el total de comentarios de un post */
  countByPost(postId: PostId): Promise<number>
}
