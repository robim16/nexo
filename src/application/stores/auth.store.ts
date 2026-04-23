import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserPlainObject } from '../../core/entities/User';
import type { LoginUseCase } from '../../core/use-cases/auth/LoginUseCase';
import type { RegisterUseCase } from '../../core/use-cases/auth/RegisterUseCase';
import type { LogoutUseCase } from '../../core/use-cases/auth/LogoutUseCase';
import type { IAuthService } from '../../core/ports/services/IAuthService';
import { container } from '../../dependency-injection';
import { UserMapper } from '../mappers/UserMapper';
import { LoginSchema, RegisterSchema, type LoginInput, type RegisterInput } from '../validators/AuthValidator';

export const useAuthStore = defineStore('auth', () => {
  // --- Estado ---
  const user = ref<UserPlainObject | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  // --- Getters ---
  const isAuthenticated = computed(() => !!user.value);
  const currentUserId = computed(() => user.value?.id || null);

  // --- Acciones ---

  /**
   * Inicializa el listener de autenticación de Firebase.
   */
  async function initAuth() {
    if (isInitialized.value) return;
    
    const authService = container.get<IAuthService>('IAuthService');
    // Importación local para evitar dependencias circulares si las hubiera
    const { IUserRepository } = await import('../../core/ports/repositories/IUserRepository').catch(() => ({ IUserRepository: null }));
    const userRepository = container.get<any>('IUserRepository');
    
    authService.onAuthStateChanged(async (domainUser) => {
      if (domainUser) {
        try {
          // Obtener el usuario completo de la base de datos (con avatar, contadores, etc.)
          const fullUser = await userRepository.findById(domainUser.id);
          user.value = UserMapper.toPlain(fullUser || domainUser);
        } catch (err) {
          console.error("Error fetching full user profile:", err);
          user.value = UserMapper.toPlain(domainUser);
        }
      } else {
        user.value = null;
      }
      isInitialized.value = true;
    });
  }

  /**
   * Inicia sesión con email y contraseña.
   */
  async function login(input: LoginInput) {
    loading.value = true;
    error.value = null;
    try {
      // Validar input con Zod
      LoginSchema.parse(input);

      const useCase = container.get<LoginUseCase>('LoginUseCase');
      const { user: domainUser } = await useCase.execute(input);
      
      user.value = UserMapper.toPlain(domainUser);
      return domainUser;
    } catch (err: any) {
      error.value = err.message || 'Error al iniciar sesión';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Registra un nuevo usuario.
   */
  async function register(input: RegisterInput) {
    loading.value = true;
    error.value = null;
    try {
      // Validar input con Zod
      RegisterSchema.parse(input);

      const useCase = container.get<RegisterUseCase>('RegisterUseCase');
      const { user: domainUser } = await useCase.execute(input);
      
      user.value = UserMapper.toPlain(domainUser);
      return domainUser;
    } catch (err: any) {
      error.value = err.message || 'Error al registrarse';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Cierra la sesión.
   */
  async function logout() {
    loading.value = true;
    try {
      const useCase = container.get<LogoutUseCase>('LogoutUseCase');
      await useCase.execute();
      user.value = null;
    } catch (err: any) {
      error.value = err.message || 'Error al cerrar sesión';
      throw err;
    } finally {
      loading.value = false;
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
    logout
  };
}, {
  persist: {
    pick: ['user'],
    storage: localStorage
  }
});
