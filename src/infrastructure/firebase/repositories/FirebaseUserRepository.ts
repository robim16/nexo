import {
  query,
  where,
  getDocs,
  limit as fbLimit,
  documentId,
  doc,
  onSnapshot
} from 'firebase/firestore'
import { collections } from '../config/firebase.config'
import { firestoreUtils } from '../config/firestore.config'
import { FirebaseBaseRepository } from './FirebaseBaseRepository'
import { IUserRepository } from '@/core/ports/repositories/IUserRepository'
import { Unsubscribe } from '@/core/ports/repositories/IPostRepository'
import { User } from '@/core/entities/User'
import { UserId } from '@/core/value-objects/UserId'
import { Email } from '@/core/value-objects/Email'
import { UserConverter } from '../converters/UserConverter'

export class FirebaseUserRepository
  extends FirebaseBaseRepository<User, UserId>
  implements IUserRepository
{
  constructor() {
    super(collections.users, new UserConverter())
  }

  protected idToString(id: UserId): string {
    return id.value
  }

  protected getIdFromEntity(entity: User): UserId {
    return entity.id
  }

  async findByEmail(email: Email): Promise<User | null> {
    try {
      const q = query(this.collection, where('email', '==', email.value), fbLimit(1))
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      return snapshot.docs[0].data() as User
    } catch (error) {
      this.handleError('findByEmail', error)
      return null
    }
  }

  async findByDisplayName(displayNameQuery: string, limit: number = 10): Promise<User[]> {
    try {
      // Nota: Búsqueda parcial real requiere algo como Algolia o similares.
      // Aquí hacemos un sufijo de búsqueda simple usando >= y <= para fines prácticos.
      const q = query(
        this.collection,
        where('displayName', '>=', displayNameQuery),
        where('displayName', '<=', displayNameQuery + '\uf8ff'),
        fbLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((docSnap) => docSnap.data() as User)
    } catch (error) {
      this.handleError('findByDisplayName', error)
      return []
    }
  }

  async findManyByIds(ids: UserId[]): Promise<User[]> {
    if (!ids || ids.length === 0) return []

    try {
      // Firebase limit: 'in' operator supports max 10 elements. Needs batching for more
      const chunkedIds = this.chunkArray(
        ids.map((id) => id.value),
        10
      )
      const results: User[] = []

      for (const chunk of chunkedIds) {
        const q = query(this.collection, where(documentId(), 'in', chunk))
        const snapshot = await getDocs(q)
        results.push(...snapshot.docs.map((docSnap) => docSnap.data() as User))
      }

      return results
    } catch (error) {
      this.handleError('findManyByIds', error)
      return []
    }
  }

  async updateCounters(
    userId: UserId,
    delta: { followersCount?: number; followingCount?: number; postsCount?: number }
  ): Promise<void> {
    try {
      await firestoreUtils.runTransaction(async (transaction) => {
        const userRef = doc(this.collection, userId.value)
        const userDoc = await transaction.get(userRef)

        if (!userDoc.exists()) throw new Error('User not found')

        const currentData = userDoc.data() as any

        const newFollowers = Math.max(
          0,
          (currentData.followersCount || 0) + (delta.followersCount || 0)
        )
        const newFollowing = Math.max(
          0,
          (currentData.followingCount || 0) + (delta.followingCount || 0)
        )
        const newPosts = Math.max(0, (currentData.postsCount || 0) + (delta.postsCount || 0))

        transaction.update(userRef, {
          followersCount: newFollowers,
          followingCount: newFollowing,
          postsCount: newPosts,
          updatedAt: new Date()
        })
      })
    } catch (error) {
      this.handleError('updateCounters', error)
      throw error
    }
  }

  subscribeToUser(userId: UserId, callback: (user: User | null) => void): Unsubscribe {
    const docRef = doc(this.collection, userId.value)
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as User)
        } else {
          callback(null)
        }
      },
      (error) => {
        this.handleError('subscribeToUser', error)
        callback(null)
      }
    )
  }

  private chunkArray<T>(arr: T[], size: number): T[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    )
  }
}
