import { ICommentRepository } from '../../ports/repositories/ICommentRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { Comment } from '../../entities/Comment'
import { PostId } from '../../value-objects/PostId'

export interface GetCommentsDTO {
  postId: string
  limit?: number
}

export interface GetCommentsResult {
  comments: Comment[]
}

export class GetCommentsUseCase {
  constructor(
    private readonly commentRepository: ICommentRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GetCommentsDTO): Promise<GetCommentsResult> {
    const postId = PostId.fromString(dto.postId)
    
    // 1. Obtener comentarios
    const comments = await this.commentRepository.findByPost(postId, dto.limit)

    // 2. Poblar información del autor para cada comentario (opcional, pero útil para la UI)
    // En una implementación real, esto se podría optimizar con un batch get de usuarios
    for (const comment of comments) {
      const user = await this.userRepository.findById(comment.authorId)
      if (user) {
        // Podríamos extender la entidad Comment o usar un DTO de respuesta
        // Por ahora, asumimos que la UI manejará la carga de perfiles si es necesario
        // o adjuntamos info básica si la entidad lo permite (como hicimos con Post)
      }
    }

    return { comments }
  }
}
