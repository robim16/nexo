import { User, type UserPlainObject, type ReconstituteUserData } from '../../core/entities/User'

/**
 * UserMapper
 * Se encarga de la conversión entre la Entidad de Dominio User y objetos planos (DTOs).
 * Útil para serialización en Pinia y para la capa de presentación.
 */
export class UserMapper {
  /**
   * Convierte una entidad User a un objeto plano.
   */
  static toPlain(user: User): UserPlainObject {
    return user.toPlainObject()
  }

  /**
   * Convierte un objeto plano a una entidad User (Reconstitución).
   */
  static toDomain(plain: UserPlainObject): User {
    return User.reconstitute({
      ...plain,
      createdAt: new Date(plain.createdAt),
      updatedAt: new Date(plain.updatedAt)
    })
  }

  /**
   * Mapea una lista de entidades a objetos planos.
   */
  static toPlainList(users: User[]): UserPlainObject[] {
    return users.map((user) => this.toPlain(user))
  }
}
