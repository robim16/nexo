import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp as FirebaseTimestamp
} from 'firebase/firestore'
import { User } from '@/core/entities/User'

export interface FirebaseUserData {
  id: string
  email: string
  displayName: string
  bio: string
  avatar: string | null
  followersCount: number
  followingCount: number
  postsCount: number
  createdAt: FirebaseTimestamp
  updatedAt: FirebaseTimestamp
  isVerified: boolean
  isActive: boolean
}

export class UserConverter implements FirestoreDataConverter<User> {
  toFirestore(user: User): FirebaseUserData {
    const plain = user.toPlainObject()
    return {
      id: plain.id,
      email: plain.email,
      displayName: plain.displayName,
      bio: plain.bio,
      avatar: plain.avatar,
      followersCount: plain.followersCount,
      followingCount: plain.followingCount,
      postsCount: plain.postsCount,
      createdAt: FirebaseTimestamp.fromDate(new Date(plain.createdAt)),
      updatedAt: FirebaseTimestamp.fromDate(new Date(plain.updatedAt)),
      isVerified: plain.isVerified,
      isActive: plain.isActive
    }
  }

  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): User {
    const data = snapshot.data(options) as any // Cast to any to handle flexible types

    const toDate = (ts: any): Date => {
      if (!ts) return new Date()
      if (typeof ts.toDate === 'function') return ts.toDate()
      if (ts instanceof Date) return ts
      if (ts.seconds) return new Date(ts.seconds * 1000)
      return new Date(ts)
    }

    return User.reconstitute({
      id: data.id,
      email: data.email,
      displayName: data.displayName,
      bio: data.bio || '',
      avatar: data.avatar || null,
      followersCount: data.followersCount || 0,
      followingCount: data.followingCount || 0,
      postsCount: data.postsCount || 0,
      createdAt: toDate(data.createdAt),
      updatedAt: toDate(data.updatedAt),
      isVerified: data.isVerified || false,
      isActive: data.isActive ?? true
    })
  }
}
