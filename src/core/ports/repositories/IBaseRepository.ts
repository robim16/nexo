/**
 * IBaseRepository — Interfaz genérica CRUD.
 * Define el contrato mínimo que todo repositorio de Nexo debe cumplir.
 * La infraestructura implementa esta interfaz; el dominio la consume.
 */
export interface IBaseRepository<TEntity, TId> {
  /** Busca una entidad por su ID único */
  findById(id: TId): Promise<TEntity | null>

  /** Obtiene todas las entidades (con límite opcional) */
  findAll(limit?: number): Promise<TEntity[]>

  /** Persiste una entidad nueva */
  save(entity: TEntity): Promise<void>

  /** Actualiza una entidad existente */
  update(entity: TEntity): Promise<void>

  /** Elimina una entidad por su ID */
  delete(id: TId): Promise<void>

  /** Verifica si existe una entidad con el ID dado */
  exists(id: TId): Promise<boolean>
}
