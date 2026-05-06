/**
 * EditPostUseCase — Caso de uso: editar el contenido de una publicación.
 * Reglas de negocio: solo el autor puede editar.
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'
import { Post } from '../../entities/Post'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'
import { PostContent } from '../../value-objects/PostContent'
import { PostDomainError } from '../../errors/PostDomainError'

export interface EditPostDTO {
  postId: string
  requesterId: string
  newContent: string
  newImages?: string[]
}

export interface EditPostResult {
  post: Post
}

export class EditPostUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: EditPostDTO): Promise<EditPostResult> {
    const postId = PostId.fromString(dto.postId)
    const requesterId = UserId.fromString(dto.requesterId)

    // 1. Cargar el post
    const post = await this.postRepository.findById(postId)
    if (!post) {
      throw PostDomainError.notFound(dto.postId)
    }

    // 2. Crear y validar nuevo contenido (value object)
    const newContent = PostContent.create(dto.newContent)

    // 3. Delegar reglas de negocio a la entidad
    post.edit(newContent, requesterId, dto.newImages)

    // 4. Persistir cambios
    await this.postRepository.update(post)

    // 5. Publicar evento
    this.eventBus.publish({
      type: DomainEvents.POST_EDITED,
      timestamp: new Date(),
      payload: {
        postId: dto.postId,
        authorId: post.authorId.value,
        newContent: newContent.value,
        images: dto.newImages || post.images
      }
    })

    return { post }
  }
}
