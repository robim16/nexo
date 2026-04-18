<template>
  <form @submit.prevent="handleSubmit" class="login-form">
    <BaseInput
      v-model="form.email"
      type="email"
      label="Correo Electrónico"
      placeholder="tu@email.com"
      wrapper-class="mb-md"
      required
    />
    <BaseInput
      v-model="form.password"
      type="password"
      label="Contraseña"
      placeholder="••••••••"
      wrapper-class="mb-lg"
      required
    />
    
    <div class="actions">
      <BaseButton type="submit" variant="primary" :disabled="loading" block>
        {{ loading ? 'Iniciando...' : 'Iniciar Sesión' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
// Import mock/future store
import { useAuthStore } from '@/presentation/stores/auth';
import BaseInput from '@/presentation/components/common/BaseInput.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await authStore.login(form.email, form.password);
    router.push({ name: 'Home' });
  } catch (error) {
    console.error('Login failed', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
}

.mb-md {
  margin-bottom: var(--spacing-md);
}

.mb-lg {
  margin-bottom: var(--spacing-lg);
}

.actions {
  margin-top: var(--spacing-sm);
}
</style>
