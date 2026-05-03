/**
 * IAuthService — Contrato del servicio de autenticación.
 * Implementado por FirebaseAuthService en infraestructura.
 * El dominio no sabe qué proveedor de auth se usa.
 */
import { User } from '../../entities/User'

/** Callback para cambios de estado de autenticación */
export type AuthStateCallback = (user: User | null) => void

/** Función para cancelar la escucha de cambios de auth */
export type AuthUnsubscribe = () => void

export interface IAuthService {
  /**
   * Inicia sesión con email y contraseña.
   * @throws AuthDomainError si las credenciales son inválidas
   */
  signIn(email: string, password: string): Promise<User>

  /**
   * Registra un nuevo usuario.
   * @throws AuthDomainError si el email ya está en uso o la contraseña es débil
   */
  signUp(email: string, password: string, displayName: string): Promise<User>

  /**
   * Inicia sesión con Google (OAuth popup).
   */
  signInWithGoogle(): Promise<User>

  /**
   * Cierra la sesión del usuario actual.
   */
  signOut(): Promise<void>

  /**
   * Envía un email de restablecimiento de contraseña.
   * @throws AuthDomainError si el email no existe
   */
  resetPassword(email: string): Promise<void>

  /**
   * Suscripción a cambios de estado de autenticación.
   * Llama al callback inmediatamente con el estado actual.
   * Retorna función para cancelar la suscripción.
   */
  onAuthStateChanged(callback: AuthStateCallback): AuthUnsubscribe

  /**
   * Obtiene el ID del usuario actualmente autenticado.
   * Retorna null si no hay sesión.
   */
  getCurrentUserId(): string | null

  /**
   * Actualiza la contraseña del usuario actual.
   * @throws AuthDomainError si la contraseña es débil o requiere re-autenticación
   */
  updatePassword(newPassword: string): Promise<void>

  /**
   * Verifica si hay una sesión activa.
   */
  isAuthenticated(): boolean
}
