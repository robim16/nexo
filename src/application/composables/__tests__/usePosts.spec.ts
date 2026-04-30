import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { usePosts } from '../usePosts'
import { usePostsStore } from '../../stores/posts.store'

// Mock del store
vi.mock('../../stores/posts.store', () => {
  const mockStore = {
    feed: ref([]),
    loading: ref(false),
    error: ref(null),
    hasMore: ref(true),
    fetchFeed: vi.fn(),
    createPost: vi.fn(),
    toggleLike: vi.fn(),
    deletePost: vi.fn()
  }
  return {
    usePostsStore: vi.fn(() => mockStore)
  }
})

describe('usePosts Composable', () => {
  let store: any

  beforeEach(() => {
    store = usePostsStore()
    // Reset mocks between tests
    store.fetchFeed.mockClear()
    store.createPost.mockClear()
    store.toggleLike.mockClear()
    store.deletePost.mockClear()
    store.feed.value = []
    store.loading.value = false
  })

  it('should return reactive references from store', () => {
    store.feed.value = [{ id: 'post-1', content: 'test' }]
    
    const { posts, loading } = usePosts()
    
    expect(posts.value).toHaveLength(1)
    expect(posts.value[0].id).toBe('post-1')
    expect(loading.value).toBe(false)
  })

  it('should call store fetchFeed when fetchFeed is called', async () => {
    const { fetchFeed } = usePosts()
    await fetchFeed(true)
    
    expect(store.fetchFeed).toHaveBeenCalledWith(true)
  })

  it('should call store createPost when createPost is called', async () => {
    store.createPost.mockResolvedValue({ id: 'new-post' })
    
    const { createPost } = usePosts()
    const result = await createPost({ content: 'test content', visibility: 'public' })
    
    expect(store.createPost).toHaveBeenCalledWith({ content: 'test content', visibility: 'public' })
    expect(result.id).toBe('new-post')
  })

  it('should call store toggleLike when toggleLike is called', async () => {
    const { toggleLike } = usePosts()
    await toggleLike('post-123')
    
    expect(store.toggleLike).toHaveBeenCalledWith('post-123')
  })

  it('should call store deletePost when deletePost is called', async () => {
    const { deletePost } = usePosts()
    await deletePost('post-123')
    
    expect(store.deletePost).toHaveBeenCalledWith('post-123')
  })
})
