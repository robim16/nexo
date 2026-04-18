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
  notifications: 'notifications'
} as const

export type CollectionName = keyof typeof collections
