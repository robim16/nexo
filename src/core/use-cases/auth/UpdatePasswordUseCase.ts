import { IAuthService } from '../../ports/services/IAuthService'
import { ValidationDomainError } from '../../errors/ValidationDomainError'
import { AuthDomainError } from '../../errors/AuthDomainError'

export interface UpdatePasswordDTO {
  newPassword: string
}

const MIN_PASSWORD_LENGTH = 8
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

export class UpdatePasswordUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(dto: UpdatePasswordDTO): Promise<void> {
    // 1. Validar contraseña
    this.validatePassword(dto.newPassword)

    // 2. Actualizar contraseña en el servicio de autenticación
    await this.authService.updatePassword(dto.newPassword)
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
