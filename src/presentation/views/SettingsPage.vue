<template>
  <div class="settings-page">
    <header class="page-header">
      <div class="header-content">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your Nexo experience</p>
      </div>
    </header>

    <div class="settings-container">
      <!-- Profile Section -->
      <section class="settings-section glass">
        <div class="section-header">
          <div class="section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h3 class="section-title">Profile Settings</h3>
        </div>

        <div class="section-content">
          <!-- Avatar Upload -->
          <div class="avatar-upload-section">
            <div class="avatar-preview-container" @click="triggerAvatarUpload">
              <BaseAvatar
                :src="avatarPreview || authStore.user?.avatar"
                :name="authStore.user?.displayName"
                size="2xl"
                class="settings-avatar"
                :class="{ uploading: isUploadingAvatar }"
              />
              <div class="avatar-edit-overlay">
                <span v-if="isUploadingAvatar">{{ uploadProgress }}%</span>
                <span v-else>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                    />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </span>
              </div>
              <input
                type="file"
                ref="avatarInput"
                accept="image/*"
                style="display: none"
                @change="handleAvatarSelected"
              />
            </div>
            <div class="avatar-info">
              <h4>Profile Picture</h4>
              <p>JPG, GIF or PNG. Max size of 5MB.</p>
              <BaseButton variant="glass" size="sm" @click="triggerAvatarUpload">
                Change Avatar
              </BaseButton>
            </div>
          </div>

          <div class="form-grid">
            <BaseInput
              label="Display Name"
              placeholder="How others see you"
              v-model="profileForm.displayName"
            />
            <BaseInput
              label="Handle"
              placeholder="@username"
              v-model="profileForm.handle"
              disabled
            />
          </div>
          <div class="form-group">
            <BaseInput
              label="Bio"
              placeholder="Tell the world your story..."
              v-model="profileForm.bio"
              type="textarea"
            />
          </div>

          <div v-if="profileError" class="error-message">{{ profileError }}</div>
          <div v-if="profileSuccess" class="success-message">Profile updated successfully!</div>

          <div class="action-row">
            <BaseButton
              variant="primary"
              size="md"
              :loading="usersStore.loading"
              @click="handleUpdateProfile"
            >
              Save Changes
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section glass">
        <div class="section-header">
          <div class="section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
          </div>
          <h3 class="section-title">Appearance</h3>
        </div>

        <div class="section-content">
          <div class="appearance-grid">
            <div
              v-for="theme in themes"
              :key="theme.id"
              class="theme-card"
              :class="{ active: activeTheme === theme.id }"
              @click="activeTheme = theme.id"
            >
              <div class="theme-preview" :style="{ background: theme.preview }">
                <div class="preview-glow" :style="{ background: theme.accent }"></div>
              </div>
              <span class="theme-label">{{ theme.name }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy & Security -->
      <section class="settings-section glass">
        <div class="section-header">
          <div class="section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 class="section-title">Privacy & Security</h3>
        </div>

        <div class="section-content">
          <div class="toggle-list">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Private Profile</span>
                <span class="toggle-desc">Only followers can see your posts</span>
              </div>
              <div class="custom-toggle"></div>
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-label">Direct Messages</span>
                <span class="toggle-desc">Allow anyone to message you</span>
              </div>
              <div class="custom-toggle active"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Security Section -->
      <section class="settings-section glass">
        <div class="section-header">
          <div class="section-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 class="section-title">Security</h3>
        </div>

        <div class="section-content">
          <div class="form-grid">
            <BaseInput
              label="New Password"
              type="password"
              placeholder="Min. 8 chars, mixed case, symbols"
              v-model="securityForm.newPassword"
            />
            <BaseInput
              label="Confirm Password"
              type="password"
              placeholder="Repeat new password"
              v-model="securityForm.confirmPassword"
            />
          </div>
          <div v-if="passwordError" class="error-message">
            {{ passwordError }}
          </div>
          <div v-if="passwordSuccess" class="success-message">Password updated successfully!</div>
          <div class="action-row">
            <BaseButton
              variant="primary"
              size="md"
              :loading="authStore.loading"
              @click="handleUpdatePassword"
            >
              Update Password
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="settings-section danger-glass">
        <div class="section-header">
          <div class="section-icon text-error">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h3 class="section-title danger-text">Danger Zone</h3>
        </div>

        <div class="section-content">
          <p class="danger-desc">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div class="action-row">
            <BaseButton variant="glass" size="md" class="btn-danger">Delete Account</BaseButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import BaseInput from '@/presentation/components/common/BaseInput.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import BaseAvatar from '@/presentation/components/common/BaseAvatar.vue'
import { useAuthStore } from '@/application/stores/auth.store'
import { useUsersStore } from '@/application/stores/users.store'

const authStore = useAuthStore()
const usersStore = useUsersStore()

const profileForm = reactive({
  displayName: '',
  handle: '',
  bio: ''
})

const profileError = ref<string | null>(null)
const profileSuccess = ref(false)

const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const isUploadingAvatar = ref(false)
const uploadProgress = ref(0)

onMounted(() => {
  if (authStore.user) {
    profileForm.displayName = authStore.user.displayName
    const handle = authStore.user.email.split('@')[0]
    profileForm.handle = `@${handle}`
    profileForm.bio = authStore.user.bio || ''
  }
})

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

function handleAvatarSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      profileError.value = 'Image size must be less than 5MB'
      return
    }

    avatarFile.value = file
    // Create local preview
    const reader = new FileReader()
    reader.onload = (event) => {
      avatarPreview.value = event.target?.result as string
    }
    reader.readAsDataURL(file)
    profileSuccess.value = false
  }
}

async function handleUpdateProfile() {
  profileError.value = null
  profileSuccess.value = false

  try {
    isUploadingAvatar.value = !!avatarFile.value

    await usersStore.updateProfile({
      avatarFile: avatarFile.value || undefined,
      displayName: profileForm.displayName,
      bio: profileForm.bio,
      onProgress: (percent) => {
        uploadProgress.value = percent
      }
    })

    profileSuccess.value = true
    avatarFile.value = null
    avatarPreview.value = null

    // Hide success message after 3 seconds
    setTimeout(() => {
      profileSuccess.value = false
    }, 3000)
  } catch (err: any) {
    profileError.value = err.message || 'Error updating profile'
  } finally {
    isUploadingAvatar.value = false
    uploadProgress.value = 0
  }
}

const securityForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref<string | null>(null)
const passwordSuccess = ref(false)

async function handleUpdatePassword() {
  passwordError.value = null
  passwordSuccess.value = false

  if (securityForm.newPassword !== securityForm.confirmPassword) {
    passwordError.value = 'Passwords do not match'
    return
  }

  try {
    await authStore.updatePassword(securityForm.newPassword)
    passwordSuccess.value = true
    securityForm.newPassword = ''
    securityForm.confirmPassword = ''

    setTimeout(() => {
      passwordSuccess.value = false
    }, 3000)
  } catch (err: any) {
    passwordError.value = err.message || 'Error updating password'
  }
}

const activeTheme = ref('onyx')
const themes = [
  { id: 'onyx', name: 'Onyx Dark', preview: '#0a0a0b', accent: 'var(--color-primary)' },
  { id: 'glass', name: 'Crystal', preview: '#1a1a1c', accent: 'var(--color-secondary)' },
  { id: 'nebula', name: 'Nebula', preview: '#0f0c29', accent: '#ff00ff' }
]
</script>

<style scoped>
/* Previous styles remain, adding new ones for avatar upload */
.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: var(--space-8);
  margin-bottom: var(--space-8);
  padding: var(--space-4);
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-2xl);
}

.avatar-preview-container {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
}

.settings-avatar {
  width: 100%;
  height: 100%;
  border: 4px solid var(--surface-glass-border);
  transition: filter 0.3s ease;
}

.settings-avatar.uploading {
  filter: brightness(0.5);
}

.avatar-edit-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  color: white;
  border-radius: var(--radius-full);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 2;
}

.avatar-preview-container:hover .avatar-edit-overlay {
  opacity: 1;
}

.avatar-edit-overlay svg {
  width: 24px;
  height: 24px;
}

.avatar-info h4 {
  margin: 0 0 var(--space-1) 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
}

.avatar-info p {
  margin: 0 0 var(--space-4) 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-6) var(--space-4);
  background: rgba(10, 10, 11, 0.8);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--surface-glass-border);
  position: sticky;
  top: 0;
  z-index: 20;
}

.header-content {
  margin-bottom: var(--space-1);
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
}

.page-subtitle {
  margin: 2px 0 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}

.settings-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-6) var(--space-2);
}

.settings-section {
  padding: var(--space-8);
  border-radius: var(--radius-3xl);
  transition: var(--transition-base);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.section-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-lg);
  color: var(--color-primary);
}

.section-icon.text-error {
  color: var(--color-error);
}

.section-icon svg {
  width: 18px;
  height: 18px;
}

.section-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}

.action-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-4);
}

/* Appearance Card */
.appearance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-4);
}

.theme-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  cursor: pointer;
  transition: var(--transition-base);
  padding: var(--space-2);
  border-radius: var(--radius-2xl);
}

.theme-preview {
  height: 80px;
  border-radius: var(--radius-xl);
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
  transition: var(--transition-base);
}

.preview-glow {
  position: absolute;
  width: 60%;
  height: 60%;
  top: 20%;
  left: 20%;
  filter: blur(20px);
  opacity: 0.3;
}

.theme-card:hover .theme-preview {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.1);
}

.theme-card.active .theme-preview {
  border-color: var(--color-primary);
  box-shadow: 0 0 15px rgba(var(--color-primary-rgb), 0.3);
}

.theme-label {
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-bold);
}

.theme-card.active .theme-label {
  color: var(--text-primary);
}

/* Toggle Items */
.toggle-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.toggle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-2xl);
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-label {
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.toggle-desc {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.custom-toggle {
  width: 44px;
  height: 24px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
  transition: var(--transition-base);
}

.custom-toggle::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  background-color: #fff;
  border-radius: var(--radius-full);
  top: 3px;
  left: 3px;
  transition: var(--transition-base);
}

.custom-toggle.active {
  background-color: var(--color-primary);
  box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.4);
}

.custom-toggle.active::after {
  left: 23px;
}

/* Danger Zone */
.danger-glass {
  background: rgba(255, 61, 113, 0.03);
  border: 1px solid rgba(255, 61, 113, 0.1);
  border-radius: var(--radius-3xl);
  padding: var(--space-8);
}

.danger-text {
  color: var(--color-error);
}

.danger-desc {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-4);
}

.btn-danger {
  color: var(--color-error);
  border-color: rgba(255, 61, 113, 0.2);
}

.btn-danger:hover {
  background-color: rgba(255, 61, 113, 0.1);
  box-shadow: 0 0 15px rgba(255, 61, 113, 0.1);
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .settings-section {
    padding: var(--space-6);
  }
}

.error-message {
  color: var(--color-error);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
}

.success-message {
  color: var(--color-success);
  font-size: var(--font-size-sm);
  margin-top: var(--space-2);
}
</style>
