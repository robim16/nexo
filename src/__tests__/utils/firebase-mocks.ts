import { vi } from 'vitest'

/**
 * Mocks globales para Firebase Auth
 */
export const mockFirebaseAuth = {
  getAuth: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  sendEmailVerification: vi.fn(),
  sendPasswordResetEmail: vi.fn()
}

/**
 * Mocks globales para Cloud Firestore
 */
const mockCollection = {
  withConverter: vi.fn().mockReturnThis(),
  doc: vi.fn().mockReturnThis()
}

export const mockFirebaseFirestore = {
  getFirestore: vi.fn(),
  collection: vi.fn(() => mockCollection),
  doc: vi.fn(() => mockCollection),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  startAfter: vi.fn(),
  onSnapshot: vi.fn(() => vi.fn()) // Retorna función de desuscripción
}

/**
 * Mocks globales para Firebase Storage
 */
export const mockFirebaseStorage = {
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn()
}

// Configurar mocks en Vitest
vi.mock('firebase/auth', () => mockFirebaseAuth)
vi.mock('firebase/firestore', () => mockFirebaseFirestore)
vi.mock('firebase/storage', () => mockFirebaseStorage)
