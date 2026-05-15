<template>
  <div class="profile-header glass-wrapper">
    <div class="profile-header__cover">
      <div class="cover-overlay"></div>
      <div class="cover-glow"></div>
    </div>

    <div class="profile-header__info glass">
      <div class="header-main-row">
        <div class="avatar-wrapper">
          <div
            class="avatar-container"
            @click="triggerAvatarUpload"
            :class="{ clickable: isOwnProfile }"
          >
            <BaseAvatar
              :src="user.avatar || ''"
              :alt="user.displayName"
              size="xl"
              class="profile-avatar"
              :class="{ uploading: isUploadingAvatar }"
            />
            <div v-if="isOwnProfile" class="avatar-overlay" :class="{ active: isUploadingAvatar }">
              <span v-if="isUploadingAvatar">{{ uploadProgress }}%</span>
              <span v-else>📷</span>
            </div>
            <input
              v-if="isOwnProfile"
              type="file"
              ref="avatarInput"
              accept="image/*"
              style="display: none"
              @change="handleAvatarSelected"
            />
          </div>
          <div class="avatar-glow"></div>
        </div>

        <div class="profile-header__actions">
          <BaseButton
            v-if="isOwnProfile"
            variant="glass"
            size="md"
            @click="$router.push('/settings')"
          >
            Edit Profile
          </BaseButton>
          <FollowButton v-else :userId="user.id" :initialIsFollowing="isFollowing" />
        </div>
      </div>

      <div class="profile-details">
        <h2 class="display-name">{{ user.displayName }}</h2>
        <p class="handle">
          @{{ user.handle || user.displayName.toLowerCase().replace(/\s/g, '') }}
        </p>

        <p class="bio">{{ user.bio || 'Exploring the boundaries of the Nexo.' }}</p>

        <div class="profile-meta">
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">Joined {{ formatJoinDate(user.createdAt) }}</span>
          </div>
          <div v-if="user.location" class="meta-item">
            <span class="meta-icon">📍</span>
            <span class="meta-text">{{ user.location }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import { useUsersStore } from '@/application/stores/users.store'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import { useUIStore } from '@/application/stores/ui.store'
import FollowButton from './FollowButton.vue'

const props = defineProps<{
  user?: any // Mock User model
  isOwnProfile?: boolean
  isFollowing?: boolean
}>()

const usersStore = useUsersStore()
const uiStore = useUIStore()

const avatarInput = ref<HTMLInputElement | null>(null)
const isUploadingAvatar = ref(false)
const uploadProgress = ref(0)

const triggerAvatarUpload = () => {
  if (props.isOwnProfile && !isUploadingAvatar.value) {
    avatarInput.value?.click()
  }
}

const handleAvatarSelected = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  if (file.size > 5 * 1024 * 1024) {
    uiStore.showToast('El avatar debe pesar menos de 5MB', 'error')
    return
  }

  isUploadingAvatar.value = true
  uploadProgress.value = 0

  try {
    await usersStore.updateAvatar(file, (percent) => {
      uploadProgress.value = percent
    })
  } catch (error) {
    console.error('Failed to update avatar:', error)
    uiStore.showToast('Error al actualizar el avatar', 'error')
  } finally {
    isUploadingAvatar.value = false
    uploadProgress.value = 0
    target.value = ''
  }
}

// mock data if user not provided
const user = props.user || {
  id: '123',
  displayName: 'Lumina Explorer',
  avatar: '',
  bio: 'Synthesizing the future of social interaction in the Onyx space.',
  createdAt: new Date(),
  location: 'Cyber Space'
}

const formatJoinDate = (date: any) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}
</script>

<style scoped>
.profile-header {
  position: relative;
  overflow: hidden;
  border-radius: 0 0 var(--radius-3xl) var(--radius-3xl);
}

.profile-header__cover {
  height: 220px;
  background: var(--surface-base);
  position: relative;
  overflow: hidden;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(var(--color-primary-rgb), 0.1), var(--surface-base));
}

.cover-glow {
  position: absolute;
  top: -50%;
  left: -20%;
  width: 140%;
  height: 140%;
  background: radial-gradient(
    circle at center,
    rgba(var(--color-primary-rgb), 0.15) 0%,
    rgba(var(--color-secondary-rgb), 0.1) 30%,
    transparent 70%
  );
  filter: blur(60px);
  animation: slow-rotate 20s infinite linear;
}

.profile-header__info {
  padding: var(--space-6) var(--space-8) var(--space-8);
  margin-top: -80px;
  position: relative;
  z-index: 10;
  background: var(--surface-glass);
  backdrop-filter: var(--backdrop-blur);
}

.header-main-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: var(--space-6);
}

.avatar-wrapper {
  position: relative;
  padding: 4px;
}

.profile-avatar {
  position: relative;
  z-index: 2;
  border: 4px solid var(--surface-glass-border);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  transition: opacity 0.2s ease;
}

.profile-avatar.uploading {
  opacity: 0.5;
}

.avatar-container {
  position: relative;
  display: inline-block;
  border-radius: var(--radius-full);
}

.avatar-container.clickable {
  cursor: pointer;
}

.avatar-overlay {
  position: absolute;
  inset: 4px; /* inside the border */
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: white;
  font-size: var(--font-size-lg);
  font-weight: bold;
  z-index: 3;
}

.avatar-container.clickable:hover .avatar-overlay,
.avatar-overlay.active {
  opacity: 1;
}

.avatar-glow {
  position: absolute;
  inset: -10px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
  filter: blur(20px);
  opacity: 0.15;
  z-index: 1;
}

.profile-header__actions {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.profile-details {
  display: flex;
  flex-direction: column;
}

.display-name {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
  text-shadow: 0 0 20px rgba(var(--color-primary-rgb), 0.2);
}

.handle {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-secondary);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  opacity: 0.9;
}

.bio {
  margin: 0 0 var(--space-6) 0;
  line-height: var(--line-height-relaxed);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
  max-width: 500px;
}

.profile-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-6);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-tertiary);
  font-size: var(--font-size-sm);
}

.meta-icon {
  font-size: 1.1rem;
  filter: grayscale(1) opacity(0.7);
}

@keyframes slow-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .profile-header__cover {
    height: 160px;
  }

  .display-name {
    font-size: 2rem;
  }

  .profile-header__info {
    padding: var(--space-4) var(--space-6) var(--space-6);
    margin-top: -60px;
  }
}
</style>
