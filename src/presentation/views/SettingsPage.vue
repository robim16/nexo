<template>
  <div class="settings-page">
    <header class="page-header glass">
      <div class="header-content">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure your Nexo experience</p>
      </div>
    </header>

    <div class="settings-container">
      <!-- Profile Section -->
      <section class="settings-section glass">
        <div class="section-header">
          <div class="section-icon">👤</div>
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
          <div class="section-icon">✨</div>
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
          <div class="section-icon">🔒</div>
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
          <div class="section-icon">⚠️</div>
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
  padding: var(--space-8) var(--space-6);
  background: var(--surface-glass);
  margin-bottom: var(--space-8);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
  filter: drop-shadow(0 0 10px rgba(var(--color-primary-rgb), 0.2));
}

.page-subtitle {
  margin: var(--space-2) 0 0;
  color: var(--text-tertiary);
  font-size: var(--font-size-md);
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  padding: 0 var(--space-4) var(--space-12);
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
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: var(--radius-xl);
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
