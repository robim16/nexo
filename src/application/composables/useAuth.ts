import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/auth.store';
import type { LoginInput, RegisterInput } from '../validators/AuthValidator';
import { onMounted } from 'vue';

/**
 * useAuth
 * Composable para interactuar con el estado de autenticación de forma sencilla.
 */
export function useAuth() {
  const store = useAuthStore();
  const { user, loading, error, isAuthenticated, isInitialized } = storeToRefs(store);

  const login = async (input: LoginInput) => {
    return await store.login(input);
  };

  const register = async (input: RegisterInput) => {
    return await store.register(input);
  };

  const logout = async () => {
    await store.logout();
  };

  // Autoinicializar si es necesario
  onMounted(() => {
    if (!isInitialized.value) {
      store.initAuth();
    }
  });

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isInitialized,
    login,
    register,
    logout
  };
}
