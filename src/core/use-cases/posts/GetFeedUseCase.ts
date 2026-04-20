/**
 * GetFeedUseCase — Caso de uso: obtener el feed paginado del usuario.
 * Combina los posts de los usuarios que sigue, paginados por cursor.
 */
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { Post } from '../../entities/Post'
import { UserId } from '../../value-objects/UserId'
import { PostId } from '../../value-objects/PostId'

export interface GetFeedDTO {
  userId: string
  /** ID del último post cargado (cursor para paginación) */
  lastPostId?: string
  limit?: number
}

export interface GetFeedResult {
  posts: Post[]
  hasMore: boolean
}

const DEFAULT_FEED_LIMIT = 20

export class GetFeedUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly followRepository: IFollowRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(dto: GetFeedDTO): Promise<GetFeedResult> {
    const userId = UserId.fromString(dto.userId)
    const limit = dto.limit ?? DEFAULT_FEED_LIMIT

    // 1. Obtener IDs de usuarios que sigue
    const followingIds = await this.followRepository.getFollowingIds(userId)

    // Si no sigue a nadie, feed vacío
    if (followingIds.length === 0) {
      return { posts: [], hasMore: false }
    }

    // 2. Cursor de paginación
    const lastPostId = dto.lastPostId ? PostId.fromString(dto.lastPostId) : undefined

    // 3. Obtener posts del repositorio
    const posts = await this.postRepository.getFeed(userId, followingIds, {
      limit: limit + 1, // +1 para saber si hay más
      lastPostId,
    })

    // 4. Enriquecer posts con información del autor
    const authorIds = [...new Set(posts.map(p => p.authorId))];
    const authors = await this.userRepository.findManyByIds(authorIds);
    const authorMap = new Map(authors.map(u => [u.id.value, u]));

    for (const post of posts) {
      const author = authorMap.get(post.authorId.value);
      if (author) {
        post.setAuthorInfo(author.displayName.value, author.avatar);
      }
    }

    // 5. Determinar si hay más páginas
    const hasMore = posts.length > limit
    const result = hasMore ? posts.slice(0, limit) : posts

    return { posts: result, hasMore }
  }
}
