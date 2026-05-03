import { container } from '../../dependency-injection';
import type { IUserRepository } from '../../core/ports/repositories/IUserRepository';
import type { IPostRepository } from '../../core/ports/repositories/IPostRepository';
import { UserMapper } from '../mappers/UserMapper';
import { PostMapper } from '../mappers/PostMapper';
import type { UserPlainObject } from '../../core/entities/User';
import type { PostPlainObject } from '../../core/entities/Post';

/**
 * SearchService
 * Agrega funcionalidad de búsqueda en la aplicación.
 */
export class SearchService {
  /**
   * Busca usuarios por nombre o email.
   */
  async searchUsers(query: string): Promise<UserPlainObject[]> {
    const repository = container.get<IUserRepository>('IUserRepository');
    const results = await repository.findByDisplayName(query);
    return UserMapper.toPlainList(results);
  }

  /**
   * Busca publicaciones por contenido o hashtags.
   */
  async searchPosts(query: string): Promise<PostPlainObject[]> {
    const repository = container.get<IPostRepository>('IPostRepository');
    const results = await repository.search(query);
    return PostMapper.toPlainList(results);
  }
}

export const searchService = new SearchService();
