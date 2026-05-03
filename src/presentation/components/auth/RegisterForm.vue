<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <BaseInput
      v-model="form.displayName"
      type="text"
      label="Nombre de Usuario"
      placeholder="Tu nombre genial"
      wrapper-class="mb-md"
      required
    />
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
      placeholder="Min. 8 caracteres (A-z, 0-9, @$!)"
      wrapper-class="mb-lg"
      required
    />
    
    <div class="actions">
      <BaseButton type="submit" variant="primary" :disabled="loading" block>
        {{ loading ? 'Registrando...' : 'Crear Cuenta' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
// Import mock/future store
import { useAuthStore } from '@/application/stores/auth.store';
import BaseInput from '@/presentation/components/common/BaseInput.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  displayName: '',
  email: '',
  password: '',
});

const handleSubmit = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await authStore.register({ 
      email: form.email, 
      password: form.password, 
      displayName: form.displayName 
    });
    router.push({ name: 'Home' });
  } catch (error) {
    console.error('Registration failed', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-form {
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
