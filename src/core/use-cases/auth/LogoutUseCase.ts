/**
 * LogoutUseCase — Caso de uso: cerrar sesión.
 * Simple pero encapsula el evento de dominio y cualquier limpieza futura.
 */
import { IAuthService } from '../../ports/services/IAuthService'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'

export interface LogoutDTO {
  userId: string
}

export class LogoutUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: LogoutDTO): Promise<void> {
    // 1. Cerrar sesión en el servicio de auth
    await this.authService.signOut()

    // 2. Publicar evento (permite que stores limpien su estado)
    this.eventBus.publish({
      type: DomainEvents.USER_LOGGED_OUT,
      timestamp: new Date(),
      payload: { userId: dto.userId },
    })
  }
}
