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
      await updateProfile(credential.user, { displayName })
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

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
         callback(this.mapFirebaseUserToDomain(firebaseUser))
      } else {
         callback(null)
      }
    })
  }

  getCurrentUserId(): string | null {
    return this.currentFirebaseUser?.uid || null
  }

  isAuthenticated(): boolean {
    return this.currentFirebaseUser !== null
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
