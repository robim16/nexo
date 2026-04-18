---
name: vue-optimizacion-rendimiento
description: Técnicas avanzadas de optimización de rendimiento para Vue 3, incluyendo lazy loading, code splitting, scroll virtual, memoización, Web Workers, análisis de bundle, tree-shaking, optimización de imágenes, estrategias de caché y monitoreo de rendimiento. Usar cuando se optimice el rendimiento de una app Vue, se reduzca el tamaño del bundle, se mejoren los tiempos de carga, se manejen listas grandes, se optimicen re-renders o se monitoreen métricas de rendimiento. Activar con menciones de "rendimiento", "optimización", "lazy loading", "code splitting", "scroll virtual", "lento", "tamaño bundle", "memory leak", "lighthouse", "web vitals", "profiling".
---

# Optimización de Rendimiento Vue

Guía completa para optimizar aplicaciones Vue 3 para máximo rendimiento, enfocada en escenarios reales y mejoras medibles.

## Tabla de Contenidos

1. [Fundamentos de Rendimiento](#fundamentos-de-rendimiento)
2. [Optimización del Bundle](#optimización-del-bundle)
3. [Optimización de Componentes](#optimización-de-componentes)
4. [Optimización de Listas](#optimización-de-listas)
5. [Optimización de Imágenes](#optimización-de-imágenes)
6. [Rendimiento en Tiempo de Ejecución](#rendimiento-en-tiempo-de-ejecución)
7. [Estrategias de Caché](#estrategias-de-caché)
8. [Monitoreo de Rendimiento](#monitoreo-de-rendimiento)
9. [Optimizaciones para App Social Nexo](#optimizaciones-para-app-social-nexo)

---

## Fundamentos de Rendimiento

### Core Web Vitals

**Métricas Objetivo:**
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s

---

## Optimización del Bundle

### Configuración Vite para Producción

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    vue(),
    // Compresión Gzip
    compression({ algorithm: 'gzip', ext: '.gz' }),
    // Compresión Brotli (mejor que gzip)
    compression({ algorithm: 'brotliCompress', ext: '.br' }),
    // Analizador de bundle
    visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,   // Elimina console.log en producción
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar dependencias por vendor
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'ui-vendor': ['@headlessui/vue', 'lucide-vue-next']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 500,  // Advertencia si chunk > 500KB
    sourcemap: false,            // Sin source maps en producción
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
    exclude: ['@vueuse/core']
  }
})
```

### Estrategias de Code Splitting

#### 1. Lazy Loading a Nivel de Ruta

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Inicio',
      // Carga diferida con prefetch
      component: () => import(
        /* webpackChunkName: "inicio" */
        /* webpackPrefetch: true */
        '@/views/HomePage.vue'
      )
    },
    {
      path: '/perfil/:id',
      name: 'Perfil',
      // Sin prefetch (menor prioridad)
      component: () => import(
        /* webpackChunkName: "perfil" */
        '@/views/ProfilePage.vue'
      )
    },
    {
      path: '/explorar',
      name: 'Explorar',
      component: () => import(
        /* webpackChunkName: "explorar" */
        '@/views/ExplorePage.vue'
      )
    }
  ]
})

export default router
```

#### 2. Code Splitting a Nivel de Componente

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

// Componente pesado — carga diferida
const VideoPlayer = defineAsyncComponent({
  loader: () => import('@/components/VideoPlayer.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,    // Mostrar loading después de 200ms
  timeout: 10000 // Timeout a los 10s
})

// Editor de texto enriquecido — carga diferida
const RichTextEditor = defineAsyncComponent(
  () => import('@/components/RichTextEditor.vue')
)
</script>

<template>
  <div>
    <Suspense>
      <template #default>
        <VideoPlayer :src="videoUrl" />
      </template>
      <template #fallback>
        <LoadingSpinner />
      </template>
    </Suspense>
  </div>
</template>
```

---

## Optimización de Componentes

### Memoización y Caché de Computed

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'

const posts = ref<Post[]>([])
const searchTerm = ref('')

// ❌ Mal — recalcula en cada render
const filteredPostsBad = () => {
  return posts.value.filter(post =>
    post.content.includes(searchTerm.value)
  )
}

// ✅ Bien — propiedad computed con caché
const filteredPosts = computed(() => {
  return posts.value.filter(post =>
    post.content.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// ✅ Mejor — memoización con WeakMap para datasets grandes
const memoizedFilter = (() => {
  const cache = new WeakMap()

  return (posts: Post[], term: string) => {
    const key = { posts, term }
    if (cache.has(key)) return cache.get(key)

    const result = posts.filter(post =>
      post.content.toLowerCase().includes(term.toLowerCase())
    )
    cache.set(key, result)
    return result
  }
})()

const filteredPosts = computed(() =>
  memoizedFilter(posts.value, searchTerm.value)
)
</script>
```

### v-once y v-memo

```vue
<template>
  <!-- Contenido estático — renderizar solo una vez -->
  <header v-once>
    <h1>{{ appName }}</h1>
    <p>{{ tagline }}</p>
  </header>

  <!-- Memoización condicional — solo re-renderiza si cambian los valores -->
  <div
    v-for="post in posts"
    :key="post.id"
    v-memo="[post.likesCount, post.commentsCount]"
  >
    <!-- Solo se re-renderiza si likesCount o commentsCount cambian -->
    <PostCard :post="post" />
  </div>

  <!-- Componente de perfil con memo -->
  <UserProfile
    :user="user"
    v-memo="[user.avatar, user.displayName, user.bio]"
  />
</template>
```

### KeepAlive para Vistas

```vue
<!-- App.vue -->
<template>
  <!-- Mantiene en memoria hasta 10 vistas -->
  <KeepAlive :max="10" :include="['FeedPage', 'ProfilePage']">
    <RouterView />
  </KeepAlive>
</template>
```

### Montaje Diferido de Componentes Pesados

```typescript
// composables/useDeferredMount.ts
export function useDeferredMount(delay: number = 0) {
  const isMounted = ref(false)

  onMounted(() => {
    if (delay === 0) {
      isMounted.value = true
    } else {
      requestIdleCallback(
        () => { isMounted.value = true },
        { timeout: delay }
      )
    }
  })

  return { isMounted }
}
```

```vue
<script setup lang="ts">
// Diferir componentes pesados hasta que el navegador esté libre
const { isMounted } = useDeferredMount(1000)
</script>

<template>
  <div>
    <!-- Contenido crítico carga de inmediato -->
    <FeedHeader />

    <!-- Componentes pesados cargan en idle -->
    <template v-if="isMounted">
      <RichTextEditor />
      <AnalyticsDashboard />
    </template>
  </div>
</template>
```

---

## Optimización de Listas

### Scroll Virtual

```vue
<!-- components/VirtualList.vue -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  itemHeight: number
  containerHeight: number
  buffer?: number
}

const props = withDefaults(defineProps<Props>(), { buffer: 5 })

const scrollTop = ref(0)
const containerRef = ref<HTMLElement | null>(null)

// Calcular rango visible
const visibleRange = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight)
  const visibleCount = Math.ceil(props.containerHeight / props.itemHeight)
  return {
    start: Math.max(0, start - props.buffer),
    end: Math.min(props.items.length, start + visibleCount + props.buffer)
  }
})

const visibleItems = computed(() =>
  props.items.slice(visibleRange.value.start, visibleRange.value.end)
)

const totalHeight = computed(() => props.items.length * props.itemHeight)
const offsetY = computed(() => visibleRange.value.start * props.itemHeight)

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLElement).scrollTop
}

onMounted(() => containerRef.value?.addEventListener('scroll', handleScroll))
onUnmounted(() => containerRef.value?.removeEventListener('scroll', handleScroll))
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-list"
    :style="{ height: `${containerHeight}px`, overflow: 'auto' }"
  >
    <div :style="{ height: `${totalHeight}px`, position: 'relative' }">
      <div :style="{ transform: `translateY(${offsetY}px)` }">
        <div
          v-for="(item, index) in visibleItems"
          :key="visibleRange.start + index"
          :style="{ height: `${itemHeight}px` }"
        >
          <slot :item="item" :index="visibleRange.start + index" />
        </div>
      </div>
    </div>
  </div>
</template>
```

```vue
<!-- Uso del scroll virtual en el feed -->
<VirtualList
  :items="posts"
  :item-height="200"
  :container-height="800"
  :buffer="3"
  v-slot="{ item }"
>
  <PostCard :post="item" />
</VirtualList>
```

### Intersection Observer para Lazy Render

```typescript
// composables/useIntersectionObserver.ts
export function useIntersectionObserver(
  target: Ref<HTMLElement | null>,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const observer = ref<IntersectionObserver | null>(null)

  const observe = () => {
    if (!target.value) return
    observer.value = new IntersectionObserver(callback, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    })
    observer.value.observe(target.value)
  }

  const unobserve = () => {
    if (observer.value && target.value) {
      observer.value.unobserve(target.value)
      observer.value.disconnect()
    }
  }

  onMounted(observe)
  onUnmounted(unobserve)

  return { observer, observe, unobserve }
}
```

```vue
<!-- Renderizado lazy de posts -->
<script setup lang="ts">
const postRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(
  postRef,
  ([entry]) => { isVisible.value = entry.isIntersecting }
)
</script>

<template>
  <div ref="postRef" class="post-container">
    <PostCard v-if="isVisible" :post="post" />
    <PostSkeleton v-else />
  </div>
</template>
```

### Scroll Infinito Optimizado

```typescript
// composables/useInfiniteScroll.ts
export function useInfiniteScroll<T>(
  loadMore: () => Promise<T[]>,
  options: { threshold?: number; initialLoad?: boolean } = {}
) {
  const items = ref<T[]>([])
  const loading = ref(false)
  const hasMore = ref(true)
  const error = ref<Error | null>(null)
  const sentinel = ref<HTMLElement | null>(null)

  const loadNextPage = async () => {
    if (loading.value || !hasMore.value) return

    loading.value = true
    error.value = null

    try {
      const newItems = await loadMore()
      if (newItems.length === 0) {
        hasMore.value = false
      } else {
        items.value.push(...newItems)
      }
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  // IntersectionObserver sobre el elemento centinela
  useIntersectionObserver(
    sentinel,
    ([entry]) => {
      if (entry.isIntersecting) loadNextPage()
    },
    { threshold: options.threshold || 0.1 }
  )

  if (options.initialLoad !== false) {
    onMounted(loadNextPage)
  }

  return { items, loading, hasMore, error, sentinel, loadMore: loadNextPage }
}
```

---

## Optimización de Imágenes

### Imágenes Responsivas y Modernas

```vue
<template>
  <!-- Formatos modernos con fallbacks -->
  <picture>
    <source :srcset="`${image.url}.avif`" type="image/avif" />
    <source :srcset="`${image.url}.webp`" type="image/webp" />
    <img
      :src="`${image.url}.jpg`"
      :alt="image.alt"
      loading="lazy"
      decoding="async"
    />
  </picture>

  <!-- Srcset responsivo -->
  <img
    :src="image.url"
    :srcset="`
      ${image.url}?w=400 400w,
      ${image.url}?w=800 800w,
      ${image.url}?w=1200 1200w
    `"
    sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
    loading="lazy"
    :alt="image.alt"
  />

  <!-- Técnica blur-up (placeholder difuminado) -->
  <div class="image-container" style="position: relative;">
    <img
      :src="image.thumbnail"
      class="blur-placeholder"
      :style="{ filter: isLoaded ? 'blur(0)' : 'blur(20px)', transition: 'filter 0.3s' }"
    />
    <img
      :src="image.url"
      @load="isLoaded = true"
      loading="lazy"
      style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;"
    />
  </div>
</template>
```

---

## Rendimiento en Tiempo de Ejecución

### Debounce y Throttle

```typescript
// composables/useDebounce.ts
export function useDebounce<T>(
  fn: (...args: any[]) => T,
  delay: number = 300
): (...args: any[]) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// composables/useThrottle.ts
export function useThrottle<T>(
  fn: (...args: any[]) => T,
  limit: number = 300
): (...args: any[]) => void {
  let inThrottle = false

  return (...args: any[]) => {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Uso en búsqueda
const searchQuery = ref('')
const debouncedSearch = useDebounce((query: string) => {
  fetchSearchResults(query)
}, 300)

watch(searchQuery, debouncedSearch)
```

### Web Workers para Tareas Pesadas

```typescript
// workers/feed-processor.worker.ts
self.onmessage = (e: MessageEvent) => {
  const { posts, algorithm } = e.data

  let processedPosts = posts

  if (algorithm === 'algorithmic') {
    processedPosts = posts
      .map((post: any) => ({
        ...post,
        score: calculateScore(post)
      }))
      .sort((a: any, b: any) => b.score - a.score)
  } else {
    processedPosts = posts.sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  self.postMessage(processedPosts)
}

function calculateScore(post: any): number {
  const hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / 3600000
  const engagementScore = post.likesCount * 2 + post.commentsCount * 3
  return engagementScore * Math.exp(-hoursAgo / 24)
}

// Uso en composable
export function useFeedProcessor() {
  const worker = new Worker(
    new URL('@/workers/feed-processor.worker.ts', import.meta.url),
    { type: 'module' }
  )

  const processPosts = (posts: Post[], algorithm: string): Promise<Post[]> => {
    return new Promise((resolve) => {
      worker.onmessage = (e) => resolve(e.data)
      worker.postMessage({ posts, algorithm })
    })
  }

  onUnmounted(() => worker.terminate())

  return { processPosts }
}
```

---

## Estrategias de Caché

### Service Worker para Caché de Assets

```javascript
// public/sw.js
const CACHE_NAME = 'nexo-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/avatar-default.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Cache first para assets estáticos
      if (response) return response

      return fetch(event.request).then(fetchResponse => {
        // Cachear respuestas de imágenes
        if (event.request.destination === 'image') {
          const responseToCache = fetchResponse.clone()
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
        }
        return fetchResponse
      })
    })
  )
})
```

---

## Monitoreo de Rendimiento

### Integración con Performance API

```typescript
// utils/performance.ts
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map()

  static mark(name: string): void {
    this.marks.set(name, performance.now())
    performance.mark(name)
  }

  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark) || 0
    const duration = performance.now() - start
    performance.measure(name, startMark)
    console.log(`📊 [${name}]: ${duration.toFixed(2)}ms`)
    return duration
  }

  static observeLCP(): void {
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log(`🎨 LCP: ${lastEntry.startTime.toFixed(2)}ms`)
    }).observe({ type: 'largest-contentful-paint', buffered: true })
  }

  static observeCLS(): void {
    let cumulativeLayoutShift = 0
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cumulativeLayoutShift += (entry as any).value
        }
      }
      console.log(`📐 CLS: ${cumulativeLayoutShift.toFixed(4)}`)
    }).observe({ type: 'layout-shift', buffered: true })
  }
}
```

---

## Optimizaciones para App Social Nexo

### Checklist de Rendimiento

```
✅ Bundle splitting: vue-vendor / firebase-vendor / ui-vendor
✅ Lazy loading de todas las rutas
✅ Virtual scroll en el feed (posts > 100)
✅ v-memo en PostCard (solo re-render si cambian likes/comments)
✅ KeepAlive en FeedPage y ProfilePage
✅ Imágenes con loading="lazy" y formato WebP/AVIF
✅ Debounce en búsqueda (300ms)
✅ Throttle en scroll handler (100ms)
✅ Worker para procesamiento del feed algorítmico
✅ Service Worker para assets estáticos
✅ Compresión Brotli en producción
✅ Prefetch de rutas de alta prioridad
✅ requestIdleCallback para componentes no críticos
✅ IntersectionObserver para lazy render de posts
✅ Actualizaciones optimistas (reduce bloqueo de UI)
```

### Métricas Objetivo para Nexo

| Métrica | Objetivo | Crítico |
|---------|----------|---------|
| LCP | < 2s | < 4s |
| FID | < 50ms | < 100ms |
| CLS | < 0.05 | < 0.1 |
| Bundle total | < 400KB gzip | < 700KB |
| Time to Interactive | < 3s | < 5s |
| Lighthouse Score | ≥ 90 | ≥ 75 |
