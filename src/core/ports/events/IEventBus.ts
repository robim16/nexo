/**
 * IEventBus — Bus de eventos de dominio.
 * Permite comunicación desacoplada entre casos de uso y features.
 * Implementado por InMemoryEventBus en infraestructura.
 */

/** Estructura base para todos los eventos de dominio */
export interface DomainEvent<TPayload = unknown> {
  /** Tipo único del evento (usar constantes de DomainEvents.ts) */
  readonly type: string
  /** Timestamp de cuándo ocurrió el evento */
  readonly timestamp: Date
  /** ID de correlación para tracing (opcional) */
  readonly correlationId?: string
  /** Datos específicos del evento */
  readonly payload: TPayload
}

/** Handler de evento */
export type EventHandler<TPayload = unknown> = (event: DomainEvent<TPayload>) => void

export interface IEventBus {
  /**
   * Publica un evento de dominio.
   * Todos los handlers suscritos al tipo del evento serán notificados.
   */
  publish<TPayload = unknown>(event: DomainEvent<TPayload>): void

  /**
   * Suscribe un handler a un tipo de evento específico.
   * @returns Función para cancelar la suscripción
   */
  subscribe<TPayload = unknown>(
    eventType: string,
    handler: EventHandler<TPayload>
  ): () => void

  /**
   * Cancela la suscripción de un handler a un tipo de evento.
   */
  unsubscribe<TPayload = unknown>(
    eventType: string,
    handler: EventHandler<TPayload>
  ): void

  /**
   * Publica un evento de forma asíncrona (no bloquea el caso de uso).
   */
  publishAsync<TPayload = unknown>(event: DomainEvent<TPayload>): Promise<void>
}
