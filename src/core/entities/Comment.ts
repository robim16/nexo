/**
 * Entidad Rica: Comment
 * Comentario dentro de una publicación de Nexo.
 */
import { CommentId } from '../value-objects/CommentId'
import { PostId } from '../value-objects/PostId'
import { UserId } from '../value-objects/UserId'
import { PostContent } from '../value-objects/PostContent'
import { Timestamp } from '../value-objects/Timestamp'
import { PostDomainError } from '../errors/PostDomainError'

/** Ventana de edición de comentarios en horas */
const COMMENT_EDIT_WINDOW_HOURS = 1

export interface CommentPlainObject {
  id: string
  postId: string
  authorId: string
  content: string
  likes: string[]
  likesCount: number
  createdAt: string
  updatedAt: string
  isEdited: boolean
}

export interface CreateCommentData {
  postId: PostId
  authorId: UserId
  content: PostContent
}

export interface ReconstituteCommentData {
  id: string
  postId: string
  authorId: string
  content: string
  likes: string[]
  likesCount: number
  createdAt: Date | string
  updatedAt: Date | string
  isEdited: boolean
}

export class Comment {
  private constructor(
    public readonly id: CommentId,
    public readonly postId: PostId,
    public readonly authorId: UserId,
    private _content: PostContent,
    private _likes: string[],
    private _likesCount: number,
    public readonly createdAt: Timestamp,
    private _updatedAt: Timestamp,
    private _isEdited: boolean
  ) {}

  // ─── Getters ──────────────────────────────────────────────────────────────

  get content(): PostContent { return this._content }
  get likes(): readonly string[] { return this._likes }
  get likesCount(): number { return this._likesCount }
  get updatedAt(): Timestamp { return this._updatedAt }
  get isEdited(): boolean { return this._isEdited }

  // ─── Comportamiento de Negocio ────────────────────────────────────────────

  like(userId: UserId): void {
    if (this._likes.includes(userId.value)) {
      throw PostDomainError.alreadyLiked()
    }
    this._likes = [...this._likes, userId.value]
    this._likesCount++
    this._updatedAt = Timestamp.now()
  }

  unlike(userId: UserId): void {
    if (!this._likes.includes(userId.value)) {
      throw PostDomainError.notLiked()
    }
    this._likes = this._likes.filter((id) => id !== userId.value)
    this._likesCount = Math.max(0, this._likesCount - 1)
    this._updatedAt = Timestamp.now()
  }

  /**
   * Edita el contenido del comentario.
   * Ventana de edición: 1 hora desde la creación.
   */
  edit(newContent: PostContent, requesterId: UserId): void {
    if (!this.isAuthor(requesterId)) {
      throw PostDomainError.unauthorizedAction('editar comentario')
    }

    const hoursSinceCreation =
      (Date.now() - this.createdAt.value.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation > COMMENT_EDIT_WINDOW_HOURS) {
      throw PostDomainError.editWindowExpired(COMMENT_EDIT_WINDOW_HOURS)
    }

    this._content = newContent
    this._isEdited = true
    this._updatedAt = Timestamp.now()
  }

  // ─── Reglas de Negocio (Queries) ─────────────────────────────────────────

  isAuthor(userId: UserId): boolean {
    return this.authorId.equals(userId)
  }

  isLikedBy(userId: UserId): boolean {
    return this._likes.includes(userId.value)
  }

  canBeDeletedBy(userId: UserId): boolean {
    return this.isAuthor(userId)
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  static create(data: CreateCommentData): Comment {
    const now = Timestamp.now()
    return new Comment(
      CommentId.generate(),
      data.postId,
      data.authorId,
      data.content,
      [],
      0,
      now,
      now,
      false
    )
  }

  static reconstitute(data: ReconstituteCommentData): Comment {
    return new Comment(
      CommentId.reconstitute(data.id),
      PostId.reconstitute(data.postId),
      UserId.reconstitute(data.authorId),
      PostContent.reconstitute(data.content),
      data.likes,
      data.likesCount,
      Timestamp.reconstitute(data.createdAt),
      Timestamp.reconstitute(data.updatedAt),
      data.isEdited
    )
  }

  // ─── Serialización ────────────────────────────────────────────────────────

  toPlainObject(): CommentPlainObject {
    return {
      id: this.id.value,
      postId: this.postId.value,
      authorId: this.authorId.value,
      content: this._content.value,
      likes: [...this._likes],
      likesCount: this._likesCount,
      createdAt: this.createdAt.toISO(),
      updatedAt: this._updatedAt.toISO(),
      isEdited: this._isEdited,
    }
  }
}
