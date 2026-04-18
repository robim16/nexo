<template>
  <div class="settings-page">
    <header class="page-header">
      <h1 class="page-title">Configuración</h1>
    </header>

    <div class="settings-content">
      <section class="settings-section">
        <h3>Perfil</h3>
        <div class="form-group">
          <BaseInput label="Nombre a mostrar" placeholder="Tu nombre" />
        </div>
        <div class="form-group">
          <BaseInput label="Biografía" placeholder="Cuéntanos sobre ti" />
        </div>
        <BaseButton variant="primary">Guardar Cambios</BaseButton>
      </section>

      <section class="settings-section mt-lg">
        <h3 class="danger-zone">Zona de Peligro</h3>
        <BaseButton variant="danger" outline>Eliminar Cuenta</BaseButton>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseInput from '@/presentation/components/common/BaseInput.vue';
import BaseButton from '@/presentation/components/common/BaseButton.vue';
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
}

.page-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.page-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: var(--font-weight-black);
}

.settings-content {
  padding: var(--spacing-xl);
}

.settings-section {
  background: var(--color-surface);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.settings-section h3 {
  margin-top: 0;
  margin-bottom: var(--spacing-md);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.danger-zone {
  color: var(--color-error);
}

.mt-lg {
  margin-top: var(--spacing-lg);
}
</style>
