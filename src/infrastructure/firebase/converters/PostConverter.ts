import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp as FirebaseTimestamp
} from 'firebase/firestore'
import { Post } from '@/core/entities/Post'

export interface FirebasePostData {
  id: string
  authorId: string
  content: string
  images: string[]
  mentions: string[]
  hashtags: string[]
  likes: string[]
  likesCount: number
  commentsCount: number
  sharesCount: number
  visibility: string
  createdAt: FirebaseTimestamp
  updatedAt: FirebaseTimestamp
  isEdited: boolean
}

export class PostConverter implements FirestoreDataConverter<Post> {
  toFirestore(post: Post): FirebasePostData {
    const plain = post.toPlainObject()
    return {
      id: plain.id,
      authorId: plain.authorId,
      content: plain.content,
      images: plain.images,
      mentions: plain.mentions,
      hashtags: plain.hashtags,
      likes: plain.likes,
      likesCount: plain.likesCount,
      commentsCount: plain.commentsCount,
      sharesCount: plain.sharesCount,
      visibility: plain.visibility,
      createdAt: FirebaseTimestamp.fromDate(new Date(plain.createdAt)),
      updatedAt: FirebaseTimestamp.fromDate(new Date(plain.updatedAt)),
      isEdited: plain.isEdited
    }
  }

  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Post {
    const data = snapshot.data(options) as FirebasePostData

    return Post.reconstitute({
      id: data.id,
      authorId: data.authorId,
      content: data.content,
      images: data.images || [],
      likes: data.likes || [],
      likesCount: data.likesCount || 0,
      commentsCount: data.commentsCount || 0,
      sharesCount: data.sharesCount || 0,
      visibility: data.visibility || 'PUBLIC',
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      isEdited: data.isEdited || false
    })
  }
}
