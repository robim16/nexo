---
name: vue-patrones-de-diseno
description: Patrones de diseño avanzados adaptados específicamente para Vue 3, incluyendo Factory, Strategy, Observer, Decorator, Command, Builder, Adapter y Composite. Usar cuando se implementen features complejos de Vue que requieran mantenibilidad y extensibilidad, al refactorizar código espagueti en patrones organizados, al construir librerías de componentes, sistemas de plugins, o cuando el usuario mencione "patrones de diseño en Vue", "refactorizar código Vue", "mejores prácticas Vue", "componentes extensibles", "arquitectura de plugins", "patrones de composición", o necesite resolver problemas de diseño recurrentes en aplicaciones Vue.
---

# Patrones de Diseño Vue

Guía completa para implementar patrones de diseño clásicos y modernos en Vue 3 usando Composition API, TypeScript y programación reactiva.

## Tabla de Contenidos

1. [Patrones Creacionales](#patrones-creacionales)
2. [Patrones Estructurales](#patrones-estructurales)
3. [Patrones de Comportamiento](#patrones-de-comportamiento)
4. [Patrones Específicos de Vue](#patrones-específicos-de-vue)
5. [Ejemplos en App Social Nexo](#ejemplos-en-app-social-nexo)

---

## Patrones Creacionales

### 1. Patrón Factory (Fábrica)

**Propósito**: Crear objetos sin especificar la clase exacta

**Caso de uso en Nexo**: Crear distintos tipos de notificaciones, posts o contenido

```typescript
// core/factories/NotificationFactory.ts
import { Notification } from '../entities/Notification'
import { LikeNotification } from '../entities/LikeNotification'
import { FollowNotification } from '../entities/FollowNotification'
import { CommentNotification } from '../entities/CommentNotification'
import { MentionNotification } from '../entities/MentionNotification'

export type NotificationType = 'like' | 'follow' | 'comment' | 'mention'

export interface NotificationData {
  type: NotificationType
  actorId: string
  targetId: string
  metadata?: Record<string, any>
}

export class NotificationFactory {
  static create(data: NotificationData): Notification {
    switch (data.type) {
      case 'like':
        return new LikeNotification(data.actorId, data.targetId, data.metadata?.postId)

      case 'follow':
        return new FollowNotification(data.actorId, data.targetId)

      case 'comment':
        return new CommentNotification(
          data.actorId, data.targetId,
          data.metadata?.commentText, data.metadata?.postId
        )

      case 'mention':
        return new MentionNotification(
          data.actorId, data.targetId,
          data.metadata?.postId, data.metadata?.context
        )

      default:
        throw new Error(`Tipo de notificación desconocido: ${data.type}`)
    }
  }

  static createBatch(dataArray: NotificationData[]): Notification[] {
    return dataArray.map(data => this.create(data))
  }
}

// Uso en componente Vue
const notifications = ref<Notification[]>([])

const handleNotificationData = (rawData: any[]) => {
  notifications.value = NotificationFactory.createBatch(
    rawData.map(item => ({
      type: item.type,
      actorId: item.actor_id,
      targetId: item.target_id,
      metadata: item.metadata
    }))
  )
}
```

### 2. Patrón Builder (Constructor)

**Propósito**: Construir objetos complejos paso a paso

**Caso de uso**: Crear posts con múltiples campos opcionales

```typescript
// core/builders/PostBuilder.ts
import { Post } from '../entities/Post'
import { UserId } from '../value-objects/UserId'
import { PostContent } from '../value-objects/PostContent'
import { PostVisibility } from '../value-objects/PostVisibility'

export class PostBuilder {
  private userId?: UserId
  private content?: PostContent
  private images: string[] = []
  private mentions: string[] = []
  private hashtags: string[] = []
  private location?: string
  private visibility: PostVisibility = PostVisibility.PUBLIC
  private scheduledFor?: Date
  private pollOptions?: string[]

  setAuthor(userId: UserId): this {
    this.userId = userId
    return this
  }

  setContent(content: string): this {
    this.content = PostContent.create(content)
    return this
  }

  addImage(url: string): this {
    this.images.push(url)
    return this
  }

  addImages(urls: string[]): this {
    this.images.push(...urls)
    return this
  }

  addMention(username: string): this {
    this.mentions.push(username)
    return this
  }

  addHashtag(tag: string): this {
    this.hashtags.push(tag.startsWith('#') ? tag : `#${tag}`)
    return this
  }

  setLocation(location: string): this {
    this.location = location
    return this
  }

  setVisibility(visibility: PostVisibility): this {
    this.visibility = visibility
    return this
  }

  scheduleFor(date: Date): this {
    if (date <= new Date()) {
      throw new Error('La fecha programada debe ser futura')
    }
    this.scheduledFor = date
    return this
  }

  addPoll(options: string[]): this {
    if (options.length < 2) throw new Error('La encuesta debe tener al menos 2 opciones')
    if (options.length > 4) throw new Error('La encuesta no puede tener más de 4 opciones')
    this.pollOptions = options
    return this
  }

  build(): Post {
    if (!this.userId) throw new Error('El ID de usuario es requerido')
    if (!this.content) throw new Error('El contenido es requerido')

    return Post.create({
      authorId: this.userId,
      content: this.content,
      images: this.images,
      mentions: this.mentions,
      hashtags: this.hashtags,
      location: this.location,
      visibility: this.visibility,
      scheduledFor: this.scheduledFor,
      pollOptions: this.pollOptions
    })
  }

  reset(): this {
    this.userId = undefined
    this.content = undefined
    this.images = []
    this.mentions = []
    this.hashtags = []
    this.location = undefined
    this.visibility = PostVisibility.PUBLIC
    this.scheduledFor = undefined
    this.pollOptions = undefined
    return this
  }
}

// Uso en composable
export function usePostCreation() {
  const builder = new PostBuilder()

  const createPost = async (formData: PostFormData) => {
    builder
      .setAuthor(UserId.fromString(currentUserId))
      .setContent(formData.content)
      .addImages(formData.images)
      .setVisibility(formData.visibility)

    if (formData.location) builder.setLocation(formData.location)
    if (formData.scheduledFor) builder.scheduleFor(new Date(formData.scheduledFor))
    if (formData.pollOptions) builder.addPoll(formData.pollOptions)

    const post = builder.build()
    builder.reset() // Listo para el siguiente post

    return post
  }

  return { createPost }
}
```

### 3. Patrón Singleton (con Composables)

**Propósito**: Garantizar que solo exista una instancia

**Caso de uso**: Conexión WebSocket, servicio de Analytics

```typescript
// application/services/WebSocketService.ts
export class WebSocketService {
  private static instance: WebSocketService | null = null
  private socket: WebSocket | null = null
  private listeners: Map<string, Set<Function>> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  connect(url: string, token: string): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket ya está conectado')
      return
    }

    this.socket = new WebSocket(`${url}?token=${token}`)

    this.socket.onopen = () => {
      console.log('WebSocket conectado')
      this.reconnectAttempts = 0
      this.emit('conectado', {})
    }

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.emit(data.type, data.payload)
    }

    this.socket.onerror = (error) => {
      console.error('Error WebSocket:', error)
      this.emit('error', error)
    }

    this.socket.onclose = () => {
      console.log('WebSocket desconectado')
      this.emit('desconectado', {})
      this.attemptReconnect(url, token)
    }
  }

  private attemptReconnect(url: string, token: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Máximo de intentos de reconexión alcanzado')
      return
    }

    this.reconnectAttempts++
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

    setTimeout(() => {
      console.log(`Reconectando... (intento ${this.reconnectAttempts})`)
      this.connect(url, token)
    }, delay)
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) callbacks.delete(callback)
  }

  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) callbacks.forEach(callback => callback(data))
  }

  send(type: string, payload: any): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }))
    } else {
      console.error('WebSocket no está conectado')
    }
  }

  disconnect(): void {
    this.socket?.close()
    this.socket = null
    this.listeners.clear()
  }
}

// Composable wrapper para Vue
export function useWebSocket() {
  const ws = WebSocketService.getInstance()

  const subscribe = (event: string, callback: Function) => ws.on(event, callback)
  const unsubscribe = (event: string, callback: Function) => ws.off(event, callback)
  const send = (type: string, payload: any) => ws.send(type, payload)

  return { subscribe, unsubscribe, send }
}
```

---

## Patrones Estructurales

### 4. Patrón Adapter (Adaptador)

**Propósito**: Hacer compatibles interfaces incompatibles

**Caso de uso**: Adaptar datos Firebase a entidades de dominio

```typescript
// infrastructure/firebase/adapters/PostAdapter.ts
import { Post } from '@/core/entities/Post'
import { UserId } from '@/core/value-objects/UserId'
import { PostId } from '@/core/value-objects/PostId'
import { PostContent } from '@/core/value-objects/PostContent'
import { Timestamp } from 'firebase/firestore'

export interface FirebasePostData {
  id: string
  author_id: string
  content: string
  images?: string[]
  likes_count: number
  comments_count: number
  shares_count: number
  created_at: Timestamp
  updated_at: Timestamp
}

export class PostAdapter {
  static toDomain(firebaseData: FirebasePostData): Post {
    return new Post(
      PostId.fromString(firebaseData.id),
      UserId.fromString(firebaseData.author_id),
      PostContent.create(firebaseData.content),
      firebaseData.images || [],
      [], [], // menciones, hashtags
      firebaseData.likes_count,
      firebaseData.comments_count,
      firebaseData.shares_count,
      firebaseData.created_at.toDate(),
      firebaseData.updated_at.toDate()
    )
  }

  static toFirebase(post: Post): FirebasePostData {
    return {
      id: post.id.value,
      author_id: post.authorId.value,
      content: post.content.value,
      images: post.images,
      likes_count: post.likesCount,
      comments_count: post.commentsCount,
      shares_count: post.sharesCount,
      created_at: Timestamp.fromDate(post.createdAt),
      updated_at: Timestamp.fromDate(post.updatedAt)
    }
  }

  static toDomainArray(firebaseDataArray: FirebasePostData[]): Post[] {
    return firebaseDataArray.map(data => this.toDomain(data))
  }
}
```

### 5. Patrón Decorator (Decorador)

**Propósito**: Añadir comportamiento a objetos dinámicamente

**Caso de uso**: Enriquecer composables con logging, caché, validación

```typescript
// application/composables/decorators/withLogging.ts
export function withLogging<T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T {
  return ((...args: any[]) => {
    console.log(`[${name}] Llamado con:`, args)
    const startTime = performance.now()

    try {
      const result = fn(...args)

      if (result instanceof Promise) {
        return result.then(
          (value) => {
            const endTime = performance.now()
            console.log(`[${name}] Completado en ${endTime - startTime}ms:`, value)
            return value
          },
          (error) => {
            const endTime = performance.now()
            console.error(`[${name}] Fallido en ${endTime - startTime}ms:`, error)
            throw error
          }
        )
      }

      const endTime = performance.now()
      console.log(`[${name}] Completado en ${endTime - startTime}ms:`, result)
      return result
    } catch (error) {
      const endTime = performance.now()
      console.error(`[${name}] Fallido en ${endTime - startTime}ms:`, error)
      throw error
    }
  }) as T
}

// application/composables/decorators/withCaching.ts
export function withCaching<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator?: (...args: any[]) => string
    ttl?: number // Tiempo de vida en ms
  } = {}
): T {
  const cache = new Map<string, { value: any; timestamp: number }>()
  const defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutos

  const generateKey = options.keyGenerator ||
    ((...args: any[]) => JSON.stringify(args))

  return (async (...args: any[]) => {
    const key = generateKey(...args)
    const cached = cache.get(key)

    if (cached && Date.now() - cached.timestamp < defaultTTL) {
      console.log('Cache hit:', key)
      return cached.value
    }

    console.log('Cache miss:', key)
    const value = await fn(...args)

    cache.set(key, { value, timestamp: Date.now() })
    return value
  }) as T
}

// application/composables/decorators/withValidation.ts
export function withValidation<T extends (...args: any[]) => any>(
  fn: T,
  validator: (...args: any[]) => boolean | string
): T {
  return ((...args: any[]) => {
    const validationResult = validator(...args)

    if (validationResult === false) throw new Error('Validación fallida')
    if (typeof validationResult === 'string') throw new Error(validationResult)

    return fn(...args)
  }) as T
}

// Uso — Composición de múltiples decoradores
export function useUserProfile(userId: string) {
  const repository = inject<IUserRepository>('IUserRepository')!

  // Función decorada con logging + caché + validación
  const fetchProfile = withLogging(
    withCaching(
      withValidation(
        async (id: string) => await repository.findById(UserId.fromString(id)),
        (id: string) => id.length > 0 || 'El ID de usuario no puede estar vacío'
      ),
      {
        keyGenerator: (id) => `perfil-usuario-${id}`,
        ttl: 10 * 60 * 1000 // 10 minutos
      }
    ),
    'fetchProfile'
  )

  const profile = ref<User | null>(null)
  const loading = ref(false)

  const loadProfile = async () => {
    loading.value = true
    try {
      profile.value = await fetchProfile(userId)
    } finally {
      loading.value = false
    }
  }

  onMounted(() => loadProfile())

  return { profile, loading, refresh: loadProfile }
}
```

### 6. Patrón Composite (Compuesto)

**Propósito**: Tratar objetos individuales y composiciones de forma uniforme

**Caso de uso**: Comentarios anidados (árbol recursivo)

```typescript
// core/entities/Comment.ts
export interface CommentComponent {
  id: string
  content: string
  author: User
  createdAt: Date
  getDepth(): number
  getAllComments(): Comment[]
  findById(id: string): Comment | null
}

export class Comment implements CommentComponent {
  private replies: Comment[] = []

  constructor(
    public readonly id: string,
    public readonly content: string,
    public readonly author: User,
    public readonly createdAt: Date,
    public readonly parentId: string | null = null,
    private depth: number = 0
  ) {}

  addReply(comment: Comment): void {
    comment.depth = this.depth + 1
    this.replies.push(comment)
  }

  removeReply(commentId: string): void {
    this.replies = this.replies.filter(r => r.id !== commentId)
  }

  getReplies(): Comment[] { return [...this.replies] }
  getDepth(): number { return this.depth }

  getAllComments(): Comment[] {
    const comments: Comment[] = [this]
    for (const reply of this.replies) {
      comments.push(...reply.getAllComments())
    }
    return comments
  }

  findById(id: string): Comment | null {
    if (this.id === id) return this
    for (const reply of this.replies) {
      const found = reply.findById(id)
      if (found) return found
    }
    return null
  }
}

// Componente Vue recursivo para árbol de comentarios
```

```vue
<!-- presentation/components/feed/CommentItem.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Comment } from '@/core/entities/Comment'

interface Props {
  comment: Comment
  maxDepth?: number
}

const props = withDefaults(defineProps<Props>(), { maxDepth: 5 })
const canReply = computed(() => props.comment.getDepth() < props.maxDepth)
</script>

<template>
  <div class="comment" :style="{ marginLeft: `${comment.getDepth() * 20}px` }">
    <div class="comment__header">
      <img :src="comment.author.avatar" :alt="comment.author.displayName" />
      <span>{{ comment.author.displayName }}</span>
      <time>{{ formatDate(comment.createdAt) }}</time>
    </div>

    <p class="comment__content">{{ comment.content }}</p>

    <button v-if="canReply" @click="$emit('reply', comment.id)">
      Responder
    </button>

    <!-- Renderizado recursivo de respuestas -->
    <CommentItem
      v-for="reply in comment.getReplies()"
      :key="reply.id"
      :comment="reply"
      :max-depth="maxDepth"
      @reply="$emit('reply', $event)"
    />
  </div>
</template>
```

---

## Patrones de Comportamiento

### 7. Patrón Strategy (Estrategia)

**Propósito**: Definir familia de algoritmos intercambiables

**Caso de uso**: Distintas estrategias de ordenamiento del feed

```typescript
// core/strategies/FeedStrategy.ts
import { Post } from '../entities/Post'

export interface IFeedStrategy {
  sort(posts: Post[]): Post[]
  filter(posts: Post[], userId: string): Post[]
}

// Estrategia cronológica
export class ChronologicalFeedStrategy implements IFeedStrategy {
  sort(posts: Post[]): Post[] {
    return [...posts].sort((a, b) =>
      b.createdAt.getTime() - a.createdAt.getTime()
    )
  }

  filter(posts: Post[], userId: string): Post[] {
    return posts // Sin filtros adicionales
  }
}

// Estrategia algorítmica (por engagement)
export class AlgorithmicFeedStrategy implements IFeedStrategy {
  sort(posts: Post[]): Post[] {
    return [...posts].sort((a, b) => {
      const scoreA = this.calculateScore(a)
      const scoreB = this.calculateScore(b)
      return scoreB - scoreA
    })
  }

  filter(posts: Post[], userId: string): Post[] {
    return posts.filter(post => !post.likes.includes(userId))
  }

  private calculateScore(post: Post): number {
    const hoursAgo = (Date.now() - post.createdAt.getTime()) / 3600000
    const engagementScore = post.likesCount * 2 + post.commentsCount * 3 + post.sharesCount * 4
    const timeDecay = Math.exp(-hoursAgo / 24)
    return engagementScore * timeDecay
  }
}

// Contexto — selector de estrategia
export class FeedContext {
  private strategy: IFeedStrategy

  constructor(strategy: IFeedStrategy = new ChronologicalFeedStrategy()) {
    this.strategy = strategy
  }

  setStrategy(strategy: IFeedStrategy): void {
    this.strategy = strategy
  }

  processFeed(posts: Post[], userId: string): Post[] {
    const filtered = this.strategy.filter(posts, userId)
    return this.strategy.sort(filtered)
  }
}

// Uso en store
const feedContext = new FeedContext()

const toggleFeedMode = (mode: 'chronological' | 'algorithmic') => {
  if (mode === 'algorithmic') {
    feedContext.setStrategy(new AlgorithmicFeedStrategy())
  } else {
    feedContext.setStrategy(new ChronologicalFeedStrategy())
  }
  // Re-procesar posts
  processedPosts.value = feedContext.processFeed(posts.value, currentUserId)
}
```

### 8. Patrón Observer (Observador)

**Propósito**: Notificar automáticamente a múltiples objetos cuando cambia el estado

**Caso de uso**: Sistema de notificaciones en tiempo real

```typescript
// application/composables/useNotifications.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/application/stores/auth.store'
import { FirebaseNotificationRepository } from '@/infrastructure/firebase/repositories/FirebaseNotificationRepository'
import { Notification } from '@/core/entities/Notification'

export function useNotifications() {
  const authStore = useAuthStore()
  const repository = new FirebaseNotificationRepository()

  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)
  let unsubscribe: (() => void) | null = null

  const startObserving = () => {
    if (!authStore.currentUserId) return

    unsubscribe = repository.subscribeToNotifications(
      authStore.currentUserId,
      (updatedNotifications) => {
        notifications.value = updatedNotifications
        unreadCount.value = updatedNotifications.filter(n => !n.isRead).length
      }
    )
  }

  const stopObserving = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  const markAllAsRead = async () => {
    await repository.markAllAsRead(authStore.currentUserId)
  }

  onMounted(() => startObserving())
  onUnmounted(() => stopObserving())

  return { notifications, unreadCount, markAllAsRead }
}
```

### 9. Patrón Command (Comando)

**Propósito**: Encapsular solicitudes como objetos (permite undo/redo)

**Caso de uso**: Historial de edición de posts

```typescript
// core/commands/ICommand.ts
export interface ICommand {
  execute(): Promise<void>
  undo(): Promise<void>
}

// core/commands/LikePostCommand.ts
export class LikePostCommand implements ICommand {
  constructor(
    private postRepository: IPostRepository,
    private postId: PostId,
    private userId: UserId,
    private wasLiked: boolean
  ) {}

  async execute(): Promise<void> {
    if (this.wasLiked) {
      await this.postRepository.unlike(this.postId, this.userId)
    } else {
      await this.postRepository.like(this.postId, this.userId)
    }
  }

  async undo(): Promise<void> {
    if (this.wasLiked) {
      await this.postRepository.like(this.postId, this.userId)
    } else {
      await this.postRepository.unlike(this.postId, this.userId)
    }
  }
}

// application/services/CommandHistory.ts
export class CommandHistory {
  private history: ICommand[] = []
  private currentIndex = -1

  async execute(command: ICommand): Promise<void> {
    await command.execute()
    this.history = this.history.slice(0, this.currentIndex + 1)
    this.history.push(command)
    this.currentIndex++
  }

  async undo(): Promise<void> {
    if (this.currentIndex < 0) return
    const command = this.history[this.currentIndex]
    await command.undo()
    this.currentIndex--
  }

  async redo(): Promise<void> {
    if (this.currentIndex >= this.history.length - 1) return
    this.currentIndex++
    const command = this.history[this.currentIndex]
    await command.execute()
  }

  canUndo(): boolean { return this.currentIndex >= 0 }
  canRedo(): boolean { return this.currentIndex < this.history.length - 1 }
}
```

---

## Patrones Específicos de Vue

### Composable con Estado Compartido (Singleton via Module)

```typescript
// Patrón de estado compartido sin Pinia
// application/composables/useGlobalNotifications.ts
import { ref, readonly } from 'vue'

// Estado a nivel de módulo (compartido entre todas las instancias del composable)
const notifications = ref<string[]>([])
const isVisible = ref(false)

export function useGlobalNotifications() {
  const show = (message: string, duration = 3000) => {
    notifications.value.push(message)
    isVisible.value = true

    setTimeout(() => {
      notifications.value.shift()
      if (notifications.value.length === 0) {
        isVisible.value = false
      }
    }, duration)
  }

  const hide = () => {
    notifications.value = []
    isVisible.value = false
  }

  return {
    notifications: readonly(notifications),
    isVisible: readonly(isVisible),
    show,
    hide
  }
}
```

### Provide/Inject para Inyección de Dependencias sin InversifyJS

```typescript
// presentation/plugins/di.plugin.ts
import { App, InjectionKey } from 'vue'
import { IPostRepository } from '@/core/ports/repositories/IPostRepository'
import { FirebasePostRepository } from '@/infrastructure/firebase/repositories/FirebasePostRepository'

export const POST_REPOSITORY: InjectionKey<IPostRepository> = Symbol('IPostRepository')

export const diPlugin = {
  install(app: App) {
    app.provide(POST_REPOSITORY, new FirebasePostRepository())
  }
}

// Uso en componente
const postRepository = inject(POST_REPOSITORY)!
```
