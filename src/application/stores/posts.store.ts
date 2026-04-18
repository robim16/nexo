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

export const usePostsStore = defineStore('posts', () => {
  const authStore = useAuthStore();

  // --- Estado ---
  const feed = ref<PostPlainObject[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const hasMore = ref(true);
  const lastDoc = ref<any>(null); // Para paginación Firebase

  // --- Getters ---
  const sortedFeed = computed(() => 
    [...feed.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  );

  // --- Acciones ---

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
        feed.value = PostMapper.toPlainList(result);
      } else {
        const newPosts = PostMapper.toPlainList(result);
        // Evitar duplicados
        const existingIds = new Set(feed.value.map(p => p.id));
        feed.value.push(...newPosts.filter(p => !existingIds.has(p.id)));
      }

      hasMore.value = result.length === 10;
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

      const domainPost = await useCase.execute({
        userId,
        content: input.content,
        // images: input.images // Asumiendo que ya son URLs o Files
      });

      const plainPost = PostMapper.toPlain(domainPost);
      feed.value.unshift(plainPost);
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
   * Elimina una publicación.
   */
  async function deletePost(postId: string) {
    const userId = authStore.currentUserId;
    if (!userId) return;

    const useCase = container.get<DeletePostUseCase>('DeletePostUseCase');
    try {
      await useCase.execute({ postId, userId });
      feed.value = feed.value.filter(p => p.id !== postId);
    } catch (err: any) {
      error.value = err.message || 'Error al eliminar la publicación';
      throw err;
    }
  }

  return {
    feed: sortedFeed,
    loading,
    error,
    hasMore,
    fetchFeed,
    createPost,
    toggleLike,
    deletePost
  };
});
