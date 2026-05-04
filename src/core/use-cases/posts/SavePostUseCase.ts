/**
 * SavePostUseCase — Caso de uso: guardar/quitar de guardados un post.
 * Soporta toggle (si ya está guardado, lo quita; si no, lo guarda).
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { PostId } from '../../value-objects/PostId'
import { UserId } from '../../value-objects/UserId'
import { PostDomainError } from '../../errors/PostDomainError'

export interface SavePostDTO {
  postId: string
  userId: string
}

export interface SavePostResult {
  saved: boolean // true = guardado, false = quitado
}

export class SavePostUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(dto: SavePostDTO): Promise<SavePostResult> {
    const postId = PostId.fromString(dto.postId)
    const userId = UserId.fromString(dto.userId)

    // 1. Verificar si el post existe
    const post = await this.postRepository.findById(postId)
    if (!post) {
      throw PostDomainError.notFound(dto.postId)
    }

    // 2. Verificar si ya está guardado
    const isSaved = await this.postRepository.isPostSaved(postId, userId)

    if (isSaved) {
      // 3a. Quitar de guardados
      await this.postRepository.unsavePost(postId, userId)
      return { saved: false }
    } else {
      // 3b. Guardar post
      await this.postRepository.savePost(postId, userId)
      return { saved: true }
    }
  }
}
