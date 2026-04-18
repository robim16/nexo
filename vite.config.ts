import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isAnalyze = mode === 'analyze'

  return {
    plugins: [
      vue(),

      // Gzip compression
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // only files > 10KB
      }),

      // Brotli compression (superior to gzip)
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
      }),

      // Bundle analyzer (only in analyze mode)
      ...(isAnalyze
        ? [
            visualizer({
              filename: './dist/stats.html',
              open: true,
              gzipSize: true,
              brotliSize: true,
              template: 'treemap',
            }),
          ]
        : []),
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@core': resolve(__dirname, './src/core'),
        '@presentation': resolve(__dirname, './src/presentation'),
        '@infrastructure': resolve(__dirname, './src/infrastructure'),
        '@application': resolve(__dirname, './src/application'),
        '@shared': resolve(__dirname, './src/shared'),
        '@assets': resolve(__dirname, './src/assets'),
        '@composables': resolve(__dirname, './src/presentation/composables'),
        '@components': resolve(__dirname, './src/presentation/components'),
        '@stores': resolve(__dirname, './src/presentation/stores'),
        '@views': resolve(__dirname, './src/presentation/views'),
        '@utils': resolve(__dirname, './src/shared/utils'),
        '@types': resolve(__dirname, './src/shared/types'),
      },
    },

    build: {
      target: 'es2015',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info', 'console.debug'],
        },
        format: {
          comments: false,
        },
      },
      rollupOptions: {
        output: {
          // Manual chunk splitting for optimal caching
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router', 'pinia'],
            'firebase-core': ['firebase/app'],
            'firebase-auth': ['firebase/auth'],
            'firebase-firestore': ['firebase/firestore'],
            'firebase-storage': ['firebase/storage'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash].[ext]'
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash].[ext]'
            }
            return 'assets/[name]-[hash].[ext]'
          },
        },
      },
      chunkSizeWarningLimit: 500,
      sourcemap: false,
      reportCompressedSize: true,
    },

    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia'],
    },

    server: {
      port: 5173,
      host: true,
      open: true,
    },

    preview: {
      port: 4173,
      host: true,
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/tests/**',
          'src/**/*.spec.ts',
          'src/**/*.test.ts',
          'src/main.ts',
        ],
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
          },
        },
      },
    },
  }
})
