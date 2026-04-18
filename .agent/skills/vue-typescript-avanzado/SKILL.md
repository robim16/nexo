---
name: vue-typescript-avanzado
description: Patrones TypeScript avanzados para aplicaciones Vue 3, incluyendo componentes genéricos, inferencia de tipos avanzada, tipos marcados (Branded Types), tipos utilitarios, type guards, fusión de declaraciones, tipos condicionales, tipos literales de plantilla y tipado estricto para composables, stores y props. Usar cuando se implementen componentes Vue con tipos seguros, se creen patrones genéricos reutilizables, se apliquen restricciones de tipo o se resuelvan desafíos complejos de tipado en Vue 3. Activar con menciones de "TypeScript", "componente genérico", "seguridad de tipos", "inferencia de tipos", "type guard", "tipo utilitario", "tipado estricto", "tipado de props", "tipado de emit", o cualquier mención de características avanzadas de TypeScript en Vue 3.
---

# Vue TypeScript Avanzado

Guía completa para aprovechar las características avanzadas de TypeScript en aplicaciones Vue 3, maximizando la seguridad de tipos y la experiencia del desarrollador.

## Tabla de Contenidos

1. [Configuración de TypeScript](#configuración-de-typescript)
2. [Componentes Genéricos](#componentes-genéricos)
3. [Inferencia de Tipos Avanzada](#inferencia-de-tipos-avanzada)
4. [Tipos Marcados (Branded Types)](#tipos-marcados-branded-types)
5. [Tipos Utilitarios](#tipos-utilitarios)
6. [Type Guards y Narrowing](#type-guards-y-narrowing)
7. [Tipado de Composables](#tipado-de-composables)
8. [Tipado de Stores](#tipado-de-stores)
9. [Sistema de Tipos para App Social Nexo](#sistema-de-tipos-para-app-social-nexo)

---

## Configuración de TypeScript

### tsconfig.json Estricto

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,

    /* Modo Bundler */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting — ESTRICTO */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,

    /* Específico de Vue */
    "types": ["vite/client", "node"],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### Declaraciones de Tipos Globales

```typescript
// src/types/global.d.ts
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
    title?: string
    description?: string
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filters: {
      currency: (value: number) => string
      date: (value: Date) => string
    }
  }
}

// Variables de entorno tipadas
interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string
  readonly VITE_FIREBASE_AUTH_DOMAIN: string
  readonly VITE_FIREBASE_PROJECT_ID: string
  readonly VITE_FIREBASE_STORAGE_BUCKET: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string
  readonly VITE_FIREBASE_APP_ID: string
  readonly VITE_APP_NAME: string
  readonly VITE_USE_FIREBASE_EMULATORS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## Componentes Genéricos

### Componente Lista Genérico

```vue
<!-- components/GenericList.vue -->
<script setup lang="ts" generic="T extends { id: string | number }">
import { computed } from 'vue'

interface Props {
  items: T[]
  keyField?: keyof T
  loading?: boolean
  emptyMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  keyField: 'id' as keyof T,
  loading: false,
  emptyMessage: 'No hay elementos disponibles'
})

interface Emits {
  (e: 'item-click', item: T): void
  (e: 'item-select', item: T, selected: boolean): void
}

const emit = defineEmits<Emits>()

const getItemKey = (item: T): string | number => {
  return item[props.keyField] as string | number
}
</script>

<template>
  <div class="generic-list">
    <div v-if="loading" class="generic-list__loading">
      <LoadingSpinner />
    </div>

    <div v-else-if="items.length === 0" class="generic-list__empty">
      {{ emptyMessage }}
    </div>

    <div v-else class="generic-list__items">
      <div
        v-for="item in items"
        :key="getItemKey(item)"
        class="generic-list__item"
        @click="emit('item-click', item)"
      >
        <slot :item="item" />
      </div>
    </div>
  </div>
</template>
```

```vue
<!-- Uso con inferencia de tipos automática -->
<script setup lang="ts">
interface Post {
  id: string
  title: string
  content: string
}

const posts = ref<Post[]>([])

const handleClick = (post: Post) => {
  // post está correctamente tipado como Post
  console.log(post.title)
}
</script>

<template>
  <GenericList
    :items="posts"
    @item-click="handleClick"
    v-slot="{ item }"
  >
    <!-- item está tipado como Post -->
    <h3>{{ item.title }}</h3>
    <p>{{ item.content }}</p>
  </GenericList>
</template>
```

### Componente Formulario Genérico

```vue
<!-- components/GenericForm.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
import { reactive } from 'vue'

interface Props {
  initialValues: T
  validationRules?: Partial<Record<keyof T, (value: any) => string | null>>
}

const props = defineProps<Props>()

interface Emits {
  (e: 'submit', values: T): void
  (e: 'change', field: keyof T, value: T[keyof T]): void
}

const emit = defineEmits<Emits>()

const formValues = reactive<T>({ ...props.initialValues })
const errors = reactive<Partial<Record<keyof T, string>>>({})

const handleFieldChange = (field: keyof T, value: T[keyof T]) => {
  formValues[field] = value

  // Validar campo
  if (props.validationRules?.[field]) {
    const error = props.validationRules[field]!(value)
    if (error) {
      errors[field] = error
    } else {
      delete errors[field]
    }
  }

  emit('change', field, value)
}

const handleSubmit = () => {
  let hasErrors = false

  for (const field in props.validationRules) {
    const value = formValues[field]
    const error = props.validationRules[field]!(value)
    if (error) {
      errors[field as keyof T] = error
      hasErrors = true
    }
  }

  if (!hasErrors) {
    emit('submit', formValues)
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <slot
      :values="formValues"
      :errors="errors"
      :onChange="handleFieldChange"
    />
    <slot name="submit" :submit="handleSubmit" />
  </form>
</template>
```

```vue
<!-- Uso tipado del formulario genérico -->
<script setup lang="ts">
interface LoginForm {
  email: string
  password: string
}

const initialValues: LoginForm = { email: '', password: '' }

const reglas = {
  email: (value: string) => value.includes('@') ? null : 'Email inválido',
  password: (value: string) => value.length >= 8 ? null : 'Mínimo 8 caracteres'
}

const handleSubmit = (values: LoginForm) => {
  // values está correctamente tipado como LoginForm
  login(values.email, values.password)
}
</script>

<template>
  <GenericForm
    :initial-values="initialValues"
    :validation-rules="reglas"
    @submit="handleSubmit"
    v-slot="{ values, errors, onChange }"
  >
    <input
      type="email"
      :value="values.email"
      @input="onChange('email', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="errors.email" class="error">{{ errors.email }}</span>

    <input
      type="password"
      :value="values.password"
      @input="onChange('password', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="errors.password" class="error">{{ errors.password }}</span>
  </GenericForm>
</template>
```

### Componente Tabla Genérico

```vue
<!-- components/GenericTable.vue -->
<script setup lang="ts" generic="T extends Record<string, any>">
interface Column<K extends keyof T = keyof T> {
  key: K
  label: string
  sortable?: boolean
  formatter?: (value: T[K], row: T) => string | number
  width?: string
}

interface Props {
  data: T[]
  columns: Column[]
  rowKey?: keyof T
  selectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id' as keyof T,
  selectable: false
})

interface Emits {
  (e: 'row-click', row: T): void
  (e: 'selection-change', selected: T[]): void
  (e: 'sort', column: keyof T, direction: 'asc' | 'desc'): void
}

const emit = defineEmits<Emits>()

const selectedRows = ref<Set<T[keyof T]>>(new Set())

const isSelected = (row: T): boolean => {
  return selectedRows.value.has(row[props.rowKey])
}

const toggleSelection = (row: T) => {
  const key = row[props.rowKey]
  if (selectedRows.value.has(key)) {
    selectedRows.value.delete(key)
  } else {
    selectedRows.value.add(key)
  }
  const selected = props.data.filter(r => selectedRows.value.has(r[props.rowKey]))
  emit('selection-change', selected)
}

const getCellValue = (row: T, column: Column): string | number => {
  const value = row[column.key]
  return column.formatter ? column.formatter(value, row) : String(value)
}
</script>

<template>
  <table class="generic-table">
    <thead>
      <tr>
        <th v-if="selectable"></th>
        <th v-for="column in columns" :key="String(column.key)" :style="{ width: column.width }">
          {{ column.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="row in data"
        :key="String(row[rowKey])"
        @click="emit('row-click', row)"
        :class="{ selected: isSelected(row) }"
      >
        <td v-if="selectable">
          <input type="checkbox" :checked="isSelected(row)" @click.stop="toggleSelection(row)" />
        </td>
        <td v-for="column in columns" :key="String(column.key)">
          {{ getCellValue(row, column) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
```

---

## Inferencia de Tipos Avanzada

### Inferir Tipos de Retorno

```typescript
// types/utilities.ts

// Inferir el tipo de retorno de una función asíncrona
type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : never

// Uso
async function fetchUser(id: string) {
  return { id, name: 'Juan', email: 'juan@nexo.app' }
}

type UserType = AsyncReturnType<typeof fetchUser>
// UserType = { id: string; name: string; email: string }

// Inferir tipo de retorno de composable
export function useAuth() {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  return {
    user,
    isAuthenticated,
    login: async (email: string, password: string) => {},
    logout: async () => {}
  }
}

type UseAuthReturn = ReturnType<typeof useAuth>
// Tipo de retorno completamente inferido
```

### Tipos Condicionales Distributivos

```typescript
// Extraer propiedades por tipo
type ExtractByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K]
}

interface Post {
  id: string
  title: string
  content: string
  likesCount: number
  commentsCount: number
  createdAt: Date
}

type PostStrings = ExtractByType<Post, string>
// { id: string; title: string; content: string }

type PostNumbers = ExtractByType<Post, number>
// { likesCount: number; commentsCount: number }

// Hacer ciertos campos requeridos
type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

interface PartialPost {
  id?: string
  title?: string
  content?: string
}

type PostWithRequiredId = RequireFields<PartialPost, 'id'>
// { id: string; title?: string; content?: string }
```

### Tipos Literales de Plantilla

```typescript
// Generación de nombres de eventos
type EntityType = 'usuario' | 'post' | 'comentario'
type ActionType = 'crear' | 'actualizar' | 'eliminar'

type EntityEvent = `${EntityType}:${ActionType}`
// 'usuario:crear' | 'usuario:actualizar' | 'usuario:eliminar' | 'post:crear' | ...

// Emisor de eventos con tipos seguros
interface EventMap {
  'usuario:crear': { userId: string; name: string }
  'usuario:actualizar': { userId: string; changes: Partial<User> }
  'post:crear': { postId: string; authorId: string }
  'post:eliminar': { postId: string }
}

class TypedEventEmitter {
  on<K extends keyof EventMap>(
    event: K,
    handler: (data: EventMap[K]) => void
  ): void {}

  emit<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): void {}
}

const emitter = new TypedEventEmitter()

emitter.on('usuario:crear', (data) => {
  // data está tipado como { userId: string; name: string }
  console.log(data.userId, data.name)
})

// ❌ Error: falta 'name'
emitter.emit('usuario:crear', { userId: '123' })

// ✅ Correcto
emitter.emit('usuario:crear', { userId: '123', name: 'Juan' })
```

---

## Tipos Marcados (Branded Types)

### IDs Tipados para Prevenir Mezclas

```typescript
// Prevenir mezcla accidental de distintos tipos de ID
declare const __brand: unique symbol
type Brand<T, B> = T & { [__brand]: B }

export type UserId = Brand<string, 'UserId'>
export type PostId = Brand<string, 'PostId'>
export type CommentId = Brand<string, 'CommentId'>
export type FollowId = Brand<string, 'FollowId'>

// Funciones factory
export const UserId = {
  create: (id: string): UserId => id as UserId,
  generate: (): UserId => `user_${crypto.randomUUID()}` as UserId,
  isValid: (id: string): id is UserId => /^user_.+$/.test(id)
}

export const PostId = {
  create: (id: string): PostId => id as PostId,
  generate: (): PostId => `post_${crypto.randomUUID()}` as PostId
}

// Uso — TypeScript previene mezclas
function getUser(id: UserId): Promise<User> { /* ... */ }
function getPost(id: PostId): Promise<Post> { /* ... */ }

const userId = UserId.create('user_123')
const postId = PostId.create('post_456')

getUser(userId) // ✅ OK
getUser(postId) // ❌ Error: Type 'PostId' is not assignable to 'UserId'
```

### Email y URL Tipados

```typescript
export type Email = Brand<string, 'Email'>
export type URL = Brand<string, 'URL'>

export const Email = {
  create: (email: string): Email | null => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email) ? (email.toLowerCase() as Email) : null
  },

  isValid: (value: string): value is Email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }
}

export const URL = {
  create: (url: string): URL | null => {
    try {
      new globalThis.URL(url)
      return url as URL
    } catch {
      return null
    }
  }
}

// Uso con User
interface User {
  email: Email
  website?: URL
}

const email = Email.create('usuario@nexo.app')
if (email) {
  const user: User = {
    email,
    website: URL.create('https://nexo.app') || undefined
  }
}
```

---

## Tipos Utilitarios

### DeepPartial

```typescript
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

interface User {
  id: string
  profile: {
    name: string
    bio: string
    settings: {
      notifications: boolean
      privacy: string
    }
  }
}

type PartialUser = DeepPartial<User>
// Todos los campos anidados son opcionales

const update: PartialUser = {
  profile: {
    settings: {
      notifications: false
      // Los demás campos son opcionales
    }
  }
}
```

### DeepReadonly

```typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

const config: DeepReadonly<AppConfig> = {
  api: {
    baseUrl: 'https://api.nexo.app',
    timeout: 5000
  }
}

config.api.timeout = 10000 // ❌ Error: Cannot assign to readonly property
```

### Mutable

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P]
}

interface ReadonlyPost {
  readonly id: string
  readonly title: string
}

type MutablePost = Mutable<ReadonlyPost>
// { id: string; title: string } — sin readonly
```

### NonNullableDeep

```typescript
type NonNullableDeep<T> = {
  [P in keyof T]-?: NonNullable<
    T[P] extends object ? NonNullableDeep<T[P]> : T[P]
  >
}
```

---

## Type Guards y Narrowing

### Type Guards Personalizados

```typescript
// Verificadores de entidades de dominio
function isUser(entity: unknown): entity is User {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'id' in entity &&
    'email' in entity &&
    'displayName' in entity
  )
}

function isPost(entity: unknown): entity is Post {
  return (
    typeof entity === 'object' &&
    entity !== null &&
    'id' in entity &&
    'authorId' in entity &&
    'content' in entity
  )
}

// Uso
function processEntity(entity: unknown) {
  if (isUser(entity)) {
    // entity es User aquí
    console.log(entity.email)
  } else if (isPost(entity)) {
    // entity es Post aquí
    console.log(entity.content)
  }
}

// Uniones discriminadas
type EntityWrapper =
  | { type: 'user'; data: User }
  | { type: 'post'; data: Post }
  | { type: 'comment'; data: Comment }

function handleEntity(entity: EntityWrapper) {
  switch (entity.type) {
    case 'user':
      return processUser(entity.data)  // entity.data es User
    case 'post':
      return processPost(entity.data)  // entity.data es Post
    case 'comment':
      return processComment(entity.data) // entity.data es Comment
  }
}
```

### Assertion Functions

```typescript
// Funciones de aserción tipadas
function assertIsUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error(`Se esperaba User, pero se recibió: ${typeof value}`)
  }
}

function assertNonNull<T>(value: T | null | undefined, msg?: string): asserts value is T {
  if (value == null) {
    throw new Error(msg ?? 'El valor no puede ser null o undefined')
  }
}

// Uso
const currentUser = authStore.currentUser
assertNonNull(currentUser, 'No hay usuario autenticado')
// Desde aquí currentUser está garantizado como no-null
console.log(currentUser.displayName)
```

---

## Tipado de Composables

### Composable con Tipos Derecho

```typescript
// Tipado explícito del retorno del composable
interface UseAuthReturn {
  user: Readonly<Ref<User | null>>
  isAuthenticated: ComputedRef<boolean>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  const login = async (email: string, password: string): Promise<void> => {
    const authService = container.get<IAuthService>('IAuthService')
    const loggedUser = await authService.signIn(email, password)
    user.value = loggedUser
  }

  const logout = async (): Promise<void> => {
    const authService = container.get<IAuthService>('IAuthService')
    await authService.signOut()
    user.value = null
  }

  const updateProfile = async (data: Partial<User>): Promise<void> => {
    // Implementación
  }

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    logout,
    updateProfile
  }
}
```

### Composable Genérico para CRUD

```typescript
// Composable CRUD genérico con tipos
interface UseCrudOptions<T> {
  repository: IBaseRepository<T, any>
  onSuccess?: (entity: T) => void
  onError?: (error: Error) => void
}

interface UseCrudReturn<T> {
  items: Readonly<Ref<T[]>>
  loading: Readonly<Ref<boolean>>
  error: Readonly<Ref<Error | null>>
  create: (data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => Promise<T>
  update: (id: string, data: Partial<T>) => Promise<void>
  remove: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useCrud<T extends { id: string }>(
  options: UseCrudOptions<T>
): UseCrudReturn<T> {
  const items = ref<T[]>([]) as Ref<T[]>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const refresh = async () => {
    loading.value = true
    error.value = null
    try {
      items.value = await options.repository.findAll()
    } catch (e) {
      error.value = e as Error
      options.onError?.(e as Error)
    } finally {
      loading.value = false
    }
  }

  onMounted(refresh)

  return {
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    create: async (data) => { /* ... */ },
    update: async (id, data) => { /* ... */ },
    remove: async (id) => { /* ... */ },
    refresh
  }
}
```

---

## Sistema de Tipos para App Social Nexo

### Tipos de Dominio Completos

```typescript
// types/domain.types.ts

// Tipos base con branded IDs
export type UserId = Brand<string, 'UserId'>
export type PostId = Brand<string, 'PostId'>
export type CommentId = Brand<string, 'CommentId'>
export type NotificationId = Brand<string, 'NotificationId'>

// Estado de la aplicación
export interface AppState {
  auth: AuthState
  feed: FeedState
  notifications: NotificationState
  ui: UIState
}

export interface AuthState {
  currentUser: User | null
  isLoading: boolean
  error: string | null
}

export interface FeedState {
  posts: Post[]
  hasMore: boolean
  isLoading: boolean
  lastPostId: PostId | null
  feedMode: 'chronological' | 'algorithmic'
}

export interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
}

export interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  activeModal: ModalType | null
  toasts: Toast[]
}

export type ModalType =
  | 'create-post'
  | 'edit-profile'
  | 'confirm-delete'
  | 'image-viewer'
  | 'followers-list'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

// Tipos de API para consistencia
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  hasMore: boolean
  lastCursor: string | null
}

export interface ApiError {
  code: string
  message: string
  statusCode: number
  field?: string
}

// Tipos utilitarios específicos de Nexo
export type CreatePostData = Pick<Post, 'content' | 'images' | 'mentions' | 'hashtags'> & {
  visibility?: PostVisibility
  scheduledFor?: Date
}

export type UpdateUserData = Partial<Pick<User, 'displayName' | 'bio' | 'avatar'>>

export type FeedFilter = {
  authorId?: UserId
  hashtag?: string
  dateRange?: { from: Date; to: Date }
}
```

### Tipado Estricto de Props Vue 3

```typescript
// Ejemplo de tipado avanzado de props con validación en runtime
const props = defineProps({
  // Prop con validador de runtime
  variant: {
    type: String as PropType<'primary' | 'secondary' | 'danger'>,
    default: 'primary',
    validator: (value: string) => ['primary', 'secondary', 'danger'].includes(value)
  },

  // Prop con tipo complejo
  post: {
    type: Object as PropType<Post>,
    required: true
  },

  // Prop con tipo de función tipada
  onAction: {
    type: Function as PropType<(post: Post, action: string) => void>,
    default: undefined
  }
})

// Preferido: sintaxis con TypeScript puro
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  post: Post
  onAction?: (post: Post, action: string) => void
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false
})
```
