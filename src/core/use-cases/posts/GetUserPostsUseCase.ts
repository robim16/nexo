/**
 * GetUserPostsUseCase — Retorna las publicaciones de un usuario específico.
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { Post } from '../../entities/Post'
import { UserId } from '../../value-objects/UserId'
import { PostId } from '../../value-objects/PostId'

export interface GetUserPostsDTO {
  userId: string
  lastPostId?: string
  limit?: number
}

export interface GetUserPostsResult {
  posts: Post[]
  hasMore: boolean
}

const DEFAULT_LIMIT = 20

export class GetUserPostsUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GetUserPostsDTO): Promise<GetUserPostsResult> {
    const userId = UserId.fromString(dto.userId)
    const limit = dto.limit ?? DEFAULT_LIMIT
    const lastPostId = dto.lastPostId ? PostId.fromString(dto.lastPostId) : undefined

    // 1. Obtener posts del usuario
    const posts = await this.postRepository.findByAuthor(userId, {
      limit: limit + 1,
      lastPostId
    })

    // 2. Enriquecer con info del autor (el mismo usuario)
    const author = await this.userRepository.findById(userId)
    if (author) {
      for (const post of posts) {
        post.setAuthorInfo(author.displayName.value, author.avatar)
      }
    }

    const hasMore = posts.length > limit
    const result = hasMore ? posts.slice(0, limit) : posts

    return { posts: result, hasMore }
  }
}
