// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/andre/OneDrive/Desktop/nexo/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/andre/OneDrive/Desktop/nexo/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { visualizer } from "file:///C:/Users/andre/OneDrive/Desktop/nexo/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import compression from "file:///C:/Users/andre/OneDrive/Desktop/nexo/node_modules/vite-plugin-compression/dist/index.mjs";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\andre\\OneDrive\\Desktop\\nexo";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const isAnalyze = mode === "analyze";
  return {
    plugins: [
      vue(),
      // Gzip compression
      compression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 10240
        // only files > 10KB
      }),
      // Brotli compression (superior to gzip)
      compression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 10240
      }),
      // Bundle analyzer (only in analyze mode)
      ...isAnalyze ? [
        visualizer({
          filename: "./dist/stats.html",
          open: true,
          gzipSize: true,
          brotliSize: true,
          template: "treemap"
        })
      ] : []
    ],
    resolve: {
      alias: {
        "@": resolve(__vite_injected_original_dirname, "./src"),
        "@core": resolve(__vite_injected_original_dirname, "./src/core"),
        "@presentation": resolve(__vite_injected_original_dirname, "./src/presentation"),
        "@infrastructure": resolve(__vite_injected_original_dirname, "./src/infrastructure"),
        "@application": resolve(__vite_injected_original_dirname, "./src/application"),
        "@shared": resolve(__vite_injected_original_dirname, "./src/shared"),
        "@assets": resolve(__vite_injected_original_dirname, "./src/assets"),
        "@composables": resolve(__vite_injected_original_dirname, "./src/presentation/composables"),
        "@components": resolve(__vite_injected_original_dirname, "./src/presentation/components"),
        "@stores": resolve(__vite_injected_original_dirname, "./src/presentation/stores"),
        "@views": resolve(__vite_injected_original_dirname, "./src/presentation/views"),
        "@utils": resolve(__vite_injected_original_dirname, "./src/shared/utils"),
        "@types": resolve(__vite_injected_original_dirname, "./src/shared/types")
      }
    },
    build: {
      target: "es2015",
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ["console.log", "console.info", "console.debug"]
        },
        format: {
          comments: false
        }
      },
      rollupOptions: {
        output: {
          // Manual chunk splitting for optimal caching
          manualChunks: {
            "vue-vendor": ["vue", "vue-router", "pinia"],
            "firebase-core": ["firebase/app"],
            "firebase-auth": ["firebase/auth"],
            "firebase-firestore": ["firebase/firestore"],
            "firebase-storage": ["firebase/storage"]
          },
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp|avif)$/.test(name ?? "")) {
              return "assets/images/[name]-[hash].[ext]";
            }
            if (/\.css$/.test(name ?? "")) {
              return "assets/css/[name]-[hash].[ext]";
            }
            return "assets/[name]-[hash].[ext]";
          }
        }
      },
      chunkSizeWarningLimit: 500,
      sourcemap: false,
      reportCompressedSize: true
    },
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia"]
    },
    server: {
      port: 5173,
      host: true,
      open: true
    },
    preview: {
      port: 4173,
      host: true
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/tests/setup.ts"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["src/**/*.{ts,vue}"],
        exclude: [
          "src/tests/**",
          "src/**/*.spec.ts",
          "src/**/*.test.ts",
          "src/main.ts"
        ],
        thresholds: {
          global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
          }
        }
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxhbmRyZVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXG5leG9cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXGFuZHJlXFxcXE9uZURyaXZlXFxcXERlc2t0b3BcXFxcbmV4b1xcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvYW5kcmUvT25lRHJpdmUvRGVza3RvcC9uZXhvL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcidcbmltcG9ydCBjb21wcmVzc2lvbiBmcm9tICd2aXRlLXBsdWdpbi1jb21wcmVzc2lvbidcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJ1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIGNvbnN0IGlzQW5hbHl6ZSA9IG1vZGUgPT09ICdhbmFseXplJ1xuXG4gIHJldHVybiB7XG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlKCksXG5cbiAgICAgIC8vIEd6aXAgY29tcHJlc3Npb25cbiAgICAgIGNvbXByZXNzaW9uKHtcbiAgICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXG4gICAgICAgIGV4dDogJy5neicsXG4gICAgICAgIHRocmVzaG9sZDogMTAyNDAsIC8vIG9ubHkgZmlsZXMgPiAxMEtCXG4gICAgICB9KSxcblxuICAgICAgLy8gQnJvdGxpIGNvbXByZXNzaW9uIChzdXBlcmlvciB0byBnemlwKVxuICAgICAgY29tcHJlc3Npb24oe1xuICAgICAgICBhbGdvcml0aG06ICdicm90bGlDb21wcmVzcycsXG4gICAgICAgIGV4dDogJy5icicsXG4gICAgICAgIHRocmVzaG9sZDogMTAyNDAsXG4gICAgICB9KSxcblxuICAgICAgLy8gQnVuZGxlIGFuYWx5emVyIChvbmx5IGluIGFuYWx5emUgbW9kZSlcbiAgICAgIC4uLihpc0FuYWx5emVcbiAgICAgICAgPyBbXG4gICAgICAgICAgICB2aXN1YWxpemVyKHtcbiAgICAgICAgICAgICAgZmlsZW5hbWU6ICcuL2Rpc3Qvc3RhdHMuaHRtbCcsXG4gICAgICAgICAgICAgIG9wZW46IHRydWUsXG4gICAgICAgICAgICAgIGd6aXBTaXplOiB0cnVlLFxuICAgICAgICAgICAgICBicm90bGlTaXplOiB0cnVlLFxuICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ3RyZWVtYXAnLFxuICAgICAgICAgICAgfSksXG4gICAgICAgICAgXVxuICAgICAgICA6IFtdKSxcbiAgICBdLFxuXG4gICAgcmVzb2x2ZToge1xuICAgICAgYWxpYXM6IHtcbiAgICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICAgICdAY29yZSc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvY29yZScpLFxuICAgICAgICAnQHByZXNlbnRhdGlvbic6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvcHJlc2VudGF0aW9uJyksXG4gICAgICAgICdAaW5mcmFzdHJ1Y3R1cmUnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2luZnJhc3RydWN0dXJlJyksXG4gICAgICAgICdAYXBwbGljYXRpb24nOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2FwcGxpY2F0aW9uJyksXG4gICAgICAgICdAc2hhcmVkJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9zaGFyZWQnKSxcbiAgICAgICAgJ0Bhc3NldHMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2Fzc2V0cycpLFxuICAgICAgICAnQGNvbXBvc2FibGVzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wcmVzZW50YXRpb24vY29tcG9zYWJsZXMnKSxcbiAgICAgICAgJ0Bjb21wb25lbnRzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wcmVzZW50YXRpb24vY29tcG9uZW50cycpLFxuICAgICAgICAnQHN0b3Jlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvcHJlc2VudGF0aW9uL3N0b3JlcycpLFxuICAgICAgICAnQHZpZXdzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wcmVzZW50YXRpb24vdmlld3MnKSxcbiAgICAgICAgJ0B1dGlscyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc2hhcmVkL3V0aWxzJyksXG4gICAgICAgICdAdHlwZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3NoYXJlZC90eXBlcycpLFxuICAgICAgfSxcbiAgICB9LFxuXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAxNScsXG4gICAgICBtaW5pZnk6ICd0ZXJzZXInLFxuICAgICAgdGVyc2VyT3B0aW9uczoge1xuICAgICAgICBjb21wcmVzczoge1xuICAgICAgICAgIGRyb3BfY29uc29sZTogdHJ1ZSxcbiAgICAgICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLFxuICAgICAgICAgIHB1cmVfZnVuY3M6IFsnY29uc29sZS5sb2cnLCAnY29uc29sZS5pbmZvJywgJ2NvbnNvbGUuZGVidWcnXSxcbiAgICAgICAgfSxcbiAgICAgICAgZm9ybWF0OiB7XG4gICAgICAgICAgY29tbWVudHM6IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgICAgb3V0cHV0OiB7XG4gICAgICAgICAgLy8gTWFudWFsIGNodW5rIHNwbGl0dGluZyBmb3Igb3B0aW1hbCBjYWNoaW5nXG4gICAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgICAndnVlLXZlbmRvcic6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnXSxcbiAgICAgICAgICAgICdmaXJlYmFzZS1jb3JlJzogWydmaXJlYmFzZS9hcHAnXSxcbiAgICAgICAgICAgICdmaXJlYmFzZS1hdXRoJzogWydmaXJlYmFzZS9hdXRoJ10sXG4gICAgICAgICAgICAnZmlyZWJhc2UtZmlyZXN0b3JlJzogWydmaXJlYmFzZS9maXJlc3RvcmUnXSxcbiAgICAgICAgICAgICdmaXJlYmFzZS1zdG9yYWdlJzogWydmaXJlYmFzZS9zdG9yYWdlJ10sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjaHVua0ZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgICBhc3NldEZpbGVOYW1lczogKHsgbmFtZSB9KSA9PiB7XG4gICAgICAgICAgICBpZiAoL1xcLihnaWZ8anBlP2d8cG5nfHN2Z3x3ZWJwfGF2aWYpJC8udGVzdChuYW1lID8/ICcnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9pbWFnZXMvW25hbWVdLVtoYXNoXS5bZXh0XSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgvXFwuY3NzJC8udGVzdChuYW1lID8/ICcnKSkge1xuICAgICAgICAgICAgICByZXR1cm4gJ2Fzc2V0cy9jc3MvW25hbWVdLVtoYXNoXS5bZXh0XSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnYXNzZXRzL1tuYW1lXS1baGFzaF0uW2V4dF0nXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCxcbiAgICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgICByZXBvcnRDb21wcmVzc2VkU2l6ZTogdHJ1ZSxcbiAgICB9LFxuXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBpbmNsdWRlOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXG4gICAgfSxcblxuICAgIHNlcnZlcjoge1xuICAgICAgcG9ydDogNTE3MyxcbiAgICAgIGhvc3Q6IHRydWUsXG4gICAgICBvcGVuOiB0cnVlLFxuICAgIH0sXG5cbiAgICBwcmV2aWV3OiB7XG4gICAgICBwb3J0OiA0MTczLFxuICAgICAgaG9zdDogdHJ1ZSxcbiAgICB9LFxuXG4gICAgdGVzdDoge1xuICAgICAgZ2xvYmFsczogdHJ1ZSxcbiAgICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgICAgc2V0dXBGaWxlczogWycuL3NyYy90ZXN0cy9zZXR1cC50cyddLFxuICAgICAgY292ZXJhZ2U6IHtcbiAgICAgICAgcHJvdmlkZXI6ICd2OCcsXG4gICAgICAgIHJlcG9ydGVyOiBbJ3RleHQnLCAnanNvbicsICdodG1sJ10sXG4gICAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3RzLHZ1ZX0nXSxcbiAgICAgICAgZXhjbHVkZTogW1xuICAgICAgICAgICdzcmMvdGVzdHMvKionLFxuICAgICAgICAgICdzcmMvKiovKi5zcGVjLnRzJyxcbiAgICAgICAgICAnc3JjLyoqLyoudGVzdC50cycsXG4gICAgICAgICAgJ3NyYy9tYWluLnRzJyxcbiAgICAgICAgXSxcbiAgICAgICAgdGhyZXNob2xkczoge1xuICAgICAgICAgIGdsb2JhbDoge1xuICAgICAgICAgICAgYnJhbmNoZXM6IDcwLFxuICAgICAgICAgICAgZnVuY3Rpb25zOiA3MCxcbiAgICAgICAgICAgIGxpbmVzOiA3MCxcbiAgICAgICAgICAgIHN0YXRlbWVudHM6IDcwLFxuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4g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
