import { ref } from 'vue'
import { useUsersStore } from '../stores/users.store'
import { useAuthStore } from '../stores/auth.store'

/**
 * useFollow
 * Gestiona el estado de seguimiento de un usuario específico.
 */
export function useFollow(targetUserId: string) {
  const usersStore = useUsersStore()
  const authStore = useAuthStore()
  const loading = ref(false)

  const isFollowing = ref(false) // Podría venir de una lista global en usersStore

  const toggleFollow = async () => {
    loading.value = true
    try {
      if (isFollowing.value) {
        await usersStore.unfollowUser(targetUserId)
        isFollowing.value = false
      } else {
        await usersStore.followUser(targetUserId)
        isFollowing.value = true
      }
    } catch (error) {
      console.error('Error in useFollow:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    isFollowing,
    loading,
    toggleFollow
  }
}
