/**
 * IUserRepository — Contrato de acceso a datos de usuarios.
 * Implementado por FirebaseUserRepository en infraestructura.
 */
import { IBaseRepository } from './IBaseRepository'
import { User } from '../../entities/User'
import { UserId } from '../../value-objects/UserId'
import { Email } from '../../value-objects/Email'
import { Unsubscribe } from './IPostRepository'

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

  /**
   * Suscripción en tiempo real a un usuario específico.
   */
  subscribeToUser(userId: UserId, callback: (user: User | null) => void): Unsubscribe
}
