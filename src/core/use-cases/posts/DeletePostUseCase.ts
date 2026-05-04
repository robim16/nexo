/**
 * DeletePostUseCase — Caso de uso: eliminar una publicación.
 * Verifica autoría antes de eliminar. También elimina imágenes del storage.
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IStorageService } from '../../ports/services/IStorageService'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'
import { PostDomainError } from '../../errors/PostDomainError'

export interface DeletePostDTO {
  postId: string
  requesterId: string
}

export class DeletePostUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository,
    private readonly storageService: IStorageService,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: DeletePostDTO): Promise<void> {
    const postId = PostId.fromString(dto.postId)
    const requesterId = UserId.fromString(dto.requesterId)

    // 1. Cargar el post
    const post = await this.postRepository.findById(postId)
    if (!post) {
      throw PostDomainError.notFound(dto.postId)
    }

    // 2. Verificar autorización (solo el autor puede eliminar)
    if (!post.canBeDeletedBy(requesterId)) {
      throw PostDomainError.unauthorizedAction('eliminar')
    }

    // 3. Eliminar imágenes del storage (en paralelo, no crítico para el flujo)
    const imageUrls = [...post.images]
    if (imageUrls.length > 0) {
      // Best-effort: no bloqueamos si falla la eliminación de imágenes
      this.storageService.deleteFiles(imageUrls).catch((_err) => {
        // Log ignorado — las imágenes huérfanas se limpian por proceso de fondo
      })
    }

    // 4. Eliminar post del repositorio
    await this.postRepository.delete(postId)

    // 5. Actualizar contador de posts del usuario
    await this.userRepository.updateCounters(post.authorId, { postsCount: -1 })

    // 6. Publicar evento
    this.eventBus.publish({
      type: DomainEvents.POST_DELETED,
      timestamp: new Date(),
      payload: {
        postId: dto.postId,
        authorId: post.authorId.value
      }
    })
  }
}
