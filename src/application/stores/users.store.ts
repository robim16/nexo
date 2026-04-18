import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserPlainObject } from '../../core/entities/User';
import type { IUserRepository } from '../../core/ports/repositories/IUserRepository';
import type { FollowUserUseCase } from '../../core/use-cases/social/FollowUserUseCase';
import type { UnfollowUserUseCase } from '../../core/use-cases/social/UnfollowUserUseCase';
import { container } from '../../dependency-injection';
import { UserMapper } from '../mappers/UserMapper';
import { useAuthStore } from './auth.store';
import { UserId } from '../../core/value-objects/UserId';

export const useUsersStore = defineStore('users', () => {
  const authStore = useAuthStore();

  // --- Estado ---
  const profiles = ref<Record<string, UserPlainObject>>({});
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Acciones ---

  /**
   * Obtiene el perfil de un usuario por ID.
   */
  async function fetchProfile(userId: string) {
    if (profiles.value[userId]) return profiles.value[userId];

    loading.value = true;
    try {
      const repository = container.get<IUserRepository>('IUserRepository');
      const domainUser = await repository.findById(UserId.reconstitute(userId));
      
      if (!domainUser) throw new Error('Usuario no encontrado');

      const plainUser = UserMapper.toPlain(domainUser);
      profiles.value[userId] = plainUser;
      return plainUser;
    } catch (err: any) {
      error.value = err.message || 'Error al cargar el perfil';
      throw err;
    } finally {
      loading.value = false;
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
      await useCase.execute({ followerId: currentUserId, followedId: targetUserId });
      
      // Actualizar contadores localmente si están en caché
      if (profiles.value[targetUserId]) {
        profiles.value[targetUserId].followersCount++;
      }
      if (authStore.user) {
        authStore.user.followingCount++;
      }
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
      await useCase.execute({ followerId: currentUserId, followedId: targetUserId });

      // Actualizar contadores localmente
      if (profiles.value[targetUserId]) {
        profiles.value[targetUserId].followersCount = Math.max(0, profiles.value[targetUserId].followersCount - 1);
      }
      if (authStore.user) {
        authStore.user.followingCount = Math.max(0, authStore.user.followingCount - 1);
      }
    } catch (err: any) {
      error.value = err.message || 'Error al dejar de seguir al usuario';
      throw err;
    }
  }

  return {
    profiles,
    loading,
    error,
    fetchProfile,
    followUser,
    unfollowUser
  };
});
