import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface InfiniteScrollOptions {
  threshold?: number
  disabled?: Ref<boolean>
}

/**
 * useInfiniteScroll
 * Composable genérico para detectar cuándo el usuario llega al final de la página.
 */
export function useInfiniteScroll(
  onLoadMore: () => Promise<void>,
  options: InfiniteScrollOptions = {}
) {
  const { threshold = 100, disabled = ref(false) } = options
  const loading = ref(false)

  const handleScroll = async () => {
    if (loading.value || disabled.value) return

    const scrollHeight = document.documentElement.scrollHeight
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
    const clientHeight = document.documentElement.clientHeight

    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      loading.value = true
      try {
        await onLoadMore()
      } finally {
        loading.value = false
      }
    }
  }

  onMounted(() => {
    window.addEventListener('scroll', handleScroll)
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    loading
  }
}
