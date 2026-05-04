import { onUnmounted } from 'vue'
import { usePostsStore } from '../stores/posts.store'
import { container } from '../../dependency-injection'
import type { IPostRepository } from '../../core/ports/repositories/IPostRepository'
import { PostMapper } from '../mappers/PostMapper'
import { useAuthStore } from '../stores/auth.store'

/**
 * useRealtimeFeed
 * Suscribe la UI a cambios en tiempo real del feed.
 */
export function useRealtimeFeed() {
  const store = usePostsStore()
  const authStore = useAuthStore()
  let unsubscribe: (() => void) | null = null

  const startListening = () => {
    const userId = authStore.currentUserId
    if (!userId) return

    const repository = container.get<IPostRepository>('IPostRepository')

    // Asumiendo que el repositorio tiene un método listenFeed
    if ((repository as any).listenFeed) {
      unsubscribe = (repository as any).listenFeed(userId, (domainPosts: any[]) => {
        const plainPosts = PostMapper.toPlainList(domainPosts)
        // Actualizar el store con los nuevos datos en tiempo real
        // En una implementación real, esto podría ser un append inteligente o reemplazo de IDs existentes
        ;(store as any)._feed = plainPosts
      })
    }
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  onUnmounted(() => {
    stopListening()
  })

  return {
    startListening,
    stopListening
  }
}
