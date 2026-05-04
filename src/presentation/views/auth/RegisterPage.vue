<template>
  <div class="auth-page">
    <div class="auth-page__header">
      <h2>Únete a Nexo</h2>
      <p>Crea tu cuenta para empezar a conectar.</p>
    </div>

    <RegisterForm />

    <p class="auth-page__footer">
      ¿Ya tienes una cuenta? <router-link to="/login">Inicia Sesión</router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/presentation/components/auth/RegisterForm.vue'
</script>

<style scoped>
.auth-page__header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.auth-page__header h2 {
  font-size: 2rem;
  font-weight: var(--font-weight-black);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.auth-page__header p {
  color: var(--color-text-muted);
}

.auth-page__footer {
  text-align: center;
  margin-top: var(--spacing-lg);
  font-size: var(--font-size-md);
  color: var(--color-text-muted);
}

.auth-page__footer a {
  color: var(--color-primary-600);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.auth-page__footer a:hover {
  text-decoration: underline;
}
</style>
