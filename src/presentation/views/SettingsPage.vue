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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h3 class="section-title">Profile Settings</h3>
        </div>
        
        <div class="section-content">
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
          <div class="action-row">
            <BaseButton variant="primary" size="md">Save Changes</BaseButton>
          </div>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section glass">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
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

      <!-- Danger Zone -->
      <section class="settings-section danger-glass">
        <div class="section-header">
          <div class="section-icon text-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h3 class="section-title danger-text">Danger Zone</h3>
        </div>
        
        <div class="section-content">
          <p class="danger-desc">Once you delete your account, there is no going back. Please be certain.</p>
          <div class="action-row">
            <BaseButton variant="glass" size="md" class="btn-danger">Delete Account</BaseButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import BaseInput from '@/presentation/components/common/BaseInput.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const profileForm = reactive({
  displayName: 'Lumina Explorer',
  handle: 'lumina_exp',
  bio: 'Synthesizing the future of social interaction in the Onyx space.'
});

const activeTheme = ref('onyx');
const themes = [
  { id: 'onyx', name: 'Onyx Dark', preview: '#0a0a0b', accent: 'var(--color-primary)' },
  { id: 'glass', name: 'Crystal', preview: '#1a1a1c', accent: 'var(--color-secondary)' },
  { id: 'nebula', name: 'Nebula', preview: '#0f0c29', accent: '#ff00ff' }
];
</script>

<style scoped>
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
</style>
