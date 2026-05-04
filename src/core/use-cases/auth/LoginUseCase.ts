/**
 * LoginUseCase — Caso de uso: iniciar sesión.
 * Orquesta: validación → auth service → retorno de entidad User.
 */
import { IAuthService } from '../../ports/services/IAuthService'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents } from '../../ports/events/DomainEvents'
import { User } from '../../entities/User'
import { Email } from '../../value-objects/Email'
import { ValidationDomainError } from '../../errors/ValidationDomainError'

export interface LoginDTO {
  email: string
  password: string
}

export interface LoginResult {
  user: User
}

export class LoginUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: LoginDTO): Promise<LoginResult> {
    // 1. Validar inputs antes de llamar al servicio externo
    if (!dto.email || dto.email.trim().length === 0) {
      throw ValidationDomainError.required('email')
    }
    if (!dto.password || dto.password.trim().length === 0) {
      throw ValidationDomainError.required('password')
    }

    // 2. Validar formato de email (value object)
    const email = Email.create(dto.email) // lanza si formato inválido

    // 3. Delegar autenticación al servicio
    // El servicio puede lanzar AuthDomainError si las credenciales son inválidas
    const authUser = await this.authService.signIn(email.value, dto.password)

    // 4. Cargar el perfil completo del usuario desde el repositorio
    const user = (await this.userRepository.findById(authUser.id)) ?? authUser

    // 5. Publicar evento de dominio
    this.eventBus.publish({
      type: DomainEvents.USER_LOGGED_IN,
      timestamp: new Date(),
      payload: { userId: user.id.value }
    })

    return { user }
  }
}
