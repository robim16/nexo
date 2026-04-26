import {
  query,
  where,
  orderBy,
  limit as fbLimit,
  getDocs,
  doc,
  updateDoc,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore'
import { collections } from '../config/firebase.config'
import { FirebaseBaseRepository } from './FirebaseBaseRepository'
import { ICommentRepository } from '@/core/ports/repositories/ICommentRepository'
import { Comment } from '@/core/entities/Comment'
import { CommentId } from '@/core/value-objects/CommentId'
import { PostId } from '@/core/value-objects/PostId'
import { UserId } from '@/core/value-objects/UserId'
import { CommentConverter } from '../converters/CommentConverter'

export class FirebaseCommentRepository
  extends FirebaseBaseRepository<Comment, CommentId>
  implements ICommentRepository
{
  constructor() {
    super(collections.comments, new CommentConverter())
  }

  protected idToString(id: CommentId): string {
    return id.value
  }

  protected getIdFromEntity(entity: Comment): CommentId {
    return entity.id
  }

  async findByPost(postId: PostId, limitCount?: number): Promise<Comment[]> {
    try {
      const q = query(
        this.collection,
        where('postId', '==', postId.value),
        orderBy('createdAt', 'asc'),
        fbLimit(limitCount || 50)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Comment)
    } catch (error) {
      this.handleError('findByPost', error)
      return []
    }
  }

  async like(commentId: CommentId, userId: UserId): Promise<void> {
    try {
      const docRef = doc(this.collection, commentId.value)
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

  async unlike(commentId: CommentId, userId: UserId): Promise<void> {
    try {
      const docRef = doc(this.collection, commentId.value)
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

  async countByPost(postId: PostId): Promise<number> {
    try {
      const q = query(this.collection, where('postId', '==', postId.value))
      const snapshot = await getDocs(q) // Firestore increment/decrement is usually better for counters
      return snapshot.size
    } catch (error) {
      this.handleError('countByPost', error)
      return 0
    }
  }
}
