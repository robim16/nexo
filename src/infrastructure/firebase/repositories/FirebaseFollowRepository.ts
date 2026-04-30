import {
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getCountFromServer,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp as FirebaseTimestamp
} from 'firebase/firestore'
import { collections, db } from '../config/firebase.config'
import { FirebaseBaseRepository } from './FirebaseBaseRepository'
import { IFollowRepository } from '@/core/ports/repositories/IFollowRepository'
import { Follow } from '@/core/entities/Follow'
import { FollowId } from '@/core/value-objects/FollowId'
import { UserId } from '@/core/value-objects/UserId'

const FollowConverter: FirestoreDataConverter<Follow> = {
  toFirestore(follow: Follow) {
    const plain = follow.toPlainObject()
    return {
      id: plain.id,
      followerId: plain.followerId,
      followingId: plain.followingId,
      createdAt: FirebaseTimestamp.fromDate(new Date(plain.createdAt))
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Follow {
    const data = snapshot.data(options) as any

    const toDate = (ts: any): Date => {
      if (!ts) return new Date()
      if (typeof ts.toDate === 'function') return ts.toDate()
      if (ts instanceof Date) return ts
      if (ts.seconds) return new Date(ts.seconds * 1000)
      return new Date(ts)
    }

    return Follow.reconstitute({
      id: data.id,
      followerId: data.followerId,
      followingId: data.followingId,
      createdAt: toDate(data.createdAt)
    })
  }
}

export class FirebaseFollowRepository
  extends FirebaseBaseRepository<Follow, FollowId>
  implements IFollowRepository
{
  constructor() {
    super(collections.follows, FollowConverter)
  }

  protected idToString(id: FollowId): string {
    return id.value
  }

  protected getIdFromEntity(entity: Follow): FollowId {
    return entity.id
  }

  async deleteByUsers(followerId: UserId, followingId: UserId): Promise<void> {
    try {
      const relation = await this.findByFollowerAndFollowing(followerId, followingId)
      if (relation) {
        await deleteDoc(doc(this.collection, relation.id.value))
      }
    } catch (error) {
      this.handleError('deleteByUsers', error)
      throw error
    }
  }

  async findByFollowerAndFollowing(
    followerId: UserId,
    followingId: UserId
  ): Promise<Follow | null> {
    try {
      const q = query(
        this.collection,
        where('followerId', '==', followerId.value),
        where('followingId', '==', followingId.value)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      return snapshot.docs[0].data() as Follow
    } catch (error) {
      this.handleError('findByFollowerAndFollowing', error)
      return null
    }
  }

  async findFollowers(userId: UserId, limit?: number): Promise<Follow[]> {
    try {
      // Si se ocupa limit, se debe agregar el sort o fbLimit al builder respectivo
      const q = query(this.collection, where('followingId', '==', userId.value))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((docSnap) => docSnap.data() as Follow)
    } catch (error) {
      this.handleError('findFollowers', error)
      return []
    }
  }

  async findFollowing(userId: UserId, limit?: number): Promise<Follow[]> {
    try {
      const q = query(this.collection, where('followerId', '==', userId.value))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((docSnap) => docSnap.data() as Follow)
    } catch (error) {
      this.handleError('findFollowing', error)
      return []
    }
  }

  async isFollowing(followerId: UserId, followingId: UserId): Promise<boolean> {
    try {
      const relation = await this.findByFollowerAndFollowing(followerId, followingId)
      return relation !== null
    } catch (error) {
      this.handleError('isFollowing', error)
      return false
    }
  }

  async getFollowingIds(userId: UserId): Promise<string[]> {
    try {
      const relations = await this.findFollowing(userId)
      return relations.map(r => r.followingId.value)
    } catch (error) {
      this.handleError('getFollowingIds', error)
      return []
    }
  }

  async countFollowers(userId: UserId): Promise<number> {
    try {
      const q = query(this.collection, where('followingId', '==', userId.value))
      const snapshot = await getCountFromServer(q)
      return snapshot.data().count
    } catch (error) {
      this.handleError('countFollowers', error)
      return 0
    }
  }

  async countFollowing(userId: UserId): Promise<number> {
    try {
      const q = query(this.collection, where('followerId', '==', userId.value))
      const snapshot = await getCountFromServer(q)
      return snapshot.data().count
    } catch (error) {
      this.handleError('countFollowing', error)
      return 0
    }
  }
}
