/**
 * RegisterUseCase — Caso de uso: registrar un nuevo usuario.
 * Orquesta: validación → auth service → crear entidad → persistir → evento.
 */
import { IAuthService } from '../../ports/services/IAuthService'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { DomainEvents, UserRegisteredPayload } from '../../ports/events/DomainEvents'
import { User } from '../../entities/User'
import { Email } from '../../value-objects/Email'
import { DisplayName } from '../../value-objects/DisplayName'
import { ValidationDomainError } from '../../errors/ValidationDomainError'
import { AuthDomainError } from '../../errors/AuthDomainError'

export interface RegisterDTO {
  email: string
  password: string
  displayName: string
}

export interface RegisterResult {
  user: User
}

const MIN_PASSWORD_LENGTH = 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export class RegisterUseCase {
  constructor(
    private readonly authService: IAuthService,
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: RegisterDTO): Promise<RegisterResult> {
    // 1. Validar y crear value objects (lanza ValidationDomainError si fallan)
    const email = Email.create(dto.email)
    const displayName = DisplayName.create(dto.displayName)

    // 2. Validar contraseña (mínimo 8 chars, 1 mayúscula, 1 número)
    this.validatePassword(dto.password)

    // 3. Verificar que el email no está ya registrado
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw AuthDomainError.emailAlreadyExists(email.value)
    }

    // 4. Crear cuenta en el servicio de autenticación
    const authUser = await this.authService.signUp(email.value, dto.password, displayName.value)

    // 5. Crear entidad de dominio completa
    const user = User.create({
      id: authUser.id.value,
      email: email.value,
      displayName: displayName.value
    })

    // 6. Persistir perfil en el repositorio
    await this.userRepository.save(user)

    // 7. Publicar evento de dominio
    const payload: UserRegisteredPayload = {
      userId: user.id.value,
      email: email.value,
      displayName: displayName.value
    }

    this.eventBus.publish({
      type: DomainEvents.USER_REGISTERED,
      timestamp: new Date(),
      payload
    })

    return { user }
  }

  private validatePassword(password: string): void {
    if (!password || password.length === 0) {
      throw ValidationDomainError.required('password')
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw ValidationDomainError.tooShort('password', MIN_PASSWORD_LENGTH, password)
    }
    if (!PASSWORD_REGEX.test(password)) {
      throw AuthDomainError.weakPassword()
    }
  }
}
