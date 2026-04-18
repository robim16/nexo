import { DomainEvent, EventHandler, IEventBus } from '@/core/ports/events/IEventBus'

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, EventHandler[]> = new Map()

  subscribe<TPayload = unknown>(eventType: string, handler: EventHandler<TPayload>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, [])
    }
    this.handlers.get(eventType)!.push(handler as EventHandler)

    return () => this.unsubscribe(eventType, handler)
  }

  unsubscribe<TPayload = unknown>(eventType: string, handler: EventHandler<TPayload>): void {
    if (!this.handlers.has(eventType)) return

    const eventHandlers = this.handlers.get(eventType)!
    this.handlers.set(
      eventType,
      eventHandlers.filter((h) => h !== handler)
    )
  }

  publish<TPayload = unknown>(event: DomainEvent<TPayload>): void {
    const eventHandlers = this.handlers.get(event.type)
    if (!eventHandlers) return

    eventHandlers.forEach((handler) => {
      try {
        handler(event)
      } catch (error) {
        console.error(`Error procesando evento ${event.type}:`, error)
      }
    })
  }

  async publishAsync<TPayload = unknown>(event: DomainEvent<TPayload>): Promise<void> {
    const eventHandlers = this.handlers.get(event.type)
    if (!eventHandlers) return

    const promises = eventHandlers.map((handler) => {
      return new Promise<void>(async (resolve) => {
        try {
          await handler(event)
        } catch (error) {
          console.error(`Error procesando evento asíncrono ${event.type}:`, error)
        } finally {
          resolve()
        }
      })
    })

    await Promise.all(promises)
  }
}
