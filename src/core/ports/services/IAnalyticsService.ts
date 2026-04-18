/**
 * IAnalyticsService — Contrato del servicio de analíticas.
 * Desacopla el dominio de cualquier proveedor de analytics (GA4, Mixpanel, etc).
 */

export type AnalyticsEventName =
  | 'post_created'
  | 'post_liked'
  | 'post_shared'
  | 'post_deleted'
  | 'user_followed'
  | 'user_unfollowed'
  | 'notification_read'
  | 'search_performed'
  | 'profile_viewed'
  | 'login'
  | 'logout'
  | 'register'

export interface AnalyticsEventParams {
  [key: string]: string | number | boolean | null | undefined
}

export interface IAnalyticsService {
  /**
   * Registra un evento de usuario.
   * @param eventName - Nombre del evento (usar constantes AnalyticsEventName)
   * @param params - Parámetros adicionales del evento
   */
  track(eventName: AnalyticsEventName | string, params?: AnalyticsEventParams): void

  /**
   * Asocia el session analytics al usuario autenticado.
   */
  setUser(userId: string): void

  /**
   * Limpia el usuario asociado (llamar en logout).
   */
  clearUser(): void

  /**
   * Establece una propiedad de usuario persistente.
   */
  setUserProperty(key: string, value: string | null): void

  /**
   * Registra la visualización de una pantalla/página.
   */
  trackScreenView(screenName: string): void
}
