import {
  query,
  where,
  orderBy,
  limit as fbLimit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  onSnapshot
} from 'firebase/firestore'
import { collections } from '../config/firebase.config'
import { FirebaseBaseRepository } from './FirebaseBaseRepository'
import { IPostRepository, Unsubscribe, FeedOptions } from '@/core/ports/repositories/IPostRepository'
import { Post } from '@/core/entities/Post'
import { PostId } from '@/core/value-objects/PostId'
import { UserId } from '@/core/value-objects/UserId'
import { PostConverter } from '../converters/PostConverter'

export class FirebasePostRepository
  extends FirebaseBaseRepository<Post, PostId>
  implements IPostRepository
{
  constructor() {
    super(collections.posts, new PostConverter())
  }

  protected idToString(id: PostId): string {
    return id.value
  }

  protected getIdFromEntity(entity: Post): PostId {
    return entity.id
  }

  async findByAuthor(authorId: UserId, limit: number = 20): Promise<Post[]> {
    try {
      const q = query(
        this.collection,
        where('authorId', '==', authorId.value),
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Post)
    } catch (error) {
      this.handleError('findByAuthor', error)
      return []
    }
  }

  async getFeed(
    userId: UserId,
    followingIds: string[],
    options?: FeedOptions
  ): Promise<Post[]> {
    try {
      if (!followingIds || followingIds.length === 0) return []

      const fetchLimit = options?.limit || 20
      
      // Firebase 'in' max limit is 10
      const idsToFetch = followingIds.slice(0, 10)
      
      let q = query(
        this.collection,
        where('authorId', 'in', idsToFetch),
        orderBy('createdAt', 'desc'),
        fbLimit(fetchLimit)
      )

      if (options?.lastPostId) {
        const lastDocRef = doc(this.collection, options.lastPostId.value)
        const lastDocSnap = await getDoc(lastDocRef)
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap))
        }
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Post)
    } catch (error) {
      this.handleError('getFeed', error)
      return []
    }
  }

  async like(postId: PostId, userId: UserId): Promise<void> {
    try {
      const docRef = doc(this.collection, postId.value)
      await updateDoc(docRef, {
        likes: arrayUnion(userId.value),
        likesCount: increment(1),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      this.handleError('like', error)
      throw error
    }
  }

  async unlike(postId: PostId, userId: UserId): Promise<void> {
    try {
      const docRef = doc(this.collection, postId.value)
      await updateDoc(docRef, {
        likes: arrayRemove(userId.value),
        likesCount: increment(-1),
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      this.handleError('unlike', error)
      throw error
    }
  }

  async incrementCommentsCount(postId: PostId): Promise<void> {
    try {
      const docRef = doc(this.collection, postId.value)
      await updateDoc(docRef, {
        commentsCount: increment(1)
      })
    } catch (error) {
      this.handleError('incrementCommentsCount', error)
      throw error
    }
  }

  async decrementCommentsCount(postId: PostId): Promise<void> {
    try {
      const docRef = doc(this.collection, postId.value)
      // Nota: Si queremos evitar negativos con decrementos complejos,
      // usariamos firestoreUtils.runTransaction, pero increment() funciona bien si asumimos correctitud.
      await updateDoc(docRef, {
        commentsCount: increment(-1)
      })
    } catch (error) {
      this.handleError('decrementCommentsCount', error)
      throw error
    }
  }

  subscribeToPost(postId: PostId, callback: (post: Post | null) => void): Unsubscribe {
    const docRef = doc(this.collection, postId.value)

    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as Post)
        } else {
          callback(null)
        }
      },
      (error) => {
        this.handleError('subscribeToPost', error)
        callback(null)
      }
    )
  }

  subscribeToFeed(
    followingIds: string[],
    callback: (posts: Post[]) => void
  ): Unsubscribe {
    if (!followingIds || followingIds.length === 0) {
      callback([])
      return () => {}
    }

    const idsToFetch = followingIds.slice(0, 10)
    
    const q = query(
      this.collection,
      where('authorId', 'in', idsToFetch),
      orderBy('createdAt', 'desc'),
      fbLimit(50)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const posts = snapshot.docs.map(doc => doc.data() as Post)
        callback(posts)
      },
      (error) => {
        this.handleError('subscribeToFeed', error)
        callback([])
      }
    )
  }
}
