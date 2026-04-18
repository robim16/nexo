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
    
    // El repositorio debería tener un método de búsqueda.
    // Si no lo tiene, simulamos una búsqueda básica o devolvemos vacío.
    if ((repository as any).search) {
      const results = await (repository as any).search(query);
      return UserMapper.toPlainList(results);
    }
    
    return [];
  }

  /**
   * Busca publicaciones por contenido o hashtags.
   */
  async searchPosts(query: string): Promise<PostPlainObject[]> {
    const repository = container.get<IPostRepository>('IPostRepository');
    
    if ((repository as any).search) {
      const results = await (repository as any).search(query);
      return PostMapper.toPlainList(results);
    }
    
    return [];
  }
}

export const searchService = new SearchService();
