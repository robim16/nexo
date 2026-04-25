import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserPlainObject } from '../../core/entities/User';
import type { IUserRepository } from '../../core/ports/repositories/IUserRepository';
import type { FollowUserUseCase } from '../../core/use-cases/social/FollowUserUseCase';
import type { UnfollowUserUseCase } from '../../core/use-cases/social/UnfollowUserUseCase';
import type { GetSuggestedUsersUseCase } from '../../core/use-cases/social/GetSuggestedUsersUseCase';
import { container } from '../../dependency-injection';
import { UserMapper } from '../mappers/UserMapper';
import { useAuthStore } from './auth.store';
import { UserId } from '../../core/value-objects/UserId';

export const useUsersStore = defineStore('users', () => {
  const authStore = useAuthStore();

  // --- Estado ---
  const profiles = ref<Record<string, UserPlainObject>>({});
  const loading = ref(false);
  const suggestedUsers = ref<UserPlainObject[]>([]);
  const followers = ref<UserPlainObject[]>([]);
  const following = ref<UserPlainObject[]>([]);
  const isFollowingProfile = ref(false);
  const error = ref<string | null>(null);

  // --- Acciones ---

  /**
   * Obtiene el perfil de un usuario por ID.
   */
  async function fetchProfile(userId: string) {
    loading.value = true;
    try {
      const userRepository = container.get<IUserRepository>('IUserRepository');
      const followRepository = container.get<any>('IFollowRepository');
      const postRepository = container.get<any>('IPostRepository');
      
      const domainId = UserId.reconstitute(userId);
      const domainUser = await userRepository.findById(domainId);
      
      if (!domainUser) throw new Error('Usuario no encontrado');

      // Fetch real counts from collections
      const [followersCount, followingCount, postsCount] = await Promise.all([
        followRepository.countFollowers(domainId),
        followRepository.countFollowing(domainId),
        postRepository.countPosts(domainId)
      ]);

      const plainUser = UserMapper.toPlain(domainUser);
      // Override with real counts
      plainUser.followersCount = followersCount;
      plainUser.followingCount = followingCount;
      plainUser.postsCount = postsCount;

      profiles.value[userId] = plainUser;
      
      // Si es el usuario actual, actualizar también el auth store para coherencia
      if (authStore.user?.id === userId) {
        authStore.user.followersCount = followersCount;
        authStore.user.followingCount = followingCount;
        authStore.user.postsCount = postsCount;
      }

      return plainUser;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar el perfil';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene la lista de seguidores de un usuario.
   */
  async function fetchFollowers(userId: string) {
    loading.value = true;
    try {
      const useCase = container.get<any>('GetFollowersUseCase');
      const domainUsers = await useCase.execute({ userId });
      followers.value = domainUsers.map((u: any) => UserMapper.toPlain(u));
    } catch (err: any) {
      console.error('Error fetching followers:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Obtiene la lista de usuarios seguidos por un usuario.
   */
  async function fetchFollowing(userId: string) {
    loading.value = true;
    try {
      const useCase = container.get<any>('GetFollowingUseCase');
      const domainUsers = await useCase.execute({ userId });
      following.value = domainUsers.map((u: any) => UserMapper.toPlain(u));
    } catch (err: any) {
      console.error('Error fetching following:', err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Verifica si el usuario actual sigue a otro.
   */
  async function checkIsFollowing(targetUserId: string) {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId || currentUserId === targetUserId) {
      isFollowingProfile.value = false;
      return false;
    }

    try {
      const repository = container.get<any>('IFollowRepository');
      const result = await repository.isFollowing(UserId.reconstitute(currentUserId), UserId.reconstitute(targetUserId));
      isFollowingProfile.value = result;
      return result;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  }

  /**
   * Sigue a un usuario.
   */
  async function followUser(targetUserId: string) {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId || currentUserId === targetUserId) return;

    const useCase = container.get<FollowUserUseCase>('FollowUserUseCase');
    try {
      await useCase.execute({ followerId: currentUserId, followingId: targetUserId });
      
      // Actualizar contadores localmente si están en caché
      if (profiles.value[targetUserId]) {
        profiles.value[targetUserId].followersCount++;
      }
      if (authStore.user) {
        authStore.user.followingCount++;
      }
      isFollowingProfile.value = true;
    } catch (err: any) {
      error.value = err.message || 'Error al seguir al usuario';
      throw err;
    }
  }

  /**
   * Deja de seguir a un usuario.
   */
  async function unfollowUser(targetUserId: string) {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId) return;

    const useCase = container.get<UnfollowUserUseCase>('UnfollowUserUseCase');
    try {
      await useCase.execute({ followerId: currentUserId, followingId: targetUserId });

      // Actualizar contadores localmente
      if (profiles.value[targetUserId]) {
        profiles.value[targetUserId].followersCount = Math.max(0, profiles.value[targetUserId].followersCount - 1);
      }
      if (authStore.user) {
        authStore.user.followingCount = Math.max(0, authStore.user.followingCount - 1);
      }
      isFollowingProfile.value = false;
    } catch (err: any) {
      error.value = err.message || 'Error al dejar de seguir al usuario';
      throw err;
    }
  }

  /**
   * Obtiene sugerencias de usuarios para seguir.
   */
  async function fetchSuggestedUsers(limit = 3) {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId) return;

    try {
      const useCase = container.get<GetSuggestedUsersUseCase>('GetSuggestedUsersUseCase');
      const domainUsers = await useCase.execute({ currentUserId, limit });
      suggestedUsers.value = domainUsers.map(u => UserMapper.toPlain(u));
    } catch (err: any) {
      console.error('Error fetching suggested users:', err);
    }
  }

  return {
    profiles,
    loading,
    suggestedUsers,
    followers,
    following,
    isFollowingProfile,
    error,
    fetchProfile,
    fetchFollowers,
    fetchFollowing,
    checkIsFollowing,
    followUser,
    unfollowUser,
    fetchSuggestedUsers
  };
});
