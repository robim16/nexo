/**
 * Entidad Rica: Post
 * Encapsula una publicación de Nexo con lógica de likes, edición y permisos.
 */
import { PostId } from '../value-objects/PostId'
import { UserId } from '../value-objects/UserId'
import { PostContent } from '../value-objects/PostContent'
import { PostVisibility } from '../value-objects/PostVisibility'
import { Timestamp } from '../value-objects/Timestamp'
import { PostDomainError } from '../errors/PostDomainError'

/** Máximo de horas para poder editar un post */
const EDIT_WINDOW_HOURS = 24
/** Máximo de imágenes por publicación */
const MAX_IMAGES = 4
/** Tamaño máximo de imagen en MB */
const MAX_IMAGE_SIZE_MB = 10

export interface PostPlainObject {
  id: string
  authorId: string
  authorName?: string
  authorAvatar?: string | null
  content: string
  hashtags: string[]
  mentions: string[]
  images: string[]
  likes: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  visibility: string
  createdAt: string
  updatedAt: string
  isEdited: boolean
}

export interface CreatePostData {
  authorId: UserId
  content: PostContent
  images?: string[]
  visibility?: PostVisibility
}

export interface ReconstitutePostData {
  id: string
  authorId: string
  authorName?: string
  authorAvatar?: string | null
  content: string
  images: string[]
  likes: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  visibility: string
  createdAt: Date | string
  updatedAt: Date | string
  isEdited: boolean
}

export class Post {
  private constructor(
    public readonly id: PostId,
    public readonly authorId: UserId,
    private _content: PostContent,
    private _images: string[],
    private _likes: string[],
    private _likesCount: number,
    private _commentsCount: number,
    private _sharesCount: number,
    private _visibility: PostVisibility,
    public readonly createdAt: Timestamp,
    private _updatedAt: Timestamp,
    private _isEdited: boolean,
    private _authorName?: string,
    private _authorAvatar?: string | null
  ) {}

  // ─── Getters ──────────────────────────────────────────────────────────────

  get content(): PostContent { return this._content }
  get images(): readonly string[] { return this._images }
  get likes(): readonly string[] { return this._likes }
  get likesCount(): number { return this._likesCount }
  get commentsCount(): number { return this._commentsCount }
  get sharesCount(): number { return this._sharesCount }
  get visibility(): PostVisibility { return this._visibility }
  get updatedAt(): Timestamp { return this._updatedAt }
  get isEdited(): boolean { return this._isEdited }
  get hashtags(): readonly string[] { return this._content.hashtags }
  get mentions(): readonly string[] { return this._content.mentions }
  get authorName(): string | undefined { return this._authorName }
  get authorAvatar(): string | null | undefined { return this._authorAvatar }

  // ─── Comportamiento de Negocio ────────────────────────────────────────────

  /**
   * Da like al post.
   * Regla: un usuario solo puede dar like una vez.
   */
  like(userId: UserId): void {
    if (this.isLikedBy(userId)) {
      throw PostDomainError.alreadyLiked()
    }
    this._likes = [...this._likes, userId.value]
    this._likesCount++
    this._updatedAt = Timestamp.now()
  }

  /**
   * Quita el like.
   * Regla: solo puede quitar like si previamente dio like.
   */
  unlike(userId: UserId): void {
    if (!this.isLikedBy(userId)) {
      throw PostDomainError.notLiked()
    }
    this._likes = this._likes.filter((id) => id !== userId.value)
    this._likesCount = Math.max(0, this._likesCount - 1)
    this._updatedAt = Timestamp.now()
  }

  /** Registra un nuevo comentario (el Comment se persiste por separado) */
  addComment(): void {
    this._commentsCount++
    this._updatedAt = Timestamp.now()
  }

  /** Decrementa el contador de comentarios al eliminar uno */
  removeComment(): void {
    if (this._commentsCount > 0) {
      this._commentsCount--
    }
    this._updatedAt = Timestamp.now()
  }

  /** Registra un compartido */
  share(): void {
    this._sharesCount++
    this._updatedAt = Timestamp.now()
  }

  /**
   * Edita el contenido del post.
   * Regla de negocio: solo el autor puede editar, dentro de las 24 horas.
   */
  edit(newContent: PostContent, requesterId: UserId): void {
    if (!this.isAuthor(requesterId)) {
      throw PostDomainError.unauthorizedAction('editar')
    }

    const hoursSinceCreation =
      (Date.now() - this.createdAt.value.getTime()) / (1000 * 60 * 60)

    if (hoursSinceCreation > EDIT_WINDOW_HOURS) {
      throw PostDomainError.editWindowExpired(EDIT_WINDOW_HOURS)
    }

    this._content = newContent
    this._isEdited = true
    this._updatedAt = Timestamp.now()
  }

  /**
   * Cambia la visibilidad del post.
   * Solo el autor puede hacerlo.
   */
  changeVisibility(visibility: PostVisibility, requesterId: UserId): void {
    if (!this.isAuthor(requesterId)) {
      throw PostDomainError.unauthorizedAction('cambiar visibilidad')
    }
    this._visibility = visibility
    this._updatedAt = Timestamp.now()
  }

  /**
   * Adjunta información del autor al post.
   * Útil para la capa de presentación.
   */
  setAuthorInfo(name: string, avatar: string | null): void {
    this._authorName = name
    this._authorAvatar = avatar
  }

  // ─── Reglas de Negocio (Queries) ─────────────────────────────────────────

  isAuthor(userId: UserId): boolean {
    return this.authorId.equals(userId)
  }

  isLikedBy(userId: UserId): boolean {
    return this._likes.includes(userId.value)
  }

  canBeEditedBy(userId: UserId): boolean {
    if (!this.isAuthor(userId)) return false
    const hoursSinceCreation =
      (Date.now() - this.createdAt.value.getTime()) / (1000 * 60 * 60)
    return hoursSinceCreation <= EDIT_WINDOW_HOURS
  }

  canBeDeletedBy(userId: UserId): boolean {
    return this.isAuthor(userId)
  }

  canBeViewedBy(viewerId: string, isFollowing: boolean): boolean {
    return this._visibility.canBeViewedBy(viewerId, this.authorId.value, isFollowing)
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  static create(data: CreatePostData): Post {
    if (data.images && data.images.length > MAX_IMAGES) {
      throw PostDomainError.tooManyImages(MAX_IMAGES)
    }

    const now = Timestamp.now()
    return new Post(
      PostId.generate(),
      data.authorId,
      data.content,
      data.images ?? [],
      [],
      0, 0, 0,
      data.visibility ?? PostVisibility.public(),
      now,
      now,
      false
    )
  }

  static reconstitute(data: ReconstitutePostData): Post {
    return new Post(
      PostId.reconstitute(data.id),
      UserId.reconstitute(data.authorId),
      PostContent.reconstitute(data.content),
      data.images,
      data.likes,
      data.likesCount,
      data.commentsCount,
      data.sharesCount,
      PostVisibility.reconstitute(data.visibility),
      Timestamp.reconstitute(data.createdAt),
      Timestamp.reconstitute(data.updatedAt),
      data.isEdited,
      data.authorName,
      data.authorAvatar
    )
  }

  // ─── Serialización ────────────────────────────────────────────────────────

  toPlainObject(): PostPlainObject {
    return {
      id: this.id.value,
      authorId: this.authorId.value,
      authorName: this._authorName,
      authorAvatar: this._authorAvatar,
      content: this._content.value,
      hashtags: [...this._content.hashtags],
      mentions: [...this._content.mentions],
      images: [...this._images],
      likes: [...this._likes],
      likesCount: this._likesCount,
      commentsCount: this._commentsCount,
      sharesCount: this._sharesCount,
      visibility: this._visibility.value,
      createdAt: this.createdAt.toISO(),
      updatedAt: this._updatedAt.toISO(),
      isEdited: this._isEdited,
    }
  }
}
