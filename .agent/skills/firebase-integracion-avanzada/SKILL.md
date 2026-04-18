---
name: firebase-integracion-avanzada
description: Integración avanzada de Firebase con Arquitectura Limpia, incluyendo patrón Repositorio, consultas con tipos seguros, actualizaciones en tiempo real, UI optimista, soporte offline, operaciones en lote, reglas de seguridad y optimización de rendimiento. Usar este skill al trabajar con Firebase en aplicaciones Vue, especialmente al configurar Firestore, Authentication, Storage o features en tiempo real. Activar con menciones de "Firebase", "Firestore", "Firebase Auth", "base de datos en tiempo real", "Cloud Storage", "reglas de seguridad Firebase", "persistencia offline", "consultas Firebase", "transacciones Firebase", o cualquier mención de integrar servicios Firebase en una app Vue.
---

# Firebase Integración Avanzada

Guía completa para integrar servicios Firebase en aplicaciones Vue 3 siguiendo principios de Arquitectura Limpia, con énfasis en seguridad de tipos, rendimiento y escalabilidad.

## Tabla de Contenidos

1. [Configuración Inicial de Firebase](#configuración-inicial-de-firebase)
2. [Implementación del Patrón Repositorio](#implementación-del-patrón-repositorio)
3. [Actualizaciones en Tiempo Real](#actualizaciones-en-tiempo-real)
4. [Integración de Autenticación](#integración-de-autenticación)
5. [Almacenamiento de Archivos](#almacenamiento-de-archivos)
6. [Consultas Avanzadas](#consultas-avanzadas)
7. [Soporte Offline](#soporte-offline)
8. [Reglas de Seguridad](#reglas-de-seguridad)
9. [Optimización de Rendimiento](#optimización-de-rendimiento)
10. [Implementación en App Social Nexo](#implementación-en-app-social-nexo)

---

## Configuración Inicial de Firebase

### Estructura del Proyecto

```
src/
├── infrastructure/
│   └── firebase/
│       ├── config/
│       │   ├── firebase.config.ts      # Inicialización de Firebase
│       │   └── firestore.config.ts     # Configuración de Firestore
│       ├── repositories/               # Implementaciones de repositorios
│       ├── services/                   # Implementaciones de servicios
│       ├── converters/                 # Conversores de datos
│       ├── rules/                      # Reglas de seguridad (referencia)
│       └── utils/
│           ├── query-builder.ts        # Constructor de consultas tipadas
│           ├── batch-operations.ts     # Utilidades de operaciones en lote
│           └── error-handler.ts        # Manejo de errores Firebase
```

### Configuración Inicial

```typescript
// infrastructure/firebase/config/firebase.config.ts
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, connectAuthEmulator } from 'firebase/auth'
import {
  getFirestore,
  Firestore,
  connectFirestoreEmulator,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore'
import { getStorage, FirebaseStorage, connectStorageEmulator } from 'firebase/storage'
import { getFunctions, Functions, connectFunctionsEmulator } from 'firebase/functions'
import { getAnalytics, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
}

// Validar configuración
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId']
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])
  if (missing.length > 0) {
    throw new Error(`Configuración Firebase faltante: ${missing.join(', ')}`)
  }
}

validateConfig()

// Inicializar Firebase
export const app: FirebaseApp = initializeApp(firebaseConfig)

// Inicializar servicios con persistencia offline
export const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export const auth: Auth = getAuth(app)
export const storage: FirebaseStorage = getStorage(app)
export const functions: Functions = getFunctions(app)

// Analytics (solo en producción)
export const analytics: Analytics | null =
  import.meta.env.PROD ? getAnalytics(app) : null

// Configuración de emuladores (solo en desarrollo)
if (import.meta.env.DEV) {
  const USE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'

  if (USE_EMULATORS) {
    console.log('🔧 Usando Emuladores de Firebase')
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectStorageEmulator(storage, 'localhost', 9199)
    connectFunctionsEmulator(functions, 'localhost', 5001)
  }
}

// Referencias de colecciones con tipos seguros
export const collections = {
  users: 'users',
  posts: 'posts',
  comments: 'comments',
  follows: 'follows',
  notifications: 'notifications',
  messages: 'messages',
  stories: 'stories'
} as const

export type CollectionName = keyof typeof collections
```

---

## Implementación del Patrón Repositorio

### Interfaz de Repositorio Base

```typescript
// core/ports/repositories/IBaseRepository.ts
export interface IBaseRepository<T, ID> {
  findById(id: ID): Promise<T | null>
  findAll(limit?: number): Promise<T[]>
  save(entity: T): Promise<void>
  update(entity: T): Promise<void>
  delete(id: ID): Promise<void>
  exists(id: ID): Promise<boolean>
}
```

### Repositorio Firebase Genérico

```typescript
// infrastructure/firebase/repositories/FirebaseBaseRepository.ts
import {
  collection, doc, getDoc, getDocs, setDoc,
  updateDoc, deleteDoc, query, limit as fbLimit,
  DocumentData, QueryDocumentSnapshot,
  FirestoreDataConverter, CollectionReference
} from 'firebase/firestore'
import { db } from '../config/firebase.config'
import { IBaseRepository } from '@/core/ports/repositories/IBaseRepository'

export abstract class FirebaseBaseRepository<T, ID> implements IBaseRepository<T, ID> {
  protected collection: CollectionReference<DocumentData>

  constructor(
    protected collectionName: string,
    protected converter: FirestoreDataConverter<T>
  ) {
    this.collection = collection(db, collectionName).withConverter(converter)
  }

  protected abstract idToString(id: ID): string
  protected abstract getIdFromEntity(entity: T): ID

  async findById(id: ID): Promise<T | null> {
    try {
      const docRef = doc(this.collection, this.idToString(id))
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) return null
      return snapshot.data() as T
    } catch (error) {
      this.handleError('findById', error)
      return null
    }
  }

  async findAll(limit: number = 100): Promise<T[]> {
    try {
      const q = query(this.collection, fbLimit(limit))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as T)
    } catch (error) {
      this.handleError('findAll', error)
      return []
    }
  }

  async save(entity: T): Promise<void> {
    try {
      const id = this.idToString(this.getIdFromEntity(entity))
      const docRef = doc(this.collection, id)
      await setDoc(docRef, entity)
    } catch (error) {
      this.handleError('save', error)
      throw error
    }
  }

  async update(entity: T): Promise<void> {
    try {
      const id = this.idToString(this.getIdFromEntity(entity))
      const docRef = doc(this.collection, id)
      await updateDoc(docRef, { ...entity } as any)
    } catch (error) {
      this.handleError('update', error)
      throw error
    }
  }

  async delete(id: ID): Promise<void> {
    try {
      const docRef = doc(this.collection, this.idToString(id))
      await deleteDoc(docRef)
    } catch (error) {
      this.handleError('delete', error)
      throw error
    }
  }

  async exists(id: ID): Promise<boolean> {
    try {
      const docRef = doc(this.collection, this.idToString(id))
      const snapshot = await getDoc(docRef)
      return snapshot.exists()
    } catch (error) {
      this.handleError('exists', error)
      return false
    }
  }

  protected handleError(method: string, error: unknown): void {
    console.error(`[${this.collectionName}Repository.${method}]`, error)
  }
}
```

### Conversor de Datos Tipado

```typescript
// infrastructure/firebase/converters/PostConverter.ts
import {
  FirestoreDataConverter, QueryDocumentSnapshot,
  SnapshotOptions, Timestamp
} from 'firebase/firestore'
import { Post } from '@/core/entities/Post'
import { PostId } from '@/core/value-objects/PostId'
import { UserId } from '@/core/value-objects/UserId'
import { PostContent } from '@/core/value-objects/PostContent'

export interface FirebasePostData {
  id: string
  authorId: string
  content: string
  images: string[]
  mentions: string[]
  hashtags: string[]
  likes: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  visibility: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export class PostConverter implements FirestoreDataConverter<Post> {
  toFirestore(post: Post): FirebasePostData {
    return {
      id: post.id.value,
      authorId: post.authorId.value,
      content: post.content.value,
      images: post.images,
      mentions: post.mentions,
      hashtags: post.hashtags,
      likes: post.likes,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      sharesCount: post.sharesCount,
      visibility: post.visibility.value,
      createdAt: Timestamp.fromDate(post.createdAt),
      updatedAt: Timestamp.fromDate(post.updatedAt)
    }
  }

  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Post {
    const data = snapshot.data(options) as FirebasePostData

    return new Post(
      PostId.fromString(data.id),
      UserId.fromString(data.authorId),
      PostContent.create(data.content),
      data.images || [],
      data.mentions || [],
      data.hashtags || [],
      data.likes || [],
      data.likesCount || 0,
      data.commentsCount || 0,
      data.sharesCount || 0,
      data.createdAt.toDate(),
      data.updatedAt.toDate()
    )
  }
}
```

### Repositorio de Posts con Funciones Avanzadas

```typescript
// infrastructure/firebase/repositories/FirebasePostRepository.ts
import {
  collection, query, where, orderBy, limit as fbLimit,
  startAfter, getDocs, doc, updateDoc, increment,
  arrayUnion, arrayRemove, Timestamp, writeBatch,
  onSnapshot, Unsubscribe
} from 'firebase/firestore'
import { db, collections } from '../config/firebase.config'
import { FirebaseBaseRepository } from './FirebaseBaseRepository'
import { IPostRepository } from '@/core/ports/repositories/IPostRepository'
import { Post } from '@/core/entities/Post'
import { PostId } from '@/core/value-objects/PostId'
import { UserId } from '@/core/value-objects/UserId'
import { PostConverter } from '../converters/PostConverter'

export class FirebasePostRepository
  extends FirebaseBaseRepository<Post, PostId>
  implements IPostRepository {

  constructor() {
    super(collections.posts, new PostConverter())
  }

  protected idToString(id: PostId): string { return id.value }
  protected getIdFromEntity(entity: Post): PostId { return entity.id }

  // Buscar posts por autor
  async findByAuthor(authorId: UserId, limit: number = 20): Promise<Post[]> {
    try {
      const q = query(
        this.collection,
        where('authorId', '==', authorId.value),
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Post)
    } catch (error) {
      this.handleError('findByAuthor', error)
      return []
    }
  }

  // Obtener feed con paginación
  async getFeed(
    userId: UserId,
    followingIds: string[],
    lastPostId?: PostId,
    limit: number = 20
  ): Promise<Post[]> {
    try {
      let q = query(
        this.collection,
        where('authorId', 'in', followingIds.slice(0, 10)), // Límite 'in' de Firestore
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )

      // Paginación por cursor
      if (lastPostId) {
        const lastDoc = await getDoc(doc(this.collection, lastPostId.value))
        if (lastDoc.exists()) {
          q = query(q, startAfter(lastDoc))
        }
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Post)
    } catch (error) {
      this.handleError('getFeed', error)
      return []
    }
  }

  // Dar like
  async like(postId: PostId, userId: UserId): Promise<void> {
    try {
      const docRef = doc(this.collection, postId.value)
      await updateDoc(docRef, {
        likes: arrayUnion(userId.value),
        likesCount: increment(1),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      this.handleError('like', error)
      throw error
    }
  }

  // Quitar like
  async unlike(postId: PostId, userId: UserId): Promise<void> {
    try {
      const docRef = doc(this.collection, postId.value)
      await updateDoc(docRef, {
        likes: arrayRemove(userId.value),
        likesCount: increment(-1),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      this.handleError('unlike', error)
      throw error
    }
  }

  // Eliminar múltiples posts en lote
  async deleteBatch(postIds: PostId[]): Promise<void> {
    try {
      const batch = writeBatch(db)
      postIds.forEach(id => {
        const docRef = doc(this.collection, id.value)
        batch.delete(docRef)
      })
      await batch.commit()
    } catch (error) {
      this.handleError('deleteBatch', error)
      throw error
    }
  }

  // Suscripción en tiempo real a un post
  subscribeToPost(postId: PostId, callback: (post: Post | null) => void): Unsubscribe {
    const docRef = doc(this.collection, postId.value)

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as Post)
        } else {
          callback(null)
        }
      },
      (error) => {
        this.handleError('subscribeToPost', error)
        callback(null)
      }
    )
  }

  // Suscripción al feed en tiempo real
  subscribeToFeed(
    followingIds: string[],
    callback: (posts: Post[]) => void
  ): Unsubscribe {
    const q = query(
      this.collection,
      where('authorId', 'in', followingIds.slice(0, 10)),
      orderBy('createdAt', 'desc'),
      fbLimit(50)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs.map(doc => doc.data() as Post)
        callback(posts)
      },
      (error) => {
        this.handleError('subscribeToFeed', error)
        callback([])
      }
    )
  }
}
```

---

## Actualizaciones en Tiempo Real

### Composable de Feed en Tiempo Real

```typescript
// application/composables/useRealtimeFeed.ts
import { ref, onMounted, onUnmounted } from 'vue'
import { Unsubscribe } from 'firebase/firestore'
import { useAuthStore } from '@/application/stores/auth.store'
import { FirebasePostRepository } from '@/infrastructure/firebase/repositories/FirebasePostRepository'
import { Post } from '@/core/entities/Post'

export function useRealtimeFeed() {
  const authStore = useAuthStore()
  const repository = new FirebasePostRepository()

  const posts = ref<Post[]>([])
  const loading = ref(true)
  const error = ref<Error | null>(null)

  let unsubscribe: Unsubscribe | null = null

  const startListening = () => {
    if (!authStore.followingIds || authStore.followingIds.length === 0) {
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    unsubscribe = repository.subscribeToFeed(
      authStore.followingIds,
      (updatedPosts) => {
        posts.value = updatedPosts
        loading.value = false
      }
    )
  }

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  onMounted(() => startListening())
  onUnmounted(() => stopListening())

  return { posts, loading, error, startListening, stopListening }
}
```

### Actualizaciones Optimistas

```typescript
// application/composables/useOptimisticPost.ts
import { ref, computed, Ref } from 'vue'
import { Post } from '@/core/entities/Post'
import { PostId } from '@/core/value-objects/PostId'
import { UserId } from '@/core/value-objects/UserId'
import { FirebasePostRepository } from '@/infrastructure/firebase/repositories/FirebasePostRepository'

export function useOptimisticPost(posts: Ref<Post[]>) {
  const repository = new FirebasePostRepository()
  const pendingOperations = ref(new Set<string>())

  const optimisticLike = async (postId: PostId, userId: UserId) => {
    const operationId = `like-${postId.value}`

    // Encontrar el post
    const post = posts.value.find(p => p.id.equals(postId))
    if (!post) return

    // Actualización optimista en UI
    const wasLiked = post.likes.includes(userId.value)
    if (wasLiked) {
      post.unlike(userId)
    } else {
      post.like(userId)
    }

    pendingOperations.value.add(operationId)

    try {
      // Persistir en Firebase
      if (wasLiked) {
        await repository.unlike(postId, userId)
      } else {
        await repository.like(postId, userId)
      }
    } catch (error) {
      // Rollback en caso de error
      if (wasLiked) {
        post.like(userId)
      } else {
        post.unlike(userId)
      }
      console.error('Error al actualizar like:', error)
      throw error
    } finally {
      pendingOperations.value.delete(operationId)
    }
  }

  const optimisticDelete = async (postId: PostId) => {
    const operationId = `delete-${postId.value}`

    // Remover de la UI inmediatamente
    const index = posts.value.findIndex(p => p.id.equals(postId))
    if (index === -1) return

    const deletedPost = posts.value[index]
    posts.value.splice(index, 1)

    pendingOperations.value.add(operationId)

    try {
      await repository.delete(postId)
    } catch (error) {
      // Rollback en error
      posts.value.splice(index, 0, deletedPost)
      console.error('Error al eliminar post:', error)
      throw error
    } finally {
      pendingOperations.value.delete(operationId)
    }
  }

  const isPending = (postId: string) => {
    return pendingOperations.value.has(`like-${postId}`) ||
           pendingOperations.value.has(`delete-${postId}`)
  }

  return {
    optimisticLike,
    optimisticDelete,
    isPending,
    hasPendingOperations: computed(() => pendingOperations.value.size > 0)
  }
}
```

---

## Integración de Autenticación

### Servicio Firebase Auth

```typescript
// infrastructure/firebase/services/FirebaseAuthService.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth'
import { auth } from '../config/firebase.config'
import { IAuthService } from '@/core/ports/services/IAuthService'
import { User } from '@/core/entities/User'

export class FirebaseAuthService implements IAuthService {
  private currentFirebaseUser: FirebaseUser | null = null

  constructor() {
    // Escuchar cambios de estado de autenticación
    onAuthStateChanged(auth, (user) => {
      this.currentFirebaseUser = user
    })
  }

  async signIn(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      return this.mapFirebaseUserToDomain(credential.user)
    } catch (error: any) {
      throw this.mapAuthError(error)
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password)

      // Actualizar perfil
      await updateProfile(credential.user, { displayName })

      // Enviar verificación de email
      await sendEmailVerification(credential.user)

      return this.mapFirebaseUserToDomain(credential.user)
    } catch (error: any) {
      throw this.mapAuthError(error)
    }
  }

  async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider()
      const credential = await signInWithPopup(auth, provider)
      return this.mapFirebaseUserToDomain(credential.user)
    } catch (error: any) {
      throw this.mapAuthError(error)
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth)
      this.currentFirebaseUser = null
    } catch (error: any) {
      throw this.mapAuthError(error)
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw this.mapAuthError(error)
    }
  }

  private mapFirebaseUserToDomain(firebaseUser: FirebaseUser): User {
    return User.create({
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || 'Usuario',
      bio: ''
    })
  }

  private mapAuthError(error: any): Error {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'El email ya está registrado',
      'auth/weak-password': 'La contraseña es muy débil',
      'auth/invalid-email': 'Email inválido',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde'
    }
    const message = errorMessages[error.code] || error.message
    return new Error(message)
  }
}
```

---

## Reglas de Seguridad

### Reglas Firestore

```javascript
// firestore.rules
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Funciones helper
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    function isFollowing(followingId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/follows/$(request.auth.uid + '_' + followingId));
    }

    // Usuarios
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }

    // Publicaciones
    match /posts/{postId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.authorId == request.auth.uid;
      allow update: if isOwner(resource.data.authorId) ||
                      (isAuthenticated() && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'likesCount']));
      allow delete: if isOwner(resource.data.authorId);
    }

    // Seguidores
    match /follows/{followId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && request.resource.data.followerId == request.auth.uid;
      allow delete: if isOwner(resource.data.followerId);
    }

    // Notificaciones
    match /notifications/{notificationId} {
      allow read: if isOwner(resource.data.recipientId);
      allow create: if isAuthenticated();
      allow update: if isOwner(resource.data.recipientId);
      allow delete: if isOwner(resource.data.recipientId);
    }
  }
}
```

---

## Soporte Offline

La configuración con `persistentLocalCache` y `persistentMultipleTabManager` habilitada en `firebase.config.ts` provee:

- **Caché persistente**: Los datos permanecen disponibles sin conexión
- **Multi-tab**: Múltiples pestañas del navegador comparten el mismo caché
- **Sincronización automática**: Al reconectar, Firebase sincroniza los cambios pendientes

```typescript
// Verificar estado de conexión
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from './firebase.config'

export function useConnectionStatus() {
  const isOnline = ref(true)

  // Firestore expone un documento especial para monitorear conexión
  const connectedRef = doc(db, '.info/connected')

  const unsubscribe = onSnapshot(connectedRef, (snap) => {
    isOnline.value = snap.data()?.connected ?? false
  })

  onUnmounted(() => unsubscribe())

  return { isOnline }
}
```

---

## Optimización de Rendimiento

### Estrategia de Índices en Firestore

```
// Índices compuestos requeridos (firestore.indexes.json)
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "authorId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "follows",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "followerId", "order": "ASCENDING" },
        { "fieldPath": "followingId", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### Paginación por Cursor (más eficiente que offset)

```typescript
// Paginación correcta con startAfter
async getNextPage(lastItem: Post, limit = 20): Promise<Post[]> {
  const lastDocRef = doc(this.collection, lastItem.id.value)
  const lastDocSnap = await getDoc(lastDocRef)

  const q = query(
    this.collection,
    orderBy('createdAt', 'desc'),
    startAfter(lastDocSnap),
    fbLimit(limit)
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => doc.data() as Post)
}
```
