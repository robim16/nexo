---
name: vue-senior-architecture
description: Architecture for enterprise-level Vue 3 applications with Clean Architecture, SOLID principles, and scalable folder structure. Use this skill whenever building Vue applications that require maintainability, testability, and scalability. Triggers include mentions of "Vue 3", "Composition API", "clean architecture", "SOLID", "scalable Vue app", "enterprise Vue", "Vue architecture", "layered architecture", "domain-driven design in Vue", or any request to structure a complex Vue application properly. Also trigger when the user wants to refactor existing Vue code to follow best practices, implement separation of concerns, or organize a growing codebase.
---

# Vue Senior Architecture

A comprehensive guide for building enterprise-grade Vue 3 applications using Clean Architecture principles, SOLID design patterns, and advanced TypeScript patterns.

## Table of Contents

1. [Core Architecture Principles](#core-architecture-principles)
2. [Folder Structure](#folder-structure)
3. [Layer Responsibilities](#layer-responsibilities)
4. [Implementation Patterns](#implementation-patterns)
5. [Real-World Example: Social App](#real-world-example-social-app)

---

## Core Architecture Principles

### Clean Architecture in Vue

The application is divided into concentric layers, with dependencies pointing inward:

```
┌─────────────────────────────────────┐
│   Presentation Layer (Vue UI)      │
├─────────────────────────────────────┤
│   Application Layer (Use Cases)    │
├─────────────────────────────────────┤
│   Domain Layer (Business Logic)    │  ← Core (no dependencies)
├─────────────────────────────────────┤
│   Infrastructure (External APIs)   │
└─────────────────────────────────────┘
```

**Key Principles:**

1. **Dependency Rule**: Inner layers never depend on outer layers
2. **Interface Segregation**: Define interfaces in the domain, implement in infrastructure
3. **Single Responsibility**: Each module has one reason to change
4. **Open/Closed**: Open for extension, closed for modification
5. **Dependency Inversion**: Depend on abstractions, not concretions

---

## Folder Structure

### Recommended Structure for Social App

```
src/
├── core/                          # Domain Layer (Business Logic)
│   ├── entities/                  # Core business entities
│   │   ├── User.ts
│   │   ├── Post.ts
│   │   ├── Comment.ts
│   │   ├── Follow.ts
│   │   └── Notification.ts
│   │
│   ├── value-objects/             # Immutable domain values
│   │   ├── Email.ts
│   │   ├── UserId.ts
│   │   ├── PostContent.ts
│   │   └── Timestamp.ts
│   │
│   ├── use-cases/                 # Business use cases
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
│   └── ports/                     # Interfaces (contracts)
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
├── infrastructure/                # External implementations
│   ├── firebase/
│   │   ├── repositories/
│   │   │   ├── FirebaseUserRepository.ts
│   │   │   ├── FirebasePostRepository.ts
│   │   │   ├── FirebaseFollowRepository.ts
│   │   │   └── FirebaseNotificationRepository.ts
│   │   ├── services/
│   │   │   ├── FirebaseAuthService.ts
│   │   │   └── FirebaseStorageService.ts
│   │   ├── converters/            # Firestore data converters
│   │   │   ├── UserConverter.ts
│   │   │   └── PostConverter.ts
│   │   └── config/
│   │       └── firebase.config.ts
│   │
│   ├── http/                      # External HTTP APIs
│   │   ├── clients/
│   │   └── interceptors/
│   │
│   ├── storage/                   # Local storage adapters
│   │   ├── LocalStorageAdapter.ts
│   │   └── IndexedDBAdapter.ts
│   │
│   └── analytics/
│       └── GoogleAnalyticsService.ts
│
├── application/                   # Application Layer
│   ├── services/                  # Application services
│   │   ├── FeedService.ts
│   │   ├── NotificationService.ts
│   │   └── SearchService.ts
│   │
│   ├── stores/                    # Pinia stores (state management)
│   │   ├── auth.store.ts
│   │   ├── posts.store.ts
│   │   ├── users.store.ts
│   │   ├── notifications.store.ts
│   │   └── ui.store.ts
│   │
│   ├── composables/               # Reusable composition functions
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   ├── useInfiniteScroll.ts
│   │   ├── useRealtime.ts
│   │   ├── useDebounce.ts
│   │   └── useOptimisticUpdate.ts
│   │
│   ├── validators/                # Input validation
│   │   ├── AuthValidator.ts
│   │   ├── PostValidator.ts
│   │   └── ValidationRules.ts
│   │
│   └── mappers/                   # DTO mappers
│       ├── UserMapper.ts
│       └── PostMapper.ts
│
├── presentation/                  # UI Layer
│   ├── components/                # Feature-based components
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
│   │   └── common/                # Shared UI components
│   │       ├── BaseButton.vue
│   │       ├── BaseInput.vue
│   │       ├── BaseCard.vue
│   │       ├── LoadingSpinner.vue
│   │       └── ErrorBoundary.vue
│   │
│   ├── views/                     # Route-level pages
│   │   ├── HomePage.vue
│   │   ├── ProfilePage.vue
│   │   ├── ExplorePage.vue
│   │   ├── NotificationsPage.vue
│   │   └── SettingsPage.vue
│   │
│   ├── layouts/                   # Layout components
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
├── shared/                        # Cross-cutting concerns
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   ├── file.utils.ts
│   │   └── validators.ts
│   │
│   ├── types/                     # Shared TypeScript types
│   │   ├── common.types.ts
│   │   ├── api.types.ts
│   │   └── firebase.types.ts
│   │
│   ├── constants/
│   │   ├── config.ts
│   │   ├── routes.ts
│   │   └── errors.ts
│   │
│   ├── errors/                    # Custom error classes
│   │   ├── AppError.ts
│   │   ├── ValidationError.ts
│   │   ├── AuthError.ts
│   │   └── NetworkError.ts
│   │
│   └── plugins/                   # Vue plugins
│       ├── i18n.ts
│       ├── toast.ts
│       └── analytics.ts
│
├── main.ts                        # Application entry point
├── App.vue                        # Root component
└── dependency-injection.ts        # DI container setup
```

---

## Layer Responsibilities

### 1. Domain Layer (`core/`)

**Purpose**: Contains pure business logic with zero external dependencies.

**Entities** (`entities/`):
- Core business objects with behavior
- Independent of frameworks
- Rich domain models (not anemic)

**Example - User Entity:**

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

  // Business logic methods
  updateProfile(displayName: string, bio: string): void {
    if (displayName.length < 3) {
      throw new Error('Display name must be at least 3 characters')
    }
    if (bio.length > 500) {
      throw new Error('Bio cannot exceed 500 characters')
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

  // Factory method
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
      0,
      0,
      0,
      new Date(),
      false
    )
  }

  // Serialization
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
- Immutable objects defined by their value
- No identity
- Encapsulate validation

**Example - Email Value Object:**

```typescript
// core/value-objects/Email.ts
export class Email {
  private constructor(public readonly value: string) {
    this.validate(value)
  }

  private validate(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email: ${email}`)
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

**Use Cases** (`use-cases/`):
- Application-specific business rules
- Orchestrates the flow of data
- Single responsibility per use case

**Example - Create Post Use Case:**

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
    // 1. Validate
    const userId = UserId.fromString(dto.userId)
    const content = PostContent.create(dto.content)

    // 2. Upload images if present
    const imageUrls: string[] = []
    if (dto.images && dto.images.length > 0) {
      const uploadPromises = dto.images.map(file => 
        this.storageService.uploadImage(file, `posts/${userId.value}`)
      )
      imageUrls.push(...await Promise.all(uploadPromises))
    }

    // 3. Create entity
    const post = Post.create({
      authorId: userId,
      content,
      images: imageUrls,
      mentions: dto.mentions || []
    })

    // 4. Persist
    await this.postRepository.save(post)

    // 5. Return
    return post
  }
}
```

**Ports** (`ports/`):
- Interfaces that define contracts
- Implemented by infrastructure layer

**Example - Repository Interface:**

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

### 2. Infrastructure Layer (`infrastructure/`)

**Purpose**: Implements interfaces defined in domain layer using external dependencies.

**Key Points:**
- Contains all framework-specific code
- Implements repository patterns
- Handles data conversion
- Never imports from application/presentation layers

**Example - Firebase Repository:**

```typescript
// infrastructure/firebase/repositories/FirebasePostRepository.ts
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit as fbLimit,
  getDocs,
  deleteDoc,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore'
import { db } from '../config/firebase.config'
import { IPostRepository } from '../../../core/ports/repositories/IPostRepository'
import { Post } from '../../../core/entities/Post'
import { PostConverter } from '../converters/PostConverter'
import { UserId } from '../../../core/value-objects/UserId'
import { PostId } from '../../../core/value-objects/PostId'

export class FirebasePostRepository implements IPostRepository {
  private readonly collection = collection(db, 'posts')
  private readonly converter = new PostConverter()

  async save(post: Post): Promise<void> {
    const docRef = doc(this.collection, post.id.value)
    const data = this.converter.toFirestore(post)
    await setDoc(docRef, data)
  }

  async findById(id: PostId): Promise<Post | null> {
    const docRef = doc(this.collection, id.value)
    const snapshot = await getDoc(docRef)
    
    if (!snapshot.exists()) {
      return null
    }
    
    return this.converter.fromFirestore(snapshot.data())
  }

  async findByAuthor(authorId: UserId, limit: number = 20): Promise<Post[]> {
    const q = query(
      this.collection,
      where('authorId', '==', authorId.value),
      orderBy('createdAt', 'desc'),
      fbLimit(limit)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => this.converter.fromFirestore(doc.data()))
  }

  async getFeed(userId: UserId, lastPostId?: PostId, limit: number = 20): Promise<Post[]> {
    // Implementation would query posts from followed users
    // This is simplified for brevity
    const q = query(
      this.collection,
      orderBy('createdAt', 'desc'),
      fbLimit(limit)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => this.converter.fromFirestore(doc.data()))
  }

  async delete(id: PostId): Promise<void> {
    const docRef = doc(this.collection, id.value)
    await deleteDoc(docRef)
  }

  async update(post: Post): Promise<void> {
    await this.save(post) // In this case, save handles updates too
  }

  async like(postId: PostId, userId: UserId): Promise<void> {
    const docRef = doc(this.collection, postId.value)
    await setDoc(docRef, {
      likes: arrayUnion(userId.value),
      likesCount: increment(1)
    }, { merge: true })
  }

  async unlike(postId: PostId, userId: UserId): Promise<void> {
    const docRef = doc(this.collection, postId.value)
    await setDoc(docRef, {
      likes: arrayRemove(userId.value),
      likesCount: increment(-1)
    }, { merge: true })
  }
}
```

---

### 3. Application Layer (`application/`)

**Purpose**: Coordinates application flow, manages state, and provides reusable logic.

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
  // State
  const posts = ref<Post[]>([])
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const hasMore = ref(true)

  // Getters
  const feedPosts = computed(() => 
    posts.value.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  )

  // Actions
  async function createPost(content: string, images?: File[]) {
    loading.value = true
    error.value = null
    
    try {
      const useCase = container.get<CreatePostUseCase>('CreatePostUseCase')
      const post = await useCase.execute({
        userId: 'current-user-id', // Get from auth store
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
    
    // Optimistic update
    const post = posts.value.find(p => p.id.value === postId)
    if (post) {
      post.like()
    }
    
    try {
      await useCase.execute({ postId, userId: 'current-user-id' })
    } catch (e) {
      // Rollback on error
      if (post) {
        post.unlike()
      }
      throw e
    }
  }

  return {
    // State
    posts,
    loading,
    error,
    hasMore,
    // Getters
    feedPosts,
    // Actions
    createPost,
    loadFeed,
    likePost
  }
})
```

**Composables:**

```typescript
// application/composables/usePosts.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { usePostsStore } from '../stores/posts.store'
import { storeToRefs } from 'pinia'

export function usePosts() {
  const store = usePostsStore()
  const { posts, loading, error } = storeToRefs(store)

  const createPost = async (content: string, images?: File[]) => {
    try {
      await store.createPost(content, images)
    } catch (e) {
      console.error('Failed to create post:', e)
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
    if (posts.value.length === 0) {
      refresh()
    }
  })

  return {
    posts,
    loading,
    error,
    createPost,
    loadMore,
    refresh
  }
}
```

---

### 4. Presentation Layer (`presentation/`)

**Purpose**: Vue components, views, and routing.

**Component Example:**

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
    console.error('Failed to like post:', error)
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
        :src="post.author.avatar || '/default-avatar.png'" 
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
          :alt="`Post image ${idx + 1}`"
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
      <button class="post-card__action">
        💬 {{ post.commentsCount }}
      </button>
      <button class="post-card__action">
        🔁 {{ post.sharesCount }}
      </button>
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

.post-card__author h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.post-card__author time {
  font-size: 0.85rem;
  color: #666;
}

.post-card__content p {
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.post-card__images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-top: 1rem;
}

.post-card__images img {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
}

.post-card__footer {
  display: flex;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.post-card__action {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #666;
  transition: color 0.2s;
}

.post-card__action:hover {
  color: #000;
}

.post-card__action.is-liked {
  color: #e91e63;
}
</style>
```

---

## Implementation Patterns

### 1. Dependency Injection

```typescript
// dependency-injection.ts
import { Container } from 'inversify'
import 'reflect-metadata'

// Use Cases
import { CreatePostUseCase } from './core/use-cases/posts/CreatePostUseCase'
import { GetFeedUseCase } from './core/use-cases/posts/GetFeedUseCase'
import { LikePostUseCase } from './core/use-cases/posts/LikePostUseCase'

// Repositories
import { IPostRepository } from './core/ports/repositories/IPostRepository'
import { FirebasePostRepository } from './infrastructure/firebase/repositories/FirebasePostRepository'

// Services
import { IStorageService } from './core/ports/services/IStorageService'
import { FirebaseStorageService } from './infrastructure/firebase/services/FirebaseStorageService'

const container = new Container()

// Bind repositories
container.bind<IPostRepository>('IPostRepository').to(FirebasePostRepository).inSingletonScope()

// Bind services
container.bind<IStorageService>('IStorageService').to(FirebaseStorageService).inSingletonScope()

// Bind use cases
container.bind<CreatePostUseCase>('CreatePostUseCase').to(CreatePostUseCase)
container.bind<GetFeedUseCase>('GetFeedUseCase').to(GetFeedUseCase)
container.bind<LikePostUseCase>('LikePostUseCase').to(LikePostUseCase)

export { container }
```

### 2. Error Handling Strategy

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

### 3. Event Bus Pattern

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

## Real-World Example: Social App

### Complete Feature Implementation

**Feature: Following System**

#### 1. Domain Entity

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
      throw new Error('Cannot follow yourself')
    }

    return new Follow(
      FollowId.generate(),
      followerId,
      followingId,
      new Date()
    )
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

#### 2. Use Case

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

    // Check if already following
    const existingFollow = await this.followRepository.findByFollowerAndFollowing(
      followerId,
      followingId
    )

    if (existingFollow) {
      throw new Error('Already following this user')
    }

    // Create follow relationship
    const follow = Follow.create(followerId, followingId)
    await this.followRepository.save(follow)

    // Update user counts
    const follower = await this.userRepository.findById(followerId)
    const following = await this.userRepository.findById(followingId)

    if (follower && following) {
      follower.follow()
      following.incrementFollowers()
      
      await this.userRepository.update(follower)
      await this.userRepository.update(following)
    }

    // Publish event
    this.eventBus.publish({
      type: 'USER_FOLLOWED',
      timestamp: new Date(),
      payload: { followerId: dto.followerId, followingId: dto.followingId }
    })
  }
}
```

#### 3. Repository Implementation

```typescript
// infrastructure/firebase/repositories/FirebaseFollowRepository.ts
import { collection, doc, setDoc, getDoc, query, where, getDocs, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase.config'
import { IFollowRepository } from '../../../core/ports/repositories/IFollowRepository'
import { Follow } from '../../../core/entities/Follow'
import { UserId } from '../../../core/value-objects/UserId'
import { FollowId } from '../../../core/value-objects/FollowId'

export class FirebaseFollowRepository implements IFollowRepository {
  private readonly collection = collection(db, 'follows')

  async save(follow: Follow): Promise<void> {
    const docRef = doc(this.collection, follow.id.value)
    await setDoc(docRef, follow.toPlainObject())
  }

  async findByFollowerAndFollowing(
    followerId: UserId, 
    followingId: UserId
  ): Promise<Follow | null> {
    const q = query(
      this.collection,
      where('followerId', '==', followerId.value),
      where('followingId', '==', followingId.value)
    )
    
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return null
    }
    
    const data = snapshot.docs[0].data()
    return new Follow(
      FollowId.fromString(data.id),
      UserId.fromString(data.followerId),
      UserId.fromString(data.followingId),
      new Date(data.createdAt)
    )
  }

  async delete(follow: Follow): Promise<void> {
    const docRef = doc(this.collection, follow.id.value)
    await deleteDoc(docRef)
  }

  async getFollowers(userId: UserId): Promise<Follow[]> {
    const q = query(
      this.collection,
      where('followingId', '==', userId.value)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return new Follow(
        FollowId.fromString(data.id),
        UserId.fromString(data.followerId),
        UserId.fromString(data.followingId),
        new Date(data.createdAt)
      )
    })
  }

  async getFollowing(userId: UserId): Promise<Follow[]> {
    const q = query(
      this.collection,
      where('followerId', '==', userId.value)
    )
    
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => {
      const data = doc.data()
      return new Follow(
        FollowId.fromString(data.id),
        UserId.fromString(data.followerId),
        UserId.fromString(data.followingId),
        new Date(data.createdAt)
      )
    })
  }
}
```

#### 4. Composable

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
      console.error('Failed to toggle follow:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    isFollowing,
    loading,
    toggleFollow
  }
}
```

---

## Best Practices Summary

### SOLID in Vue

1. **Single Responsibility**: Each composable, component, and class has one job
2. **Open/Closed**: Use composition and props for extension
3. **Liskov Substitution**: Repositories are interchangeable
4. **Interface Segregation**: Small, focused interfaces
5. **Dependency Inversion**: Depend on abstractions (interfaces), not implementations

### Clean Architecture Benefits

- **Testability**: Business logic has zero framework dependencies
- **Maintainability**: Changes are isolated to specific layers
- **Scalability**: Add features without touching core logic
- **Flexibility**: Swap Firebase for another backend with minimal changes

### Key Patterns

1. **Repository Pattern**: Abstracts data access
2. **Use Case Pattern**: Encapsulates business operations
3. **Value Objects**: Ensures data validity
4. **Domain Events**: Decouples features
5. **Dependency Injection**: Inverts control flow

---

## Additional Resources

For more details on specific implementation patterns, see:

- `references/solid-principles.md` - SOLID in depth with Vue examples
- `references/testing-strategy.md` - Comprehensive testing guide
- `references/performance.md` - Performance optimization techniques
- `scripts/generate-feature.js` - CLI tool to scaffold new features

---

## Quick Start

To scaffold a new feature following this architecture:

```bash
node scripts/generate-feature.js --name notifications --type crud
```

This will create:
- Entity
- Value objects
- Use cases
- Repository interface
- Firebase implementation
- Pinia store
- Composable
- Vue components
- Test files

All following the Clean Architecture pattern.
