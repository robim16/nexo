import { Post, type PostPlainObject } from '../../core/entities/Post'

/**
 * PostMapper
 * Se encarga de la conversión entre la Entidad de Dominio Post y objetos planos.
 */
export class PostMapper {
  /**
   * Convierte una entidad Post a un objeto plano.
   */
  static toPlain(post: Post): PostPlainObject {
    return post.toPlainObject()
  }

  /**
   * Convierte un objeto plano a una entidad Post (Reconstitución).
   */
  static toDomain(plain: PostPlainObject): Post {
    return Post.reconstitute({
      ...plain,
      createdAt: new Date(plain.createdAt),
      updatedAt: new Date(plain.updatedAt),
      authorName: plain.authorName,
      authorAvatar: plain.authorAvatar
    })
  }

  /**
   * Mapea una lista de entidades a objetos planos.
   */
  static toPlainList(posts: Post[]): PostPlainObject[] {
    return posts.map((post) => this.toPlain(post))
  }
}
