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
  const myFollowingIds = ref<string[]>([]);
  const error = ref<string | null>(null);
  const profileSubscriptions = ref<Record<string, () => void>>({});

  // --- Acciones ---

  /**
   * Suscribe a los cambios de un perfil en tiempo real.
   */
  function subscribeToProfile(userId: string) {
    // Si ya estamos suscritos, no hacer nada
    if (profileSubscriptions.value[userId]) return;

    try {
      const userRepository = container.get<IUserRepository>('IUserRepository');
      const domainId = UserId.reconstitute(userId);

      const unsubscribe = userRepository.subscribeToUser(domainId, (domainUser) => {
        if (domainUser) {
          const plainUser = UserMapper.toPlain(domainUser);
          
          // Mantener los contadores que ya tenemos si el documento no los tiene actualizados
          // o simplemente confiar en el documento si la infraestructura los actualiza ahí.
          // En este proyecto, updateCounters actualiza el documento de usuario.
          
          profiles.value[userId] = {
            ...profiles.value[userId],
            ...plainUser
          };

          // Si es el usuario actual, actualizar también el auth store
          if (authStore.user?.id === userId) {
            Object.assign(authStore.user, plainUser);
          }
        }
      });

      profileSubscriptions.value[userId] = unsubscribe;
    } catch (err) {
      console.error(`Error subscribing to profile ${userId}:`, err);
    }
  }

  /**
   * Cancela la suscripción a un perfil.
   */
  function unsubscribeFromProfile(userId: string) {
    if (profileSubscriptions.value[userId]) {
      profileSubscriptions.value[userId]();
      delete profileSubscriptions.value[userId];
    }
  }

  /**
   * Cancela todas las suscripciones de perfiles.
   */
  function clearProfileSubscriptions() {
    Object.values(profileSubscriptions.value).forEach(unsub => unsub());
    profileSubscriptions.value = {};
  }

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
      
      // Sincronizar los contadores en Firestore si son diferentes (reparación de datos)
      if (domainUser.followersCount !== followersCount || 
          domainUser.followingCount !== followingCount || 
          domainUser.postsCount !== postsCount) {
        userRepository.updateCounters(domainId, { 
          followersCount: followersCount - (domainUser.followersCount || 0),
          followingCount: followingCount - (domainUser.followingCount || 0),
          postsCount: postsCount - (domainUser.postsCount || 0)
        }).catch(err => console.error('Error repairing counters:', err));
      }
      
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

  async function checkIsFollowing(targetUserId: string) {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId || currentUserId === targetUserId) {
      isFollowingProfile.value = false;
      return false;
    }

    try {
      const repository = container.get<any>('IFollowRepository');
      const result = await repository.isFollowing(UserId.reconstitute(currentUserId), UserId.reconstitute(targetUserId));
      
      // Update local cache
      if (result) {
        if (!myFollowingIds.value.includes(targetUserId)) {
          myFollowingIds.value.push(targetUserId);
        }
      } else {
        myFollowingIds.value = myFollowingIds.value.filter(id => id !== targetUserId);
      }
      
      isFollowingProfile.value = result;
      return result;
    } catch (err) {
      console.error('Error checking follow status:', err);
      return false;
    }
  }

  /**
   * Carga todos los IDs que el usuario actual sigue.
   */
  async function fetchMyFollowingIds() {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId) return;

    try {
      const repository = container.get<any>('IFollowRepository');
      const ids = await repository.getFollowingIds(UserId.reconstitute(currentUserId));
      myFollowingIds.value = ids;
    } catch (err) {
      console.error('Error fetching my following IDs:', err);
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
      if (!myFollowingIds.value.includes(targetUserId)) {
        myFollowingIds.value.push(targetUserId);
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
      myFollowingIds.value = myFollowingIds.value.filter(id => id !== targetUserId);
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

  /**
   * Actualiza el perfil del usuario (avatar, nombre, bio).
   */
  async function updateProfile(data: { 
    avatarFile?: File, 
    displayName?: string, 
    bio?: string,
    onProgress?: (percent: number) => void 
  }) {
    const currentUserId = authStore.currentUserId;
    if (!currentUserId) throw new Error('Usuario no autenticado');

    loading.value = true;
    error.value = null;

    try {
      const useCase = container.get<any>('UpdateUserProfileUseCase');
      const result = await useCase.execute({
        userId: currentUserId,
        avatarFile: data.avatarFile,
        displayName: data.displayName,
        bio: data.bio,
        onUploadProgress: data.onProgress
      });

      // Actualizar el perfil en memoria si existe
      if (profiles.value[currentUserId]) {
        if (result.avatarUrl) profiles.value[currentUserId].avatar = result.avatarUrl;
        if (data.displayName !== undefined) profiles.value[currentUserId].displayName = data.displayName;
        if (data.bio !== undefined) profiles.value[currentUserId].bio = data.bio;
      }
      
      // Actualizar el usuario del Auth store
      if (authStore.user) {
        if (result.avatarUrl) authStore.user.avatar = result.avatarUrl;
        if (data.displayName !== undefined) authStore.user.displayName = data.displayName;
        if (data.bio !== undefined) authStore.user.bio = data.bio;
      }
      
      return result;
    } catch (err: any) {
      error.value = err.message || 'Error al actualizar el perfil';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  /**
   * Actualiza el avatar del usuario autenticado (legacy/shortcut).
   */
  async function updateAvatar(file: File, onProgress?: (percent: number) => void) {
    return updateProfile({ avatarFile: file, onProgress });
  }

  return {
    profiles,
    loading,
    suggestedUsers,
    followers,
    following,
    isFollowingProfile,
    myFollowingIds,
    error,
    fetchProfile,
    fetchFollowers,
    fetchFollowing,
    checkIsFollowing,
    fetchMyFollowingIds,
    followUser,
    unfollowUser,
    fetchSuggestedUsers,
    updateAvatar,
    updateProfile,
    subscribeToProfile,
    unsubscribeFromProfile,
    clearProfileSubscriptions
  };
});
