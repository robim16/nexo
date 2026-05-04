import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.store'
import { container } from '../../../dependency-injection'
import { createTestUser } from '@/__tests__/utils/mock-data'

// Mock del contenedor DI para evitar cargar infraestructura real
vi.mock('../../../dependency-injection', () => ({
  container: {
    get: vi.fn(),
    register: vi.fn(),
    has: vi.fn()
  }
}))

describe('Auth Store (Integration)', () => {
  let authStore: any
  let mockAuthService: any
  let mockLoginUseCase: any
  let mockLogoutUseCase: any

  beforeEach(() => {
    setActivePinia(createPinia())

    // Mocks de dependencias
    mockAuthService = {
      onAuthStateChanged: vi.fn()
    }

    mockLoginUseCase = {
      execute: vi.fn()
    }

    mockLogoutUseCase = {
      execute: vi.fn()
    }

    // Configurar el mock del contenedor
    vi.mocked(container.get).mockImplementation((key: string) => {
      if (key === 'IAuthService') return mockAuthService
      if (key === 'LoginUseCase') return mockLoginUseCase
      if (key === 'LogoutUseCase') return mockLogoutUseCase
      if (key === 'IUserRepository') return { findById: vi.fn().mockResolvedValue(null) }
      if (key === 'IFollowRepository') return { getFollowingIds: vi.fn().mockResolvedValue([]) }
      return {}
    })

    authStore = useAuthStore()
  })

  it('initAuth should set user when authenticated', async () => {
    const domainUser = createTestUser({ displayName: 'Auth User' })

    // Simular que onAuthStateChanged detecta un usuario
    mockAuthService.onAuthStateChanged.mockImplementation((callback: any) => {
      callback(domainUser)
    })

    await authStore.initAuth()

    expect(authStore.user.displayName).toBe('Auth User')
    expect(authStore.isAuthenticated).toBe(true)
    expect(authStore.isInitialized).toBe(true)
  })

  it('login should set user and loading state', async () => {
    const domainUser = createTestUser({ email: 'login@test.com' })
    mockLoginUseCase.execute.mockResolvedValue({ user: domainUser })

    const loginPromise = authStore.login({ email: 'login@test.com', password: 'password123' })

    expect(authStore.loading).toBe(true)

    await loginPromise

    expect(authStore.user.email).toBe('login@test.com')
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('login should handle errors', async () => {
    mockLoginUseCase.execute.mockRejectedValue(new Error('Invalid credentials'))

    try {
      await authStore.login({ email: 'wrong@test.com', password: 'wrongpassword' })
    } catch (e) {
      // Error expected as we are testing invalid credentials
    }

    expect(authStore.user).toBeNull()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBe('Invalid credentials')
  })

  it('logout should clear user', async () => {
    authStore.user = { id: '123' } as any
    mockLogoutUseCase.execute.mockResolvedValue(undefined)

    await authStore.logout()

    expect(authStore.user).toBeNull()
    expect(authStore.loading).toBe(false)
  })
})
