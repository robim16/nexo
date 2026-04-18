---
name: vue-arquitectura-senior
description: Arquitectura para aplicaciones Vue 3 de nivel empresarial con Arquitectura Limpia, principios SOLID y estructura de carpetas escalable. Usar este skill al construir aplicaciones Vue que requieran mantenibilidad, capacidad de prueba y escalabilidad. Activar con menciones de "Vue 3", "Composition API", "arquitectura limpia", "SOLID", "app Vue escalable", "Vue empresarial", "arquitectura Vue", "arquitectura por capas", "diseño guiado por dominio en Vue", o cualquier solicitud para estructurar correctamente una aplicación Vue compleja. También activar cuando el usuario quiera refactorizar código Vue existente para seguir mejores prácticas, implementar separación de responsabilidades u organizar una base de código en crecimiento.
---

# Vue Arquitectura Senior

Guía completa para construir aplicaciones Vue 3 de nivel empresarial utilizando principios de Arquitectura Limpia, patrones de diseño SOLID y patrones TypeScript avanzados.

## Tabla de Contenidos

1. [Principios Fundamentales de Arquitectura](#principios-fundamentales-de-arquitectura)
2. [Estructura de Carpetas](#estructura-de-carpetas)
3. [Responsabilidades de Cada Capa](#responsabilidades-de-cada-capa)
4. [Patrones de Implementación](#patrones-de-implementación)
5. [Ejemplo Real: App Social Nexo](#ejemplo-real-app-social-nexo)

---

## Principios Fundamentales de Arquitectura

### Arquitectura Limpia en Vue

La aplicación se divide en capas concéntricas, donde las dependencias apuntan hacia adentro:

```
┌─────────────────────────────────────┐
│   Capa de Presentación (Vue UI)     │
├─────────────────────────────────────┤
│   Capa de Aplicación (Casos de Uso) │
├─────────────────────────────────────┤
│   Capa de Dominio (Lógica Negocio)  │  ← Núcleo (sin dependencias)
├─────────────────────────────────────┤
│   Infraestructura (APIs Externas)   │
└─────────────────────────────────────┘
```

**Principios Clave:**

1. **Regla de Dependencia**: Las capas internas nunca dependen de las externas
2. **Segregación de Interfaces**: Define interfaces en el dominio, impleméntalas en infraestructura
3. **Responsabilidad Única**: Cada módulo tiene una sola razón para cambiar
4. **Abierto/Cerrado**: Abierto para extensión, cerrado para modificación
5. **Inversión de Dependencias**: Depende de abstracciones, no de implementaciones concretas

---

## Estructura de Carpetas

### Estructura Recomendada para App Social

```
src/
├── core/                          # Capa de Dominio (Lógica de Negocio)
│   ├── entities/                  # Entidades de negocio centrales
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   ├── Comment.ts
│   │   ├── Follow.ts
│   │   └── Notification.ts
│   │
│   ├── value-objects/             # Valores inmutables del dominio
│   │   ├── Email.ts
│   │   ├── UserId.ts
│   │   ├── PostContent.ts
│   │   └── Timestamp.ts
│   │
│   ├── use-cases/                 # Casos de uso de negocio
│   │   ├── auth/
│   │   │   ├── LoginUseCase.ts
│   │   │   ├── RegisterUseCase.ts
│   │   │   └── LogoutUseCase.ts
│   │   ├── posts/
│   │   │   ├── CreatePostUseCase.ts
│   │   │   ├── GetFeedUseCase.ts
│   │   │   ├── LikePostUseCase.ts
│   │   │   └── DeletePostUseCase.ts
│   │   ├── social/
│   │   │   ├── FollowUserUseCase.ts
│   │   │   ├── UnfollowUserUseCase.ts
│   │   │   └── GetFollowersUseCase.ts
│   │   └── notifications/
│   │       ├── GetNotificationsUseCase.ts
│   │       └── MarkAsReadUseCase.ts
│   │
│   └── ports/                     # Interfaces (contratos)
│       ├── repositories/
│       │   ├── IUserRepository.ts
│       │   ├── IPostRepository.ts
│       │   ├── IFollowRepository.ts
│       │   └── INotificationRepository.ts
│       ├── services/
│       │   ├── IAuthService.ts
│       │   ├── IStorageService.ts
│       │   └── IAnalyticsService.ts
│       └── events/
│           └── IEventBus.ts
│
├── infrastructure/                # Implementaciones externas
│   ├── firebase/
│   │   ├── repositories/
│   │   │   ├── FirebaseUserRepository.ts
│   │   │   ├── FirebasePostRepository.ts
│   │   │   ├── FirebaseFollowRepository.ts
│   │   │   └── FirebaseNotificationRepository.ts
│   │   ├── services/
│   │   │   ├── FirebaseAuthService.ts
│   │   │   └── FirebaseStorageService.ts
│   │   ├── converters/            # Conversores de datos Firestore
│   │   │   ├── UserConverter.ts
│   │   │   └── PostConverter.ts
│   │   └── config/
│   │       └── firebase.config.ts
│   │
│   ├── http/                      # APIs HTTP externas
│   │   ├── clients/
│   │   └── interceptors/
│   │
│   ├── storage/                   # Adaptadores de almacenamiento local
│   │   ├── LocalStorageAdapter.ts
│   │   └── IndexedDBAdapter.ts
│   │
│   └── analytics/
│       └── GoogleAnalyticsService.ts
│
├── application/                   # Capa de Aplicación
│   ├── services/                  # Servicios de aplicación
│   │   ├── FeedService.ts
│   │   ├── NotificationService.ts
│   │   └── SearchService.ts
│   │
│   ├── stores/                    # Stores Pinia (gestión de estado)
│   │   ├── auth.store.ts
│   │   ├── posts.store.ts
│   │   ├── users.store.ts
│   │   ├── notifications.store.ts
│   │   └── ui.store.ts
│   │
│   ├── composables/               # Funciones de composición reutilizables
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useRealtime.ts
│   │   ├── useDebounce.ts
│   │   └── useOptimisticUpdate.ts
│   │
│   ├── validators/                # Validación de entradas
│   │   ├── AuthValidator.ts
│   │   ├── PostValidator.ts
│   │   └── ValidationRules.ts
│   │
│   └── mappers/                   # Mapeadores DTO
│       ├── UserMapper.ts
│       └── PostMapper.ts
│
├── presentation/                  # Capa de UI
│   ├── components/                # Componentes por feature
│   │   ├── auth/
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegisterForm.vue
│   │   │   └── __tests__/
│   │   ├── feed/
│   │   │   ├── PostCard.vue
│   │   │   ├── PostList.vue
│   │   │   ├── CreatePostDialog.vue
│   │   │   └── __tests__/
│   │   ├── profile/
│   │   │   ├── ProfileHeader.vue
│   │   │   ├── ProfileStats.vue
│   │   │   ├── FollowButton.vue
│   │   │   └── __tests__/
│   │   ├── notifications/
│   │   │   ├── NotificationList.vue
│   │   │   ├── NotificationItem.vue
│   │   │   └── __tests__/
│   │   └── common/                # Componentes UI compartidos
│   │       ├── BaseButton.vue
│   │       ├── BaseInput.vue
│   │       ├── BaseCard.vue
│   │       ├── LoadingSpinner.vue
│   │       └── ErrorBoundary.vue
│   │
│   ├── views/                     # Páginas a nivel de ruta
│   │   ├── HomePage.vue
│   │   ├── ProfilePage.vue
│   │   ├── ExplorePage.vue
│   │   ├── NotificationsPage.vue
│   │   └── SettingsPage.vue
│   │
│   ├── layouts/                   # Componentes de layout
│   │   ├── DefaultLayout.vue
│   │   ├── AuthLayout.vue
│   │   └── EmptyLayout.vue
│   │
│   └── router/
│       ├── index.ts
│       ├── guards/
│       │   ├── authGuard.ts
│       │   └── roleGuard.ts
│       └── routes/
│           ├── authRoutes.ts
│           ├── mainRoutes.ts
│           └── adminRoutes.ts
│
├── shared/                        # Aspectos transversales
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   ├── file.utils.ts
│   │   └── validators.ts
│   │
│   ├── types/                     # Tipos TypeScript compartidos
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   └── firebase.types.ts
│   │
│   ├── constants/
│   │   ├── config.ts
│   │   ├── routes.ts
│   │   └── errors.ts
│   │
│   ├── errors/                    # Clases de error personalizadas
│   │   ├── AppError.ts
│   │   ├── ValidationError.ts
│   │   ├── AuthError.ts
│   │   └── NetworkError.ts
│   │
│   └── plugins/                   # Plugins Vue
│       ├── i18n.ts
│       ├── toast.ts
│       └── analytics.ts
│
├── main.ts                        # Punto de entrada de la aplicación
├── App.vue                        # Componente raíz
└── dependency-injection.ts        # Configuración del contenedor DI
```

---

## Responsabilidades de Cada Capa

### 1. Capa de Dominio (`core/`)

**Propósito**: Contiene lógica de negocio pura sin dependencias externas.

**Entidades** (`entities/`):
- Objetos de negocio centrales con comportamiento
- Independientes de frameworks
- Modelos de dominio ricos (no anémicos)

**Ejemplo — Entidad User:**

```typescript
// core/entities/User.ts
import { UserId } from '../value-objects/UserId'
import { Email } from '../value-objects/Email'

export class User {
  constructor(
    public readonly id: UserId,
    public readonly email: Email,
    private _displayName: string,
    private _bio: string,
    private _avatar: string | null,
    private _followersCount: number = 0,
    private _followingCount: number = 0,
    private _postsCount: number = 0,
    public readonly createdAt: Date,
    private _isVerified: boolean = false
  ) {}

  // Métodos de lógica de negocio
  updateProfile(displayName: string, bio: string): void {
    if (displayName.length < 3) {
      throw new Error('El nombre debe tener al menos 3 caracteres')
    }
    if (bio.length > 500) {
      throw new Error('La biografía no puede superar 500 caracteres')
    }
    this._displayName = displayName
    this._bio = bio
  }

  follow(): void {
    this._followingCount++
  }

  unfollow(): void {
    if (this._followingCount > 0) {
      this._followingCount--
    }
  }

  incrementFollowers(): void {
    this._followersCount++
  }

  decrementFollowers(): void {
    if (this._followersCount > 0) {
      this._followersCount--
    }
  }

  verify(): void {
    this._isVerified = true
  }

  canPost(): boolean {
    return this._isVerified || this._followersCount > 0
  }

  // Getters
  get displayName(): string { return this._displayName }
  get bio(): string { return this._bio }
  get avatar(): string | null { return this._avatar }
  get followersCount(): number { return this._followersCount }
  get followingCount(): number { return this._followingCount }
  get postsCount(): number { return this._postsCount }
  get isVerified(): boolean { return this._isVerified }

  // Método factory
  static create(data: {
    email: string
    displayName: string
    bio?: string
  }): User {
    return new User(
      UserId.generate(),
      Email.create(data.email),
      data.displayName,
      data.bio || '',
      null,
      0, 0, 0,
      new Date(),
      false
    )
  }

  // Serialización
  toPlainObject() {
    return {
      id: this.id.value,
      email: this.email.value,
      displayName: this._displayName,
      bio: this._bio,
      avatar: this._avatar,
      followersCount: this._followersCount,
      followingCount: this._followingCount,
      postsCount: this._postsCount,
      createdAt: this.createdAt.toISOString(),
      isVerified: this._isVerified
    }
  }
}
```

**Value Objects** (`value-objects/`):
- Objetos inmutables definidos por su valor
- Sin identidad propia
- Encapsulan validación

**Ejemplo — Value Object Email:**

```typescript
// core/value-objects/Email.ts
export class Email {
  private constructor(public readonly value: string) {
    this.validate(value)
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error(`Email inválido: ${email}`)
    }
  }

  static create(email: string): Email {
    return new Email(email.toLowerCase().trim())
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
```

**Casos de Uso** (`use-cases/`):
- Reglas de negocio específicas de la aplicación
- Orquestan el flujo de datos
- Un caso de uso = una responsabilidad

**Ejemplo — Caso de Uso Crear Post:**

```typescript
// core/use-cases/posts/CreatePostUseCase.ts
import { IPostRepository } from '../../ports/repositories/IPostRepository'
import { IStorageService } from '../../ports/services/IStorageService'
import { Post } from '../../entities/Post'
import { UserId } from '../../value-objects/UserId'
import { PostContent } from '../../value-objects/PostContent'

export interface CreatePostDTO {
  userId: string
  content: string
  images?: File[]
  mentions?: string[]
}

export class CreatePostUseCase {
  constructor(
    private readonly postRepository: IPostRepository,
    private readonly storageService: IStorageService
  ) {}

  async execute(dto: CreatePostDTO): Promise<Post> {
    // 1. Validar
    const userId = UserId.fromString(dto.userId)
    const content = PostContent.create(dto.content)

    // 2. Subir imágenes si existen
    const imageUrls: string[] = []
    if (dto.images && dto.images.length > 0) {
      const uploadPromises = dto.images.map(file =>
        this.storageService.uploadImage(file, `posts/${userId.value}`)
      )
      imageUrls.push(...await Promise.all(uploadPromises))
    }

    // 3. Crear entidad
    const post = Post.create({
      authorId: userId,
      content,
      images: imageUrls,
      mentions: dto.mentions || []
    })

    // 4. Persistir
    await this.postRepository.save(post)

    // 5. Retornar
    return post
  }
}
```

**Puertos** (`ports/`):
- Interfaces que definen contratos
- Implementadas por la capa de infraestructura

**Ejemplo — Interfaz de Repositorio:**

```typescript
// core/ports/repositories/IPostRepository.ts
import { Post } from '../../entities/Post'
import { UserId } from '../../value-objects/UserId'
import { PostId } from '../../value-objects/PostId'

export interface IPostRepository {
  save(post: Post): Promise<void>
  findById(id: PostId): Promise<Post | null>
  findByAuthor(authorId: UserId, limit?: number): Promise<Post[]>
  getFeed(userId: UserId, lastPostId?: PostId, limit?: number): Promise<Post[]>
  delete(id: PostId): Promise<void>
  update(post: Post): Promise<void>
  like(postId: PostId, userId: UserId): Promise<void>
  unlike(postId: PostId, userId: UserId): Promise<void>
}
```

---

### 2. Capa de Infraestructura (`infrastructure/`)

**Propósito**: Implementa las interfaces definidas en el dominio usando dependencias externas.

**Puntos Clave:**
- Contiene todo el código específico de framework
- Implementa el patrón repositorio
- Maneja la conversión de datos
- Nunca importa de las capas de aplicación/presentación

**Ejemplo — Repositorio Firebase:**

```typescript
// infrastructure/firebase/repositories/FirebasePostRepository.ts
import {
  collection, doc, setDoc, getDoc,
  query, where, orderBy, limit as fbLimit,
  getDocs, deleteDoc, Timestamp,
  arrayUnion, arrayRemove, increment
} from 'firebase/firestore'
import { db } from '../config/firebase.config'
import { IPostRepository } from '../../../core/ports/repositories/IPostRepository'
import { Post } from '../../../core/entities/Post'
import { PostConverter } from '../converters/PostConverter'
import { UserId } from '../../../core/value-objects/UserId'
import { PostId } from '../../../core/value-objects/PostId'

export class FirebasePostRepository implements IPostRepository {
  private readonly coleccion = collection(db, 'posts')
  private readonly converter = new PostConverter()

  async save(post: Post): Promise<void> {
    const docRef = doc(this.coleccion, post.id.value)
    const data = this.converter.toFirestore(post)
    await setDoc(docRef, data)
  }

  async findById(id: PostId): Promise<Post | null> {
    const docRef = doc(this.coleccion, id.value)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return this.converter.fromFirestore(snapshot.data())
  }

  async findByAuthor(authorId: UserId, limit: number = 20): Promise<Post[]> {
    const q = query(
      this.coleccion,
      where('authorId', '==', authorId.value),
      orderBy('createdAt', 'desc'),
      fbLimit(limit)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => this.converter.fromFirestore(doc.data()))
  }

  async like(postId: PostId, userId: UserId): Promise<void> {
    const docRef = doc(this.coleccion, postId.value)
    await setDoc(docRef, {
      likes: arrayUnion(userId.value),
      likesCount: increment(1)
    }, { merge: true })
  }

  async unlike(postId: PostId, userId: UserId): Promise<void> {
    const docRef = doc(this.coleccion, postId.value)
    await setDoc(docRef, {
      likes: arrayRemove(userId.value),
      likesCount: increment(-1)
    }, { merge: true })
  }
}
```

---

### 3. Capa de Aplicación (`application/`)

**Propósito**: Coordina el flujo de la aplicación, gestiona el estado y provee lógica reutilizable.

**Stores (Pinia):**

```typescript
// application/stores/posts.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Post } from '../../core/entities/Post'
import { CreatePostUseCase } from '../../core/use-cases/posts/CreatePostUseCase'
import { GetFeedUseCase } from '../../core/use-cases/posts/GetFeedUseCase'
import { LikePostUseCase } from '../../core/use-cases/posts/LikePostUseCase'
import { container } from '../../dependency-injection'

export const usePostsStore = defineStore('posts', () => {
  // Estado
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const hasMore = ref(true)

  // Getters
  const feedPosts = computed(() =>
    posts.value.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  )

  // Acciones
  async function createPost(content: string, images?: File[]) {
    loading.value = true
    error.value = null
    try {
      const useCase = container.get<CreatePostUseCase>('CreatePostUseCase')
      const post = await useCase.execute({
        userId: 'current-user-id', // Obtener del auth store
        content,
        images
      })
      posts.value.unshift(post)
      return post
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadFeed(refresh: boolean = false) {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const useCase = container.get<GetFeedUseCase>('GetFeedUseCase')
      const newPosts = await useCase.execute({
        userId: 'current-user-id',
        limit: 20,
        lastPostId: refresh ? undefined : posts.value[posts.value.length - 1]?.id.value
      })
      if (refresh) {
        posts.value = newPosts
      } else {
        posts.value.push(...newPosts)
      }
      hasMore.value = newPosts.length === 20
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  async function likePost(postId: string) {
    const useCase = container.get<LikePostUseCase>('LikePostUseCase')
    // Actualización optimista
    const post = posts.value.find(p => p.id.value === postId)
    if (post) post.like()
    try {
      await useCase.execute({ postId, userId: 'current-user-id' })
    } catch (e) {
      // Rollback en error
      if (post) post.unlike()
      throw e
    }
  }

  return { posts, loading, error, hasMore, feedPosts, createPost, loadFeed, likePost }
})
```

**Composables:**

```typescript
// application/composables/usePosts.ts
import { ref, onMounted } from 'vue'
import { usePostsStore } from '../stores/posts.store'
import { storeToRefs } from 'pinia'

export function usePosts() {
  const store = usePostsStore()
  const { posts, loading, error } = storeToRefs(store)

  const createPost = async (content: string, images?: File[]) => {
    try {
      await store.createPost(content, images)
    } catch (e) {
      console.error('Error al crear publicación:', e)
      throw e
    }
  }

  const loadMore = async () => {
    if (loading.value || !store.hasMore) return
    await store.loadFeed(false)
  }

  const refresh = async () => {
    await store.loadFeed(true)
  }

  onMounted(() => {
    if (posts.value.length === 0) refresh()
  })

  return { posts, loading, error, createPost, loadMore, refresh }
}
```

---

### 4. Capa de Presentación (`presentation/`)

**Propósito**: Componentes Vue, vistas y enrutamiento.

**Ejemplo — Componente PostCard:**

```vue
<!-- presentation/components/feed/PostCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Post } from '../../../core/entities/Post'
import { useAuthStore } from '../../../application/stores/auth.store'
import { usePostsStore } from '../../../application/stores/posts.store'

interface Props {
  post: Post
}

const props = defineProps<Props>()
const authStore = useAuthStore()
const postsStore = usePostsStore()

const isLiked = computed(() =>
  props.post.likes.includes(authStore.currentUserId)
)

const handleLike = async () => {
  try {
    await postsStore.likePost(props.post.id.value)
  } catch (error) {
    console.error('Error al dar like:', error)
  }
}

const formattedDate = computed(() => {
  const now = new Date()
  const diff = now.getTime() - props.post.createdAt.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
})
</script>

<template>
  <article class="post-card">
    <header class="post-card__header">
      <img
        :src="post.author.avatar || '/avatar-default.png'"
        :alt="post.author.displayName"
        class="post-card__avatar"
      />
      <div class="post-card__author">
        <h3>{{ post.author.displayName }}</h3>
        <time>{{ formattedDate }}</time>
      </div>
    </header>

    <div class="post-card__content">
      <p>{{ post.content.value }}</p>
      <div v-if="post.images.length > 0" class="post-card__images">
        <img
          v-for="(image, idx) in post.images"
          :key="idx"
          :src="image"
          :alt="`Imagen ${idx + 1}`"
        />
      </div>
    </div>

    <footer class="post-card__footer">
      <button
        @click="handleLike"
        :class="{ 'is-liked': isLiked }"
        class="post-card__action"
      >
        ❤️ {{ post.likesCount }}
      </button>
      <button class="post-card__action">💬 {{ post.commentsCount }}</button>
      <button class="post-card__action">🔁 {{ post.sharesCount }}</button>
    </footer>
  </article>
</template>

<style scoped>
.post-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.post-card__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.post-card__avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
.post-card__author h3 { margin: 0; font-size: 0.95rem; font-weight: 600; }
.post-card__author time { font-size: 0.85rem; color: #666; }
.post-card__content p { margin: 0 0 1rem 0; line-height: 1.6; }
.post-card__images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}
.post-card__images img { width: 100%; border-radius: 8px; object-fit: cover; }
.post-card__footer { display: flex; gap: 1.5rem; padding-top: 1rem; border-top: 1px solid #eee; }
.post-card__action {
  background: none; border: none; cursor: pointer;
  font-size: 0.9rem; color: #666; transition: color 0.2s;
}
.post-card__action:hover { color: #000; }
.post-card__action.is-liked { color: #e91e63; }
</style>
```

---

## Patrones de Implementación

### 1. Inyección de Dependencias

```typescript
// dependency-injection.ts
import { Container } from 'inversify'
import 'reflect-metadata'

// Casos de Uso
import { CreatePostUseCase } from './core/use-cases/posts/CreatePostUseCase'
import { GetFeedUseCase } from './core/use-cases/posts/GetFeedUseCase'
import { LikePostUseCase } from './core/use-cases/posts/LikePostUseCase'

// Repositorios
import { IPostRepository } from './core/ports/repositories/IPostRepository'
import { FirebasePostRepository } from './infrastructure/firebase/repositories/FirebasePostRepository'

// Servicios
import { IStorageService } from './core/ports/services/IStorageService'
import { FirebaseStorageService } from './infrastructure/firebase/services/FirebaseStorageService'

const container = new Container()

// Vincular repositorios
container.bind<IPostRepository>('IPostRepository').to(FirebasePostRepository).inSingletonScope()

// Vincular servicios
container.bind<IStorageService>('IStorageService').to(FirebaseStorageService).inSingletonScope()

// Vincular casos de uso
container.bind<CreatePostUseCase>('CreatePostUseCase').to(CreatePostUseCase)
container.bind<GetFeedUseCase>('GetFeedUseCase').to(GetFeedUseCase)
container.bind<LikePostUseCase>('LikePostUseCase').to(LikePostUseCase)

export { container }
```

### 2. Estrategia de Manejo de Errores

```typescript
// shared/errors/AppError.ts
export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  abstract toJSON(): object
}

// shared/errors/ValidationError.ts
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: any
  ) {
    super(message, 'VALIDATION_ERROR', 400)
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      field: this.field,
      value: this.value
    }
  }
}
```

### 3. Patrón Bus de Eventos

```typescript
// core/ports/events/IEventBus.ts
export interface DomainEvent {
  type: string
  timestamp: Date
  payload: any
}

export interface IEventBus {
  publish(event: DomainEvent): void
  subscribe(eventType: string, handler: (event: DomainEvent) => void): void
  unsubscribe(eventType: string, handler: (event: DomainEvent) => void): void
}

// infrastructure/events/InMemoryEventBus.ts
import { IEventBus, DomainEvent } from '../../core/ports/events/IEventBus'

export class InMemoryEventBus implements IEventBus {
  private handlers: Map<string, Set<(event: DomainEvent) => void>> = new Map()

  publish(event: DomainEvent): void {
    const handlers = this.handlers.get(event.type)
    if (handlers) {
      handlers.forEach(handler => handler(event))
    }
  }

  subscribe(eventType: string, handler: (event: DomainEvent) => void): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler)
  }

  unsubscribe(eventType: string, handler: (event: DomainEvent) => void): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }
}
```

---

## Ejemplo Real: App Social Nexo

### Sistema de Seguidores — Implementación Completa

#### 1. Entidad de Dominio

```typescript
// core/entities/Follow.ts
import { UserId } from '../value-objects/UserId'
import { FollowId } from '../value-objects/FollowId'

export class Follow {
  constructor(
    public readonly id: FollowId,
    public readonly followerId: UserId,
    public readonly followingId: UserId,
    public readonly createdAt: Date
  ) {}

  static create(followerId: UserId, followingId: UserId): Follow {
    if (followerId.equals(followingId)) {
      throw new Error('No puedes seguirte a ti mismo')
    }
    return new Follow(FollowId.generate(), followerId, followingId, new Date())
  }

  toPlainObject() {
    return {
      id: this.id.value,
      followerId: this.followerId.value,
      followingId: this.followingId.value,
      createdAt: this.createdAt.toISOString()
    }
  }
}
```

#### 2. Caso de Uso

```typescript
// core/use-cases/social/FollowUserUseCase.ts
import { IFollowRepository } from '../../ports/repositories/IFollowRepository'
import { IUserRepository } from '../../ports/repositories/IUserRepository'
import { IEventBus } from '../../ports/events/IEventBus'
import { UserId } from '../../value-objects/UserId'
import { Follow } from '../../entities/Follow'

export interface FollowUserDTO {
  followerId: string
  followingId: string
}

export class FollowUserUseCase {
  constructor(
    private readonly followRepository: IFollowRepository,
    private readonly userRepository: IUserRepository,
    private readonly eventBus: IEventBus
  ) {}

  async execute(dto: FollowUserDTO): Promise<void> {
    const followerId = UserId.fromString(dto.followerId)
    const followingId = UserId.fromString(dto.followingId)

    // Verificar si ya sigue
    const existingFollow = await this.followRepository.findByFollowerAndFollowing(
      followerId, followingId
    )
    if (existingFollow) {
      throw new Error('Ya estás siguiendo a este usuario')
    }

    // Crear relación de seguimiento
    const follow = Follow.create(followerId, followingId)
    await this.followRepository.save(follow)

    // Actualizar contadores
    const follower = await this.userRepository.findById(followerId)
    const following = await this.userRepository.findById(followingId)

    if (follower && following) {
      follower.follow()
      following.incrementFollowers()
      await this.userRepository.update(follower)
      await this.userRepository.update(following)
    }

    // Publicar evento
    this.eventBus.publish({
      type: 'USER_FOLLOWED',
      timestamp: new Date(),
      payload: { followerId: dto.followerId, followingId: dto.followingId }
    })
  }
}
```

#### 3. Composable de Seguimiento

```typescript
// application/composables/useFollow.ts
import { ref } from 'vue'
import { container } from '../../dependency-injection'
import { FollowUserUseCase } from '../../core/use-cases/social/FollowUserUseCase'
import { UnfollowUserUseCase } from '../../core/use-cases/social/UnfollowUserUseCase'

export function useFollow(userId: string) {
  const isFollowing = ref(false)
  const loading = ref(false)

  const toggleFollow = async (currentUserId: string) => {
    loading.value = true
    try {
      if (isFollowing.value) {
        const useCase = container.get<UnfollowUserUseCase>('UnfollowUserUseCase')
        await useCase.execute({ followerId: currentUserId, followingId: userId })
        isFollowing.value = false
      } else {
        const useCase = container.get<FollowUserUseCase>('FollowUserUseCase')
        await useCase.execute({ followerId: currentUserId, followingId: userId })
        isFollowing.value = true
      }
    } catch (error) {
      console.error('Error al cambiar seguimiento:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return { isFollowing, loading, toggleFollow }
}
```

---

## Resumen de Mejores Prácticas

### SOLID en Vue

1. **Responsabilidad Única**: Cada composable, componente y clase tiene un solo trabajo
2. **Abierto/Cerrado**: Usar composición y props para extensión
3. **Sustitución de Liskov**: Los repositorios son intercambiables
4. **Segregación de Interfaces**: Interfaces pequeñas y enfocadas
5. **Inversión de Dependencias**: Depende de abstracciones (interfaces), no de implementaciones

### Beneficios de la Arquitectura Limpia

- **Capacidad de prueba**: La lógica de negocio no tiene dependencias de framework
- **Mantenibilidad**: Los cambios están aislados en capas específicas
- **Escalabilidad**: Añadir features sin tocar la lógica central
- **Flexibilidad**: Reemplazar Firebase por otro backend con cambios mínimos

### Patrones Clave

1. **Patrón Repositorio**: Abstrae el acceso a datos
2. **Patrón Caso de Uso**: Encapsula operaciones de negocio
3. **Value Objects**: Garantiza la validez de los datos
4. **Eventos de Dominio**: Desacopla features entre sí
5. **Inyección de Dependencias**: Invierte el flujo de control

---

## Inicio Rápido

Para generar un nuevo feature siguiendo esta arquitectura:

```bash
node scripts/generate-feature.js --name notifications --type crud
```

Esto creará:
- Entidad
- Value objects
- Casos de uso
- Interfaz de repositorio
- Implementación Firebase
- Store Pinia
- Composable
- Componentes Vue
- Archivos de prueba

Todos siguiendo el patrón de Arquitectura Limpia.
