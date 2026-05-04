import { storeToRefs } from 'pinia'
import { usePostsStore } from '../stores/posts.store'
import type { CreatePostInput } from '../validators/PostValidator'

/**
 * usePosts
 * Composable para gestionar el feed y las publicaciones.
 */
export function usePosts() {
  const store = usePostsStore()
  const { feed, loading, error, hasMore } = storeToRefs(store)

  const fetchFeed = async (refresh = false) => {
    await store.fetchFeed(refresh)
  }

  const createPost = async (input: CreatePostInput) => {
    return await store.createPost(input)
  }

  const toggleLike = async (postId: string) => {
    await store.toggleLike(postId)
  }

  const deletePost = async (postId: string) => {
    await store.deletePost(postId)
  }

  return {
    posts: feed,
    loading,
    error,
    hasMore,
    fetchFeed,
    createPost,
    toggleLike,
    deletePost
  }
}
