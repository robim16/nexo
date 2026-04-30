/**
 * UpdateUserProfileUseCase — Actualiza el perfil de un usuario.
 * Soporta cambio de avatar (sube la imagen y actualiza la URL en el repositorio)
 * y actualización de campos básicos como displayName y bio.
 */
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IStorageService } from '../../ports/services/IStorageService'
import { UserId } from '../../value-objects/UserId'
import { AuthDomainError } from '../../errors/AuthDomainError'

export interface UpdateUserProfileDTO {
  userId: string
  /** Archivo de imagen para el avatar. Si no se proporciona, no se cambia. */
  avatarFile?: File
  /** Nuevo nombre de display (opcional) */
  displayName?: string
  /** Nueva bio (opcional) */
  bio?: string
  /** Callback de progreso del upload (0-100) */
  onUploadProgress?: (percent: number) => void
}

export interface UpdateUserProfileResult {
  /** URL pública del nuevo avatar (solo si se subió uno nuevo) */
  avatarUrl?: string
  /** Usuario actualizado completo */
  updatedFields: { avatar?: string; displayName?: string; bio?: string }
}

const MAX_AVATAR_SIZE_MB = 5

export class UpdateUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(dto: UpdateUserProfileDTO): Promise<UpdateUserProfileResult> {
    // 1. Obtener usuario
    const userId = UserId.fromString(dto.userId)
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw AuthDomainError.userNotFound(dto.userId)
    }

    let avatarUrl: string | undefined

    // 2. Subir nuevo avatar si se proporcionó
    if (dto.avatarFile) {
      if (dto.avatarFile.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
        throw new Error(`La imagen del avatar no puede superar ${MAX_AVATAR_SIZE_MB}MB`)
      }

      const result = await this.storageService.uploadImage(
        dto.avatarFile,
        `avatars/${userId.value}`,
        { onProgress: dto.onUploadProgress }
      )
      avatarUrl = result.downloadUrl
    }

    // 3. Actualizar campos en la entidad de dominio
    if (avatarUrl) {
      user.updateAvatar(avatarUrl)
    }

    // updateProfile actualiza displayName y bio juntos
    if (dto.displayName !== undefined || dto.bio !== undefined) {
      const newDisplayName = dto.displayName ?? user.displayName.value
      const newBio = dto.bio ?? user.bio.value
      user.updateProfile(newDisplayName, newBio)
    }

    // 4. Persistir cambios
    await this.userRepository.update(user)

    return {
      avatarUrl,
      updatedFields: {
        avatar: avatarUrl,
        displayName: dto.displayName,
        bio: dto.bio,
      },
    }
  }
}
