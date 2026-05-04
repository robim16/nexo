import type { Router } from 'vue-router'
// Importaremos el store asumiendo que el Agente 3 usó convenciones estándar de Pinia
import { useAuthStore } from '@/application/stores/auth.store'

export function setupGuards(router: Router) {
  router.beforeEach(async (to, from, next) => {
    // Al instanciar aqui, nos aseguramos que Pinia ya esté inicializado
    const authStore = useAuthStore()

    // Si la app está comprobando el estado inicial auth (ej. Firebase onAuthStateChanged)
    if (!authStore.isInitialized) {
      await authStore.initAuth()
    }

    const isAuthenticated = authStore.isAuthenticated
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

    if (requiresAuth && !isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (requiresGuest && isAuthenticated) {
      next({ name: 'Home' })
    } else {
      next()
    }
  })
}
