/**
 * IUserRepository — Contrato de acceso a datos de usuarios.
 * Implementado por FirebaseUserRepository en infraestructura.
 */
import { IBaseRepository } from './IBaseRepository'
import { User } from '../../entities/User'
import { UserId } from '../../value-objects/UserId'
import { Email } from '../../value-objects/Email'

export interface IUserRepository extends IBaseRepository<User, UserId> {
  /** Busca un usuario por su dirección de email */
  findByEmail(email: Email): Promise<User | null>

  /** Busca usuarios por nombre de display (búsqueda parcial) */
  findByDisplayName(query: string, limit?: number): Promise<User[]>

  /** Obtiene múltiples usuarios por sus IDs (batch read) */
  findManyByIds(ids: UserId[]): Promise<User[]>

  /**
   * Actualiza sólo los contadores de un usuario (followersCount, followingCount, postsCount).
   * Operación atómica, más eficiente que actualizar toda la entidad.
   */
  updateCounters(
    userId: UserId,
    delta: {
      followersCount?: number
      followingCount?: number
      postsCount?: number
    }
  ): Promise<void>
}
