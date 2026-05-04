/**
 * GetSavedPostsUseCase — Caso de uso: obtener los posts guardados por un usuario.
 */
import { IPostRepository, FeedOptions } from '../../ports/repositories/IPostRepository'
import { Post } from '../../entities/Post'
import { UserId } from '../../value-objects/UserId'

export class GetSavedPostsUseCase {
  constructor(private readonly postRepository: IPostRepository) {}

  async execute(userId: string, options?: FeedOptions): Promise<Post[]> {
    const userUid = UserId.fromString(userId)
    return await this.postRepository.getSavedPosts(userUid, options)
  }
}
