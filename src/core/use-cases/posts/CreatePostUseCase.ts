/**
 * CreatePostUseCase — Caso de uso: crear una nueva publicación.
 * Orquesta: validación → subir imágenes → crear entidad → persistir → actualizar contadores → evento.
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IStorageService } from '../../ports/services/IStorageService'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents, PostCreatedPayload } from '../../ports/events/DomainEvents'
import { Post } from '../../entities/Post'
import { UserId } from '../../value-objects/UserId'
import { PostContent } from '../../value-objects/PostContent'
import { PostVisibility } from '../../value-objects/PostVisibility'
import { AuthDomainError } from '../../errors/AuthDomainError'
import { PostDomainError } from '../../errors/PostDomainError'

export interface CreatePostDTO {
  userId: string
  content: string
  images?: File[]
  visibility?: string
}

export interface CreatePostResult {
  post: Post
}

const MAX_IMAGES = 4
const MAX_IMAGE_SIZE_MB = 10

export class CreatePostUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository,
    private readonly storageService: IStorageService,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: CreatePostDTO): Promise<CreatePostResult> {
    // 1. Obtener y validar autor
    const userId = UserId.fromString(dto.userId)
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw AuthDomainError.userNotFound(dto.userId)
    }
    if (!user.canPost()) {
      throw AuthDomainError.accountDisabled()
    }

    // 2. Validar y crear content (value object)
    const content = PostContent.create(dto.content)

    // 3. Validar cantidad de imágenes
    if (dto.images && dto.images.length > MAX_IMAGES) {
      throw PostDomainError.tooManyImages(MAX_IMAGES)
    }

    // 4. Validar tamaño de imágenes
    if (dto.images) {
      for (const image of dto.images) {
        if (image.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
          throw PostDomainError.imageTooLarge(MAX_IMAGE_SIZE_MB)
        }
      }
    }

    // 5. Subir imágenes a Storage
    const imageUrls: string[] = []
    if (dto.images && dto.images.length > 0) {
      const uploadResults = await Promise.all(
        dto.images.map((file) =>
          this.storageService.uploadImage(file, `posts/${userId.value}/`)
        )
      )
      imageUrls.push(...uploadResults.map((r) => r.downloadUrl))
    }

    // 6. Determinar visibilidad
    const visibility = dto.visibility
      ? PostVisibility.create(dto.visibility)
      : PostVisibility.public()

    // 7. Crear entidad de dominio
    const post = Post.create({
      authorId: userId,
      content,
      images: imageUrls,
      visibility,
    })
    
    // Adjuntar info del autor para la UI
    post.setAuthorInfo(user.displayName.value, user.avatar);

    // 8. Persistir post
    await this.postRepository.save(post)

    // 9. Actualizar contador de posts del usuario
    await this.userRepository.updateCounters(userId, { postsCount: 1 })

    // 10. Publicar evento de dominio
    const payload: PostCreatedPayload = {
      postId: post.id.value,
      authorId: userId.value,
      hasImages: imageUrls.length > 0,
      mentionedUsers: [...content.mentions],
      hashtags: [...content.hashtags],
    }

    this.eventBus.publish({
      type: DomainEvents.POST_CREATED,
      timestamp: new Date(),
      payload,
    })

    return { post }
  }
}
