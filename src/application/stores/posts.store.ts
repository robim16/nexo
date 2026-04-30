import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PostPlainObject } from '../../core/entities/Post';
import type { CreatePostUseCase } from '../../core/use-cases/posts/CreatePostUseCase';
import type { GetFeedUseCase } from '../../core/use-cases/posts/GetFeedUseCase';
import type { LikePostUseCase } from '../../core/use-cases/posts/LikePostUseCase';
import type { DeletePostUseCase } from '../../core/use-cases/posts/DeletePostUseCase';
import type { EditPostUseCase } from '../../core/use-cases/posts/EditPostUseCase';
import { container } from '../../dependency-injection';
import { PostMapper } from '../mappers/PostMapper';
import { CreatePostSchema, type CreatePostInput } from '../validators/PostValidator';
import { useAuthStore } from './auth.store';
import { UserId } from '../../core/value-objects/UserId';

export const usePostsStore = defineStore('posts', () => {
  const authStore = useAuthStore();

  // --- Estado ---
  const feed = ref<PostPlainObject[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const lastDoc = ref<any>(null); // Para paginación Firebase
  const feedSubscription = ref<(() => void) | null>(null);

  // --- Getters ---
  const sortedFeed = computed(() => 
    [...feed.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  // --- Acciones ---

  /**
   * Suscribe al feed de publicaciones en tiempo real.
   */
  async function subscribeToFeed() {
    if (feedSubscription.value) feedSubscription.value();

    try {
      const postRepository = container.get<any>('IPostRepository');
      const followRepository = container.get<any>('IFollowRepository');
      const userId = authStore.currentUserId;
      
      if (!userId) return;

      const followingIds = await followRepository.getFollowingIds(UserId.reconstitute(userId));
      // Incluir al propio usuario en su feed
      const allIds = [...followingIds, userId];

      const unsubscribe = postRepository.subscribeToFeed(allIds, (posts: any[]) => {
        feed.value = PostMapper.toPlainList(posts);
        hasMore.value = false; // El modo suscripción usualmente carga los más recientes
      });

      feedSubscription.value = unsubscribe;
    } catch (err) {
      console.error('Error subscribing to feed:', err);
    }
  }

  /**
   * Suscribe a las publicaciones de un usuario específico en tiempo real.
   */
  function subscribeToUserPosts(userId: string) {
    if (feedSubscription.value) feedSubscription.value();

    try {
      const postRepository = container.get<any>('IPostRepository');
      const unsubscribe = postRepository.subscribeToUserPosts(UserId.reconstitute(userId), (posts: any[]) => {
        feed.value = PostMapper.toPlainList(posts);
        hasMore.value = false;
      });

      feedSubscription.value = unsubscribe;
    } catch (err) {
      console.error('Error subscribing to user posts:', err);
    }
  }

  /**
   * Cancela la suscripción actual.
   */
  function unsubscribe() {
    if (feedSubscription.value) {
      feedSubscription.value();
      feedSubscription.value = null;
    }
  }

  /**
   * Carga las publicaciones de un usuario específico.
   */
  async function fetchUserPosts(userId: string, refresh = true) {
    if (loading.value && !refresh) return;

    loading.value = true;
    error.value = null;

    try {
      const useCase = container.get<any>('GetUserPostsUseCase');
      const result = await useCase.execute({
        userId,
        limit: 20
      });

      if (refresh) {
        feed.value = PostMapper.toPlainList(result.posts);
      } else {
        const newPosts = PostMapper.toPlainList(result.posts);
        const existingIds = new Set(feed.value.map(p => p.id));
        feed.value.push(...newPosts.filter((p: any) => !existingIds.has(p.id)));
      }
      
      hasMore.value = result.hasMore;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar las publicaciones del usuario';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Carga el feed de publicaciones.
   */
  async function fetchFeed(refresh = false) {
    if (loading.value || (!hasMore.value && !refresh)) return;

    loading.value = true;
    error.value = null;

    try {
      const useCase = container.get<GetFeedUseCase>('GetFeedUseCase');
      const userId = authStore.currentUserId;
      
      if (!userId) throw new Error('Usuario no autenticado');

      // En una implementación real, pasaríamos el ID del último post para paginación
      const result = await useCase.execute({
        userId,
        limit: 10,
        // lastPostId: refresh ? undefined : feed.value[feed.value.length - 1]?.id
      });

      if (refresh) {
        feed.value = PostMapper.toPlainList(result.posts);
      } else {
        const newPosts = PostMapper.toPlainList(result.posts);
        // Evitar duplicados
        const existingIds = new Set(feed.value.map(p => p.id));
        feed.value.push(...newPosts.filter(p => !existingIds.has(p.id)));
      }

      hasMore.value = result.hasMore;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar el feed';
    } finally {
      loading.value = false;
    }
  }

  /**
   * Crea una nueva publicación.
   */
  async function createPost(input: CreatePostInput) {
    loading.value = true;
    try {
      CreatePostSchema.parse(input);

      const useCase = container.get<CreatePostUseCase>('CreatePostUseCase');
      const userId = authStore.currentUserId;
      if (!userId) throw new Error('Usuario no autenticado');

      const result = await useCase.execute({
        userId,
        content: input.content,
        images: input.images,
        visibility: input.visibility
      });

      const plainPost = PostMapper.toPlain(result.post);
      feed.value.unshift(plainPost);
      
      // Actualizar tendencias si el post es público
      if (plainPost.visibility === 'public') {
        fetchTrendingTags();
      }
      
      return plainPost;
    } catch (err: any) {
      error.value = err.message || 'Error al crear la publicación';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Da o quita like a una publicación.
   */
  async function toggleLike(postId: string) {
    const postIndex = feed.value.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const userId = authStore.currentUserId;
    if (!userId) return;

    const useCase = container.get<LikePostUseCase>('LikePostUseCase');
    
    // Actualización optimista
    const post = feed.value[postIndex];
    const originalLikes = [...post.likes];
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter(id => id !== userId);
      post.likesCount--;
    } else {
      post.likes.push(userId);
      post.likesCount++;
    }

    try {
      await useCase.execute({ postId, userId });
    } catch (err) {
      // Rollback
      feed.value[postIndex].likes = originalLikes;
      feed.value[postIndex].likesCount = originalLikes.length;
      throw err;
    }
  }

  /**
   * Incrementa el contador de comentarios localmente.
   */
  function incrementCommentsCount(postId: string) {
    const postIndex = feed.value.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      feed.value[postIndex].commentsCount++;
    }
  }

  const trendingTags = ref<{ tag: string; count: number }[]>([]);
  const loadingTrends = ref(false);

  /**
   * Elimina una publicación.
   */
  async function deletePost(postId: string) {
    const userId = authStore.currentUserId;
    if (!userId) return;

    const useCase = container.get<DeletePostUseCase>('DeletePostUseCase');
    try {
      await useCase.execute({ postId, requesterId: userId });
      feed.value = feed.value.filter(p => p.id !== postId);
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar la publicación';
      throw err;
    }
  }

  /**
   * Carga los hashtags populares.
   */
  async function fetchTrendingTags() {
    loadingTrends.value = true;
    try {
      const useCase = container.get<any>('GetTrendingHashtagsUseCase');
      trendingTags.value = await useCase.execute({ limit: 5 });
    } catch (err) {
      console.error('Error fetching trends:', err);
    } finally {
      loadingTrends.value = false;
    }
  }

  return {
    feed: sortedFeed,
    trendingTags,
    loading,
    loadingTrends,
    error,
    hasMore,
    fetchFeed,
    fetchUserPosts,
    fetchTrendingTags,
    createPost,
    toggleLike,
    incrementCommentsCount,
    deletePost,
    subscribeToFeed,
    subscribeToUserPosts,
    unsubscribe
  };
});
