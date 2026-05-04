import { ref, watch, onUnmounted } from 'vue'

/**
 * useDebounce
 * Retrasa la ejecución de un valor hasta que haya pasado un tiempo determinado sin cambios.
 */
export function useDebounce<T>(value: { value: T }, delay = 500) {
  const debouncedValue = ref(value.value) as any
  let timeout: any = null

  const stop = watch(
    () => value.value,
    (newVal) => {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        debouncedValue.value = newVal
      }, delay)
    }
  )

  onUnmounted(() => {
    stop()
    if (timeout) clearTimeout(timeout)
  })

  return debouncedValue
}

/**
 * useThrottle
 * Asegura que una función se ejecute como máximo una vez cada determinado tiempo.
 */
export function useThrottle<T extends (...args: any[]) => any>(fn: T, limit = 500) {
  let inThrottle = false

  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * useIntersectionObserver
 * Observa si un elemento es visible en el viewport.
 */
export function useIntersectionObserver(
  target: { value: Element | null },
  callback: (isIntersecting: boolean) => void,
  options: IntersectionObserverInit = {}
) {
  let observer: IntersectionObserver | null = null

  const stop = () => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  watch(
    () => target.value,
    (el) => {
      stop()
      if (el) {
        observer = new IntersectionObserver((entries) => {
          callback(entries[0].isIntersecting)
        }, options)
        observer.observe(el)
      }
    }
  )

  onUnmounted(stop)

  return { stop }
}
