import { container } from '../../dependency-injection';
import type { PostPlainObject } from '../../core/entities/Post';
import type { GetFeedUseCase } from '../../core/use-cases/posts/GetFeedUseCase';
import { PostMapper } from '../mappers/PostMapper';

/**
 * FeedService
 * Servicio de aplicación para gestionar la lógica de alto nivel del feed.
 */
export class FeedService {
  /**
   * Obtiene el feed personalizado para un usuario.
   */
  async getPersonalizedFeed(userId: string, limit = 10): Promise<PostPlainObject[]> {
    const useCase = container.get<GetFeedUseCase>('GetFeedUseCase');
    const posts = await useCase.execute({ userId, limit });
    return PostMapper.toPlainList(posts);
  }

  /**
   * Filtra publicaciones por hashtags (Lógica de aplicación).
   */
  filterByHashtag(posts: PostPlainObject[], hashtag: string): PostPlainObject[] {
    const tag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    return posts.filter(post => post.hashtags.includes(tag));
  }
}

export const feedService = new FeedService();
