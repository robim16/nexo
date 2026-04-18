---
name: vue-pruebas-senior
description: Estrategias completas de pruebas para aplicaciones Vue 3, incluyendo pruebas unitarias con Vitest, pruebas de componentes con Vue Test Utils, pruebas E2E con Playwright/Cypress, pruebas de integración para Firebase, dobles de prueba (mocks/stubs/fakes), flujo TDD, análisis de cobertura y mejores prácticas de testing. Usar cuando se escriban pruebas para componentes Vue, composables, stores, o al configurar infraestructura de testing, implementar desarrollo guiado por pruebas, depurar fallos en tests o mejorar la cobertura. Activar con menciones de "prueba", "test", "testing", "prueba unitaria", "prueba de componente", "E2E", "prueba de integración", "TDD", "cobertura", "mock", "stub", "Vitest", "Playwright", "Cypress", "Vue Test Utils", o cualquier mención de calidad en apps Vue.
---

# Vue Pruebas Senior

Guía completa para probar aplicaciones Vue 3 con herramientas modernas y patrones mantenibles, enfocada en confiabilidad y experiencia del desarrollador.

## Tabla de Contenidos

1. [Filosofía y Estrategia de Pruebas](#filosofía-y-estrategia-de-pruebas)
2. [Configuración del Entorno de Pruebas](#configuración-del-entorno-de-pruebas)
3. [Pruebas Unitarias](#pruebas-unitarias)
4. [Pruebas de Componentes](#pruebas-de-componentes)
5. [Pruebas de Integración](#pruebas-de-integración)
6. [Pruebas E2E](#pruebas-e2e)
7. [Patrones de Prueba](#patrones-de-prueba)
8. [Dobles de Prueba (Mocks, Stubs, Fakes)](#dobles-de-prueba)
9. [Flujo TDD](#flujo-tdd)
10. [Suite de Pruebas para App Social Nexo](#suite-de-pruebas-para-app-social-nexo)

---

## Filosofía y Estrategia de Pruebas

### Pirámide de Pruebas

```
       /\
      /  \      Pruebas E2E (Pocas)
     /----\
    /      \    Pruebas de Integración (Algunas)
   /--------\
  /          \  Pruebas Unitarias (Muchas)
 /____________\
```

**Distribución para Nexo:**
- **70% Pruebas Unitarias**: Funciones puras, utilidades, lógica de negocio
- **20% Pruebas de Integración**: Composables, stores, integración Firebase
- **10% Pruebas E2E**: Flujos críticos de usuario

### Cualidades del Test (F.I.R.S.T.)

- **Fast (Rápido)**: Las pruebas corren en milisegundos
- **Independent (Independiente)**: Sin dependencias entre pruebas
- **Repeatable (Repetible)**: Mismo resultado siempre
- **Self-validating (Auto-validante)**: Pass/fail claro
- **Timely (Oportuno)**: Escritas junto con el código

---

## Configuración del Entorno de Pruebas

### Estructura del Proyecto

```
src/
├── __tests__/                    # Utilidades globales de prueba
│   ├── setup.ts                  # Archivo de configuración de pruebas
│   ├── utils/
│   │   ├── test-utils.ts         # Helpers para pruebas
│   │   ├── mock-data.ts          # Fábricas de datos de prueba
│   │   └── firebase-mocks.ts     # Mocks de Firebase
│   └── fixtures/
│       ├── users.json
│       └── posts.json
│
├── core/
│   ├── entities/
│   │   ├── User.ts
│   │   └── __tests__/
│   │       └── User.spec.ts
│   └── use-cases/
│       └── posts/
│           ├── CreatePostUseCase.ts
│           └── __tests__/
│               └── CreatePostUseCase.spec.ts
│
├── application/
│   ├── composables/
│   │   ├── usePosts.ts
│   │   └── __tests__/
│   │       └── usePosts.spec.ts
│   └── stores/
│       ├── auth.store.ts
│       └── __tests__/
│           └── auth.store.spec.ts
│
└── presentation/
    └── components/
        ├── feed/
        │   ├── PostCard.vue
        │   └── __tests__/
        │       └── PostCard.spec.ts
        └── common/
            ├── BaseButton.vue
            └── __tests__/
                └── BaseButton.spec.ts

tests/
├── e2e/                          # Pruebas de extremo a extremo
│   ├── auth.spec.ts
│   ├── feed.spec.ts
│   └── profile.spec.ts
│
└── integration/                  # Pruebas de integración
    ├── firebase-auth.spec.ts
    └── post-creation-flow.spec.ts
```

### Configuración de Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.spec.ts',
        '**/*.d.ts',
        '**/main.ts',
        '**/*.config.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    },
    mockReset: true,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### Archivo de Configuración de Pruebas

```typescript
// src/__tests__/setup.ts
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import matchers from '@testing-library/jest-dom/matchers'

// Extender los matchers de Vitest
expect.extend(matchers)

// Limpiar después de cada prueba
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock de Firebase
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn()
}))

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn()
}))

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
} as any

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Suprimir errores de consola en pruebas (opcional)
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn()
}
```

### Fábricas de Datos de Prueba

```typescript
// src/__tests__/utils/mock-data.ts
import { User } from '@/core/entities/User'
import { Post } from '@/core/entities/Post'
import { UserId } from '@/core/value-objects/UserId'
import { PostId } from '@/core/value-objects/PostId'
import { Email } from '@/core/value-objects/Email'
import { PostContent } from '@/core/value-objects/PostContent'

let idCounter = 0
const generateId = () => `test-id-${++idCounter}`

export function createTestUser(overrides: Partial<{
  displayName: string
  email: string
  bio: string
  avatar: string | null
  followersCount: number
  isVerified: boolean
}> = {}): User {
  return new User(
    UserId.fromString(generateId()),
    Email.create(overrides.email || `usuario${idCounter}@prueba.com`),
    overrides.displayName || 'Usuario de Prueba',
    overrides.bio || 'Bio de prueba',
    overrides.avatar ?? null,
    overrides.followersCount ?? 0,
    0, 0,
    new Date('2024-01-01'),
    overrides.isVerified ?? false
  )
}

export function createTestPost(overrides: Partial<{
  content: string
  authorId: string
  images: string[]
  likes: string[]
  likesCount: number
  commentsCount: number
  createdAt: Date
}> = {}): Post {
  return new Post(
    PostId.fromString(generateId()),
    UserId.fromString(overrides.authorId || generateId()),
    PostContent.create(overrides.content || 'Contenido de publicación de prueba'),
    overrides.images || [],
    [], [], // menciones, hashtags
    overrides.likes || [],
    overrides.likesCount ?? 0,
    overrides.commentsCount ?? 0,
    0,
    overrides.createdAt || new Date(),
    new Date()
  )
}
```

---

## Pruebas Unitarias

### Probar Funciones Puras y Utilidades

```typescript
// shared/utils/__tests__/date.utils.spec.ts
import { describe, it, expect } from 'vitest'
import { formatTimeAgo, isToday, getDaysDifference } from '../date.utils'

describe('date.utils', () => {
  describe('formatTimeAgo', () => {
    it('debe retornar "ahora mismo" para fechas dentro de 1 minuto', () => {
      const ahora = new Date()
      const resultado = formatTimeAgo(ahora)
      expect(resultado).toBe('ahora mismo')
    })

    it('debe retornar minutos para fechas dentro de 1 hora', () => {
      const fecha = new Date(Date.now() - 30 * 60 * 1000) // hace 30 minutos
      const resultado = formatTimeAgo(fecha)
      expect(resultado).toBe('hace 30m')
    })

    it('debe retornar horas para fechas dentro de 24 horas', () => {
      const fecha = new Date(Date.now() - 5 * 60 * 60 * 1000) // hace 5 horas
      const resultado = formatTimeAgo(fecha)
      expect(resultado).toBe('hace 5h')
    })

    it('debe retornar días para fechas más allá de 24 horas', () => {
      const fecha = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // hace 3 días
      const resultado = formatTimeAgo(fecha)
      expect(resultado).toBe('hace 3d')
    })
  })

  describe('isToday', () => {
    it('debe retornar true para la fecha de hoy', () => {
      const hoy = new Date()
      expect(isToday(hoy)).toBe(true)
    })

    it('debe retornar false para ayer', () => {
      const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(isToday(ayer)).toBe(false)
    })
  })
})
```

### Probar Entidades

```typescript
// core/entities/__tests__/User.spec.ts
import { describe, it, expect } from 'vitest'
import { User } from '../User'
import { createTestUser } from '@/__tests__/utils/mock-data'

describe('Entidad User', () => {
  describe('updateProfile', () => {
    it('debe actualizar nombre y bio correctamente', () => {
      const usuario = createTestUser()

      usuario.updateProfile('Nuevo Nombre', 'Nueva bio')

      expect(usuario.displayName).toBe('Nuevo Nombre')
      expect(usuario.bio).toBe('Nueva bio')
    })

    it('debe lanzar error si el nombre es muy corto', () => {
      const usuario = createTestUser()

      expect(() => {
        usuario.updateProfile('Ab', 'Bio válida')
      }).toThrow('El nombre debe tener al menos 3 caracteres')
    })

    it('debe lanzar error si la bio supera el límite', () => {
      const usuario = createTestUser()
      const bioLarga = 'a'.repeat(501)

      expect(() => {
        usuario.updateProfile('Nombre Válido', bioLarga)
      }).toThrow('La biografía no puede superar 500 caracteres')
    })
  })

  describe('follow/unfollow', () => {
    it('debe incrementar el contador de seguidos al seguir', () => {
      const usuario = createTestUser()
      const contadorInicial = usuario.followingCount

      usuario.follow()

      expect(usuario.followingCount).toBe(contadorInicial + 1)
    })

    it('debe decrementar el contador al dejar de seguir', () => {
      const usuario = createTestUser()
      usuario.follow()
      const contadorDespues = usuario.followingCount

      usuario.unfollow()

      expect(usuario.followingCount).toBe(contadorDespues - 1)
    })

    it('no debe decrementar por debajo de cero', () => {
      const usuario = createTestUser()

      usuario.unfollow()

      expect(usuario.followingCount).toBe(0)
    })
  })

  describe('canPost', () => {
    it('debe retornar true si el usuario está verificado', () => {
      const usuario = createTestUser()
      usuario.verify()

      expect(usuario.canPost()).toBe(true)
    })

    it('debe retornar true si el usuario tiene seguidores', () => {
      const usuario = createTestUser()
      usuario.incrementFollowers()

      expect(usuario.canPost()).toBe(true)
    })

    it('debe retornar false si no está verificado y no tiene seguidores', () => {
      const usuario = createTestUser()

      expect(usuario.canPost()).toBe(false)
    })
  })

  describe('método factory create', () => {
    it('debe crear usuario con datos válidos', () => {
      const usuario = User.create({
        email: 'nuevo@ejemplo.com',
        displayName: 'Nuevo Usuario',
        bio: 'Hola mundo'
      })

      expect(usuario.email.value).toBe('nuevo@ejemplo.com')
      expect(usuario.displayName).toBe('Nuevo Usuario')
      expect(usuario.bio).toBe('Hola mundo')
      expect(usuario.followersCount).toBe(0)
      expect(usuario.isVerified).toBe(false)
    })

    it('debe crear usuario con bio vacía por defecto', () => {
      const usuario = User.create({
        email: 'nuevo@ejemplo.com',
        displayName: 'Nuevo Usuario'
      })

      expect(usuario.bio).toBe('')
    })
  })
})
```

### Probar Casos de Uso

```typescript
// core/use-cases/posts/__tests__/CreatePostUseCase.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreatePostUseCase } from '../CreatePostUseCase'
import { IPostRepository } from '@/core/ports/repositories/IPostRepository'
import { IStorageService } from '@/core/ports/services/IStorageService'

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase
  let mockPostRepository: IPostRepository
  let mockStorageService: IStorageService

  beforeEach(() => {
    // Crear mocks
    mockPostRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn()
    }

    mockStorageService = {
      uploadImage: vi.fn().mockResolvedValue('https://ejemplo.com/imagen.jpg'),
      uploadMultiple: vi.fn(),
      deleteFile: vi.fn(),
      listFiles: vi.fn(),
      getDownloadURL: vi.fn()
    }

    useCase = new CreatePostUseCase(mockPostRepository, mockStorageService)
  })

  it('debe crear post solo con texto', async () => {
    const dto = {
      userId: 'usuario123',
      content: '¡Hola mundo!',
      images: [],
      mentions: []
    }

    const post = await useCase.execute(dto)

    expect(post.content.value).toBe('¡Hola mundo!')
    expect(post.images).toHaveLength(0)
    expect(mockPostRepository.save).toHaveBeenCalledWith(post)
    expect(mockStorageService.uploadImage).not.toHaveBeenCalled()
  })

  it('debe crear post con imágenes', async () => {
    const mockFile = new File([''], 'foto.jpg', { type: 'image/jpeg' })
    const dto = {
      userId: 'usuario123',
      content: 'Post con imagen',
      images: [mockFile],
      mentions: []
    }

    const post = await useCase.execute(dto)

    expect(post.images).toHaveLength(1)
    expect(post.images[0]).toBe('https://ejemplo.com/imagen.jpg')
    expect(mockStorageService.uploadImage).toHaveBeenCalledWith(
      mockFile,
      expect.stringContaining('posts/usuario123')
    )
  })

  it('debe manejar múltiples imágenes', async () => {
    const mockFiles = [
      new File([''], 'foto1.jpg', { type: 'image/jpeg' }),
      new File([''], 'foto2.jpg', { type: 'image/jpeg' })
    ]

    mockStorageService.uploadImage = vi.fn()
      .mockResolvedValueOnce('https://ejemplo.com/imagen1.jpg')
      .mockResolvedValueOnce('https://ejemplo.com/imagen2.jpg')

    const dto = {
      userId: 'usuario123',
      content: 'Múltiples imágenes',
      images: mockFiles,
      mentions: []
    }

    const post = await useCase.execute(dto)

    expect(post.images).toHaveLength(2)
    expect(mockStorageService.uploadImage).toHaveBeenCalledTimes(2)
  })

  it('debe lanzar error para contenido vacío', async () => {
    const dto = {
      userId: 'usuario123',
      content: '',
      images: [],
      mentions: []
    }

    await expect(useCase.execute(dto)).rejects.toThrow()
  })

  it('debe manejar errores de subida correctamente', async () => {
    const mockFile = new File([''], 'foto.jpg', { type: 'image/jpeg' })
    mockStorageService.uploadImage = vi.fn()
      .mockRejectedValue(new Error('Error al subir'))

    const dto = {
      userId: 'usuario123',
      content: 'Test',
      images: [mockFile],
      mentions: []
    }

    await expect(useCase.execute(dto)).rejects.toThrow('Error al subir')
    expect(mockPostRepository.save).not.toHaveBeenCalled()
  })
})
```

---

## Pruebas de Componentes

### Probar Componentes Simples

```typescript
// presentation/components/common/__tests__/BaseButton.spec.ts
import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import BaseButton from '../BaseButton.vue'

describe('BaseButton', () => {
  it('debe renderizar con props por defecto', () => {
    const { getByRole } = render(BaseButton, {
      slots: { default: 'Clic aquí' }
    })

    const boton = getByRole('button')
    expect(boton).toBeInTheDocument()
    expect(boton).toHaveTextContent('Clic aquí')
  })

  it('debe aplicar clases de variante', () => {
    const { getByRole } = render(BaseButton, {
      props: { variant: 'primary' },
      slots: { default: 'Botón Primario' }
    })

    const boton = getByRole('button')
    expect(boton).toHaveClass('btn--primary')
  })

  it('debe estar deshabilitado cuando disabled es true', () => {
    const { getByRole } = render(BaseButton, {
      props: { disabled: true },
      slots: { default: 'Deshabilitado' }
    })

    expect(getByRole('button')).toBeDisabled()
  })

  it('debe emitir evento click', async () => {
    const { getByRole, emitted } = render(BaseButton, {
      slots: { default: 'Clic aquí' }
    })

    await fireEvent.click(getByRole('button'))

    expect(emitted()).toHaveProperty('click')
    expect(emitted().click).toHaveLength(1)
  })

  it('no debe emitir click cuando está deshabilitado', async () => {
    const { getByRole, emitted } = render(BaseButton, {
      props: { disabled: true },
      slots: { default: 'Clic aquí' }
    })

    await fireEvent.click(getByRole('button'))

    expect(emitted().click).toBeUndefined()
  })

  it('debe mostrar estado de carga', () => {
    const { getByRole } = render(BaseButton, {
      props: { loading: true },
      slots: { default: 'Cargando' }
    })

    const boton = getByRole('button')
    expect(boton).toHaveClass('btn--loading')
    expect(boton).toBeDisabled()
  })
})
```

### Probar Componentes Complejos

```typescript
// presentation/components/feed/__tests__/PostCard.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { createPinia, setActivePinia } from 'pinia'
import PostCard from '../PostCard.vue'
import { createTestPost, createTestUser } from '@/__tests__/utils/mock-data'

describe('PostCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debe renderizar el contenido del post', () => {
    const post = createTestPost({ content: '¡Hola mundo!' })

    const { getByText } = render(PostCard, { props: { post } })

    expect(getByText('¡Hola mundo!')).toBeInTheDocument()
  })

  it('debe mostrar información del autor', () => {
    const autor = createTestUser({
      displayName: 'Juan Pérez',
      avatar: 'https://ejemplo.com/avatar.jpg'
    })
    const post = createTestPost({ authorId: autor.id.value })

    const { getByText, getByAltText } = render(PostCard, {
      props: { post },
      global: {
        provide: { currentUser: autor }
      }
    })

    expect(getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('debe renderizar imágenes del post', () => {
    const post = createTestPost({
      images: [
        'https://ejemplo.com/imagen1.jpg',
        'https://ejemplo.com/imagen2.jpg'
      ]
    })

    const { getAllByRole } = render(PostCard, { props: { post } })

    const imagenes = getAllByRole('img').filter(
      img => img.getAttribute('alt')?.includes('Imagen')
    )
    expect(imagenes).toHaveLength(2)
  })

  it('debe mostrar el contador de likes', () => {
    const post = createTestPost({ likesCount: 42 })

    const { getByText } = render(PostCard, { props: { post } })

    expect(getByText('42', { exact: false })).toBeInTheDocument()
  })

  it('debe mostrar estado de like activo', () => {
    const post = createTestPost({ likes: ['usuario-actual-id'] })

    const { getByRole } = render(PostCard, {
      props: { post },
      global: {
        mocks: {
          $authStore: { currentUserId: 'usuario-actual-id' }
        }
      }
    })

    const botonLike = getByRole('button', { name: /❤️/ })
    expect(botonLike).toHaveClass('is-liked')
  })

  it('debe emitir evento delete al eliminar', async () => {
    const post = createTestPost()

    const { getByRole, emitted } = render(PostCard, {
      props: { post, canDelete: true }
    })

    const botonEliminar = getByRole('button', { name: /eliminar/i })
    await fireEvent.click(botonEliminar)

    expect(emitted()).toHaveProperty('delete')
    expect(emitted().delete[0]).toEqual([post.id])
  })
})
```

---

## Pruebas de Integración

### Probar Composables

```typescript
// application/composables/__tests__/usePosts.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { usePosts } from '../usePosts'
import { createTestPost } from '@/__tests__/utils/mock-data'

// Componente auxiliar para probar composables
const TestComponent = defineComponent({
  setup() {
    return usePosts()
  },
  template: '<div></div>'
})

describe('usePosts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('debe cargar posts al montarse', async () => {
    const mockPosts = [createTestPost(), createTestPost()]
    vi.mocked(usePostsStore).mockReturnValue({
      loadFeed: vi.fn().mockResolvedValue(undefined),
      posts: mockPosts,
      loading: false,
      error: null,
      hasMore: true
    } as any)

    const wrapper = mount(TestComponent)
    await flushPromises()

    const { posts } = wrapper.vm
    expect(posts).toHaveLength(2)
  })

  it('debe manejar errores de carga', async () => {
    const errorEsperado = new Error('Error de red')
    vi.mocked(usePostsStore).mockReturnValue({
      loadFeed: vi.fn().mockRejectedValue(errorEsperado),
      posts: [],
      loading: false,
      error: errorEsperado,
      hasMore: false
    } as any)

    const wrapper = mount(TestComponent)
    await flushPromises()

    const { error } = wrapper.vm
    expect(error).toBe(errorEsperado)
  })
})
```

### Probar Stores

```typescript
// application/stores/__tests__/auth.store.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth.store'

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('debe inicializar con usuario null', () => {
    const store = useAuthStore()
    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('debe actualizar el estado al iniciar sesión', async () => {
    const store = useAuthStore()
    const mockUser = createTestUser()

    vi.mocked(FirebaseAuthService.prototype.signIn).mockResolvedValue(mockUser)

    await store.login('usuario@ejemplo.com', 'contraseña')

    expect(store.currentUser).toEqual(mockUser)
    expect(store.isAuthenticated).toBe(true)
  })

  it('debe limpiar el estado al cerrar sesión', async () => {
    const store = useAuthStore()
    store.currentUser = createTestUser()

    vi.mocked(FirebaseAuthService.prototype.signOut).mockResolvedValue(undefined)

    await store.logout()

    expect(store.currentUser).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  it('debe manejar errores de inicio de sesión', async () => {
    const store = useAuthStore()
    const error = new Error('Credenciales inválidas')

    vi.mocked(FirebaseAuthService.prototype.signIn).mockRejectedValue(error)

    await expect(
      store.login('usuario@ejemplo.com', 'incorrecta')
    ).rejects.toThrow('Credenciales inválidas')

    expect(store.currentUser).toBeNull()
  })
})
```

---

## Pruebas E2E

### Configuración de Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
})
```

### Pruebas E2E de Autenticación

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Flujo de Autenticación', () => {
  test('debe permitir iniciar sesión con credenciales válidas', async ({ page }) => {
    await page.goto('/auth/login')

    // Llenar formulario
    await page.fill('[data-testid="email-input"]', 'test@nexo.app')
    await page.fill('[data-testid="password-input"]', 'contraseña123')
    await page.click('[data-testid="login-button"]')

    // Verificar redirección al feed
    await expect(page).toHaveURL('/feed')
    await expect(page.locator('[data-testid="user-avatar"]')).toBeVisible()
  })

  test('debe mostrar error con credenciales inválidas', async ({ page }) => {
    await page.goto('/auth/login')

    await page.fill('[data-testid="email-input"]', 'invalido@nexo.app')
    await page.fill('[data-testid="password-input"]', 'incorrecta')
    await page.click('[data-testid="login-button"]')

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Credenciales')
  })

  test('debe registrar nuevo usuario', async ({ page }) => {
    await page.goto('/auth/register')

    await page.fill('[data-testid="name-input"]', 'Nuevo Usuario')
    await page.fill('[data-testid="email-input"]', `nuevo${Date.now()}@nexo.app`)
    await page.fill('[data-testid="password-input"]', 'contraseña123')
    await page.fill('[data-testid="confirm-password-input"]', 'contraseña123')
    await page.click('[data-testid="register-button"]')

    await expect(page).toHaveURL('/feed')
  })

  test('debe cerrar sesión correctamente', async ({ page }) => {
    // Iniciar sesión primero
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'test@nexo.app')
    await page.fill('[data-testid="password-input"]', 'contraseña123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/feed')

    // Cerrar sesión
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    await expect(page).toHaveURL('/auth/login')
  })
})
```

### Pruebas E2E del Feed

```typescript
// tests/e2e/feed.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Feed Principal', () => {
  test.beforeEach(async ({ page }) => {
    // Autenticar antes de cada prueba
    await page.goto('/auth/login')
    await page.fill('[data-testid="email-input"]', 'test@nexo.app')
    await page.fill('[data-testid="password-input"]', 'contraseña123')
    await page.click('[data-testid="login-button"]')
    await page.waitForURL('/feed')
  })

  test('debe mostrar publicaciones en el feed', async ({ page }) => {
    const posts = page.locator('[data-testid="post-card"]')
    await expect(posts.first()).toBeVisible({ timeout: 10000 })
  })

  test('debe crear una nueva publicación', async ({ page }) => {
    await page.click('[data-testid="create-post-button"]')
    await page.fill('[data-testid="post-content-input"]', 'Mi primera publicación en Nexo 🚀')
    await page.click('[data-testid="submit-post-button"]')

    await expect(
      page.locator('[data-testid="post-card"]').filter({ hasText: 'Mi primera publicación' })
    ).toBeVisible({ timeout: 5000 })
  })

  test('debe dar like a una publicación', async ({ page }) => {
    const primerPost = page.locator('[data-testid="post-card"]').first()
    const botonLike = primerPost.locator('[data-testid="like-button"]')

    const contadorInicial = await botonLike.textContent()
    await botonLike.click()

    // Verificar actualización optimista
    await expect(botonLike).toHaveClass(/is-liked/)
  })

  test('debe cargar más publicaciones al llegar al final', async ({ page }) => {
    const cantidadInicial = await page.locator('[data-testid="post-card"]').count()

    // Hacer scroll hasta el final
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

    // Esperar nuevos posts
    await page.waitForFunction(
      (inicial) => document.querySelectorAll('[data-testid="post-card"]').length > inicial,
      cantidadInicial
    )

    const cantidadFinal = await page.locator('[data-testid="post-card"]').count()
    expect(cantidadFinal).toBeGreaterThan(cantidadInicial)
  })
})
```

---

## Dobles de Prueba

### Mocks, Stubs y Fakes

```typescript
// src/__tests__/utils/firebase-mocks.ts

// Mock completo de repositorio
export function createMockPostRepository(): IPostRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue([]),
    update: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
    findByAuthor: vi.fn().mockResolvedValue([]),
    getFeed: vi.fn().mockResolvedValue([]),
    like: vi.fn().mockResolvedValue(undefined),
    unlike: vi.fn().mockResolvedValue(undefined)
  }
}

// Fake de repositorio (implementación en memoria para pruebas de integración)
export class InMemoryPostRepository implements IPostRepository {
  private posts: Map<string, Post> = new Map()

  async save(post: Post): Promise<void> {
    this.posts.set(post.id.value, post)
  }

  async findById(id: PostId): Promise<Post | null> {
    return this.posts.get(id.value) ?? null
  }

  async findAll(limit?: number): Promise<Post[]> {
    const todos = Array.from(this.posts.values())
    return limit ? todos.slice(0, limit) : todos
  }

  async update(post: Post): Promise<void> {
    this.posts.set(post.id.value, post)
  }

  async delete(id: PostId): Promise<void> {
    this.posts.delete(id.value)
  }

  async exists(id: PostId): Promise<boolean> {
    return this.posts.has(id.value)
  }

  async getFeed(userId: UserId, lastPostId?: PostId, limit = 20): Promise<Post[]> {
    return Array.from(this.posts.values()).slice(0, limit)
  }

  async like(postId: PostId, userId: UserId): Promise<void> {
    const post = this.posts.get(postId.value)
    if (post) post.like(userId)
  }

  async unlike(postId: PostId, userId: UserId): Promise<void> {
    const post = this.posts.get(postId.value)
    if (post) post.unlike(userId)
  }

  // Helpers para pruebas
  clear(): void { this.posts.clear() }
  count(): number { return this.posts.size }
  getAll(): Post[] { return Array.from(this.posts.values()) }
}
```

---

## Flujo TDD

### Red → Green → Refactor

```typescript
// 1. 🔴 RED — Escribir la prueba que falla
describe('PostContent Value Object', () => {
  it('debe rechazar contenido vacío', () => {
    expect(() => PostContent.create('')).toThrow('El contenido no puede estar vacío')
  })

  it('debe rechazar contenido mayor a 280 caracteres', () => {
    const contenidoLargo = 'a'.repeat(281)
    expect(() => PostContent.create(contenidoLargo)).toThrow('El contenido no puede superar 280 caracteres')
  })

  it('debe crear value object con contenido válido', () => {
    const content = PostContent.create('Hola mundo')
    expect(content.value).toBe('Hola mundo')
  })
})

// 2. 🟢 GREEN — Implementar la mínima lógica para pasar
export class PostContent {
  private constructor(public readonly value: string) {}

  static create(content: string): PostContent {
    if (!content || content.trim().length === 0) {
      throw new Error('El contenido no puede estar vacío')
    }
    if (content.length > 280) {
      throw new Error('El contenido no puede superar 280 caracteres')
    }
    return new PostContent(content.trim())
  }
}

// 3. 🔵 REFACTOR — Mejorar sin romper pruebas
export class PostContent {
  private static readonly MIN_LENGTH = 1
  private static readonly MAX_LENGTH = 280

  private constructor(public readonly value: string) {}

  static create(content: string): PostContent {
    const trimmed = content.trim()
    this.validate(trimmed)
    return new PostContent(trimmed)
  }

  private static validate(content: string): void {
    if (content.length < this.MIN_LENGTH) {
      throw new Error('El contenido no puede estar vacío')
    }
    if (content.length > this.MAX_LENGTH) {
      throw new Error(`El contenido no puede superar ${this.MAX_LENGTH} caracteres`)
    }
  }

  equals(other: PostContent): boolean {
    return this.value === other.value
  }

  get length(): number {
    return this.value.length
  }

  get remainingChars(): number {
    return PostContent.MAX_LENGTH - this.value.length
  }
}
```

---

## Suite de Pruebas para App Social Nexo

### Scripts de NPM

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

### Objetivo de Cobertura para Nexo

| Módulo | Cobertura Mínima |
|--------|-----------------|
| `core/entities/` | 95% |
| `core/value-objects/` | 100% |
| `core/use-cases/` | 90% |
| `application/stores/` | 85% |
| `application/composables/` | 80% |
| `presentation/components/` | 75% |
| `shared/utils/` | 95% |
| **Total** | **≥ 80%** |
