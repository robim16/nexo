import { FirestoreDataConverter, QueryDocumentSnapshot, SnapshotOptions, Timestamp } from 'firebase/firestore'
import { Comment } from '../../../core/entities/Comment'

export class CommentConverter implements FirestoreDataConverter<Comment> {
  toFirestore(comment: Comment): any {
    const plain = comment.toPlainObject()
    return {
      postId: plain.postId,
      authorId: plain.authorId,
      content: plain.content,
      likes: plain.likes,
      likesCount: plain.likesCount,
      createdAt: Timestamp.fromDate(new Date(plain.createdAt)),
      updatedAt: Timestamp.fromDate(new Date(plain.updatedAt)),
      isEdited: plain.isEdited
    }
  }

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Comment {
    const data = snapshot.data(options)
    return Comment.reconstitute({
      id: snapshot.id,
      postId: data.postId,
      authorId: data.authorId,
      content: data.content,
      likes: data.likes || [],
      likesCount: data.likesCount || 0,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
      isEdited: data.isEdited || false
    })
  }
}
