<template>
  <div class="auth-layout">
    <div class="auth-layout__visual">
      <div class="auth-layout__brand">
        <h1>Nexo</h1>
        <p>Conecta con tus ideas.</p>
      </div>
      <!-- Decorative elements -->
      <div class="auth-layout__blob auth-layout__blob--1"></div>
      <div class="auth-layout__blob auth-layout__blob--2"></div>
    </div>
    <div class="auth-layout__content">
      <div class="auth-layout__glass-card">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Auth Layout wrapper
</script>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background);
  font-family: var(--font-family-sans);
}

.auth-layout__visual {
  display: none;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-secondary-600) 100%);
}

@media (min-width: 960px) {
  .auth-layout__visual {
    display: flex;
    flex: 1;
    align-items: center;
    justify-content: center;
    color: var(--color-text-inverse);
  }
}

.auth-layout__brand {
  z-index: 10;
  text-align: center;
}

.auth-layout__brand h1 {
  font-size: 4rem;
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
  letter-spacing: -2px;
}

.auth-layout__brand p {
  font-size: var(--font-size-xl);
  opacity: 0.9;
}

/* Glassmorphism Blobs */
.auth-layout__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: 1;
}

.auth-layout__blob--1 {
  width: 400px;
  height: 400px;
  background-color: var(--color-tertiary-500);
  top: -100px;
  left: -100px;
  animation: float 10s ease-in-out infinite alternate;
}

.auth-layout__blob--2 {
  width: 500px;
  height: 500px;
  background-color: var(--color-primary-400);
  bottom: -150px;
  right: -100px;
  animation: float 12s ease-in-out infinite alternate-reverse;
}

@keyframes float {
  0% {
    transform: translateY(0) scale(1);
  }
  100% {
    transform: translateY(30px) scale(1.1);
  }
}

.auth-layout__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  position: relative;
  background-color: var(--color-surface);
}

/* Form Glass Card container */
.auth-layout__glass-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
}
</style>
