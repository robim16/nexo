import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserPlainObject } from '../../core/entities/User'
import type { LoginUseCase } from '../../core/use-cases/auth/LoginUseCase'
import type { RegisterUseCase } from '../../core/use-cases/auth/RegisterUseCase'
import type { UpdatePasswordUseCase } from '../../core/use-cases/auth/UpdatePasswordUseCase'
import type { LogoutUseCase } from '../../core/use-cases/auth/LogoutUseCase'
import type { IAuthService } from '../../core/ports/services/IAuthService'
import { container } from '../../dependency-injection'
import { UserMapper } from '../mappers/UserMapper'
import { useUsersStore } from './users.store'
import {
  LoginSchema,
  RegisterSchema,
  type LoginInput,
  type RegisterInput
} from '../validators/AuthValidator'

export const useAuthStore = defineStore(
  'auth',
  () => {
    // --- Estado ---
    const user = ref<UserPlainObject | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const isInitialized = ref(false)

    // --- Getters ---
    const isAuthenticated = computed(() => !!user.value)
    const currentUserId = computed(() => user.value?.id || null)

    // --- Acciones ---

    let initPromise: Promise<void> | null = null

    /**
     * Inicializa el listener de autenticación de Firebase.
     * Retorna una promesa que se resuelve cuando se ha verificado el estado inicial.
     */
    function initAuth(): Promise<void> {
      if (isInitialized.value) return Promise.resolve()
      if (initPromise) return initPromise

      initPromise = new Promise((resolve) => {
        const authService = container.get<IAuthService>('IAuthService')
        const userRepository = container.get<any>('IUserRepository')

        authService.onAuthStateChanged(async (domainUser) => {
          if (domainUser) {
            try {
              const fullUser = await userRepository.findById(domainUser.id)
              user.value = UserMapper.toPlain(fullUser || domainUser)

              const usersStore = useUsersStore()
              await usersStore.fetchMyFollowingIds()
            } catch (err) {
              console.error('Error fetching full user profile:', err)
              user.value = UserMapper.toPlain(domainUser)
            }
          } else {
            user.value = null
          }

          isInitialized.value = true
          resolve()
        })
      })

      return initPromise
    }

    /**
     * Inicia sesión con email y contraseña.
     */
    async function login(input: LoginInput) {
      loading.value = true
      error.value = null
      try {
        // Validar input con Zod
        LoginSchema.parse(input)

        const useCase = container.get<LoginUseCase>('LoginUseCase')
        const { user: domainUser } = await useCase.execute(input)

        user.value = UserMapper.toPlain(domainUser)

        const usersStore = useUsersStore()
        await usersStore.fetchMyFollowingIds()

        return domainUser
      } catch (err: any) {
        error.value = err.message || 'Error al iniciar sesión'
        throw err
      } finally {
        loading.value = false
      }
    }

    /**
     * Registra un nuevo usuario.
     */
    async function register(input: RegisterInput) {
      loading.value = true
      error.value = null
      try {
        // Validar input con Zod
        RegisterSchema.parse(input)

        const useCase = container.get<RegisterUseCase>('RegisterUseCase')
        const { user: domainUser } = await useCase.execute(input)

        user.value = UserMapper.toPlain(domainUser)

        const usersStore = useUsersStore()
        await usersStore.fetchMyFollowingIds()

        return domainUser
      } catch (err: any) {
        error.value = err.message || 'Error al registrarse'
        throw err
      } finally {
        loading.value = false
      }
    }

    /**
     * Cierra la sesión.
     */
    async function logout() {
      if (!user.value) return

      const userId = user.value.id
      loading.value = true
      try {
        const useCase = container.get<LogoutUseCase>('LogoutUseCase')
        await useCase.execute({ userId })

        // Limpiar suscripciones y estado
        const usersStore = useUsersStore()
        const postsStore = (await import('./posts.store')).usePostsStore()
        const notificationsStore = (await import('./notifications.store')).useNotificationsStore()

        usersStore.clearProfileSubscriptions()
        postsStore.unsubscribe()
        notificationsStore.unsubscribe()

        user.value = null
      } catch (err: any) {
        error.value = err.message || 'Error al cerrar sesión'
        throw err
      } finally {
        loading.value = false
      }
    }

    /**
     * Actualiza la contraseña del usuario.
     */
    async function updatePassword(newPassword: string) {
      loading.value = true
      error.value = null
      try {
        const useCase = container.get<UpdatePasswordUseCase>('UpdatePasswordUseCase')
        await useCase.execute({ newPassword })
      } catch (err: any) {
        error.value = err.message || 'Error al actualizar contraseña'
        throw err
      } finally {
        loading.value = false
      }
    }

    return {
      user,
      loading,
      error,
      isAuthenticated,
      currentUserId,
      isInitialized,
      initAuth,
      login,
      register,
      logout,
      updatePassword
    }
  },
  {
    persist: {
      paths: ['user'],
      storage: localStorage
    }
  }
)
