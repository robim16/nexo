import { render } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { vi } from 'vitest'

/**
 * Helper para renderizar componentes con plugins necesarios (Pinia, Router)
 */
export function renderWithPlugins(component: any, options: any = {}) {
  const pinia = createPinia()
  setActivePinia(pinia)

  const router = createRouter({
    history: createWebHistory(),
    routes: options.routes || [{ path: '/', component: { template: '<div>Home</div>' } }]
  })

  return {
    ...render(component, {
      global: {
        plugins: [pinia, router],
        stubs: {
          'router-link': true,
          'router-view': true,
          ...options.global?.stubs
        },
        provide: options.global?.provide || {}
      },
      ...options
    }),
    router,
    pinia
  }
}

/**
 * Mock de un Store de Pinia (útil para pruebas unitarias de componentes)
 */
export function createMockStore<T>(initialState: Partial<T>) {
  return {
    ...initialState,
    $patch: vi.fn(),
    $reset: vi.fn(),
    $subscribe: vi.fn(),
    $onAction: vi.fn()
  }
}
