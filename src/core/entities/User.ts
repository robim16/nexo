/**
 * Entidad Rica: User
 * Núcleo del dominio. Encapsula la lógica de negocio de un usuario de Nexo.
 * No depende de ningún framework externo.
 */
import { UserId } from '../value-objects/UserId'
import { Email } from '../value-objects/Email'
import { DisplayName } from '../value-objects/DisplayName'
import { Bio } from '../value-objects/Bio'
import { Timestamp } from '../value-objects/Timestamp'

export interface UserPlainObject {
  id: string
  email: string
  displayName: string
  bio: string
  avatar: string | null
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: string
  updatedAt: string
  isVerified: boolean
  isActive: boolean
}

export interface CreateUserData {
  id?: string
  email: string
  displayName: string
  bio?: string
}

export interface ReconstituteUserData {
  id: string
  email: string
  displayName: string
  bio: string
  avatar: string | null
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: Date | string
  updatedAt: Date | string
  isVerified: boolean
  isActive: boolean
}

export class User {
  private constructor(
    public readonly id: UserId,
    public readonly email: Email,
    private _displayName: DisplayName,
    private _bio: Bio,
    private _avatar: string | null,
    private _followersCount: number,
    private _followingCount: number,
    private _postsCount: number,
    public readonly createdAt: Timestamp,
    private _updatedAt: Timestamp,
    private _isVerified: boolean,
    private _isActive: boolean
  ) {}

  // ─── Getters ──────────────────────────────────────────────────────────────

  get displayName(): DisplayName { return this._displayName }
  get bio(): Bio { return this._bio }
  get avatar(): string | null { return this._avatar }
  get followersCount(): number { return this._followersCount }
  get followingCount(): number { return this._followingCount }
  get postsCount(): number { return this._postsCount }
  get updatedAt(): Timestamp { return this._updatedAt }
  get isVerified(): boolean { return this._isVerified }
  get isActive(): boolean { return this._isActive }

  // ─── Comportamiento de Negocio ────────────────────────────────────────────

  /**
   * Actualiza el perfil del usuario.
   * Regla de negocio: display name y bio deben ser válidos.
   */
  updateProfile(displayName: string, bio: string): void {
    this._displayName = DisplayName.create(displayName)
    this._bio = Bio.create(bio)
    this._updatedAt = Timestamp.now()
  }

  /** Actualiza la foto de perfil (URL ya validada/subida por infraestructura) */
  updateAvatar(url: string | null): void {
    this._avatar = url
    this._updatedAt = Timestamp.now()
  }

  /** Registra que este usuario empezó a seguir a otro */
  follow(): void {
    this._followingCount++
    this._updatedAt = Timestamp.now()
  }

  /** Registra que este usuario dejó de seguir a otro */
  unfollow(): void {
    if (this._followingCount > 0) {
      this._followingCount--
    }
    this._updatedAt = Timestamp.now()
  }

  /** Otro usuario empezó a seguir a ESTE usuario */
  incrementFollowers(): void {
    this._followersCount++
    this._updatedAt = Timestamp.now()
  }

  /** Otro usuario dejó de seguir a ESTE usuario */
  decrementFollowers(): void {
    if (this._followersCount > 0) {
      this._followersCount--
    }
    this._updatedAt = Timestamp.now()
  }

  /** Registra una nueva publicación del usuario */
  incrementPosts(): void {
    this._postsCount++
    this._updatedAt = Timestamp.now()
  }

  /** Elimina una publicación del contador */
  decrementPosts(): void {
    if (this._postsCount > 0) {
      this._postsCount--
    }
    this._updatedAt = Timestamp.now()
  }

  /** Marca al usuario como verificado (admin action) */
  verify(): void {
    this._isVerified = true
    this._updatedAt = Timestamp.now()
  }

  /** Desactiva la cuenta del usuario */
  deactivate(): void {
    this._isActive = false
    this._updatedAt = Timestamp.now()
  }

  /** Reactiva la cuenta del usuario */
  activate(): void {
    this._isActive = true
    this._updatedAt = Timestamp.now()
  }

  // ─── Reglas de Negocio (Queries) ─────────────────────────────────────────

  /**
   * Un usuario puede publicar si su cuenta está activa.
   * Los verificados tienen prioridad. Cuentas nuevas también pueden publicar.
   */
  canPost(): boolean {
    return this._isActive
  }

  /** Puede ver contenido de seguidores-only */
  canViewFollowersContent(authorId: UserId, isFollowing: boolean): boolean {
    return this.id.equals(authorId) || isFollowing
  }

  // ─── Factories ────────────────────────────────────────────────────────────

  /** Crea un usuario nuevo (primera vez) */
  static create(data: CreateUserData): User {
    const now = Timestamp.now()
    return new User(
      data.id ? UserId.reconstitute(data.id) : UserId.generate(),
      Email.create(data.email),
      DisplayName.create(data.displayName),
      Bio.create(data.bio ?? ''),
      null,
      0, 0, 0,
      now,
      now,
      false,
      true
    )
  }

  /** Reconstituye un usuario desde persistencia (no re-valida UUID ni email) */
  static reconstitute(data: ReconstituteUserData): User {
    return new User(
      UserId.reconstitute(data.id),
      Email.reconstitute(data.email),
      DisplayName.reconstitute(data.displayName),
      Bio.reconstitute(data.bio),
      data.avatar,
      data.followersCount,
      data.followingCount,
      data.postsCount,
      Timestamp.reconstitute(data.createdAt),
      Timestamp.reconstitute(data.updatedAt),
      data.isVerified,
      data.isActive
    )
  }

  // ─── Serialización ────────────────────────────────────────────────────────

  toPlainObject(): UserPlainObject {
    return {
      id: this.id.value,
      email: this.email.value,
      displayName: this._displayName.value,
      bio: this._bio.value,
      avatar: this._avatar,
      followersCount: this._followersCount,
      followingCount: this._followingCount,
      postsCount: this._postsCount,
      createdAt: this.createdAt.toISO(),
      updatedAt: this._updatedAt.toISO(),
      isVerified: this._isVerified,
      isActive: this._isActive,
    }
  }
}
