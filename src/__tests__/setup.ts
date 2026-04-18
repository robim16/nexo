import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import * as matchers from '@testing-library/jest-dom/matchers'
import './utils/firebase-mocks' // Registra los mocks globales

// Mock del archivo de configuración para evitar inicialización real
vi.mock('@/infrastructure/firebase/config/firebase.config', () => ({
  app: {},
  db: {},
  auth: {},
  storage: {},
  functions: {},
  collections: {
    users: 'users',
    posts: 'posts',
    comments: 'comments',
    follows: 'follows',
    notifications: 'notifications'
  }
}))

// Extender los matchers de Vitest con los de Jest DOM
expect.extend(matchers as any)

/**
 * Limpieza después de cada prueba
 */
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

/**
 * Mock de IntersectionObserver para componentes que lo usen
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
} as any

/**
 * Mock de ResizeObserver
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

/**
 * Opcional: Suprimir errores molestos en la consola durante los tests
 * Solo si ensucian demasiado el output
 */
const originalError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    args[0].includes('Warning: Test was not wrapped in act')
  ) {
    return
  }
  originalError.call(console, ...args)
}
