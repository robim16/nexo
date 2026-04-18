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
  getCountFromServer,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp as FirebaseTimestamp,
  onSnapshot,
  writeBatch
} from 'firebase/firestore'
import { collections, db } from '../config/firebase.config'
import { FirebaseBaseRepository } from './FirebaseBaseRepository'
import { INotificationRepository, Unsubscribe } from '@/core/ports/repositories/INotificationRepository'
import { Notification } from '@/core/entities/Notification'
import { NotificationId } from '@/core/value-objects/NotificationId'
import { UserId } from '@/core/value-objects/UserId'

const NotificationConverter: FirestoreDataConverter<Notification> = {
  toFirestore(notification: Notification) {
    const plain = notification.toPlainObject()
    return {
      id: plain.id,
      recipientId: plain.recipientId,
      actorId: plain.actorId,
      type: plain.type,
      postId: plain.postId,
      message: plain.message,
      isRead: plain.isRead,
      createdAt: FirebaseTimestamp.fromDate(new Date(plain.createdAt)),
      readAt: plain.readAt ? FirebaseTimestamp.fromDate(new Date(plain.readAt)) : null
    }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): Notification {
    const data = snapshot.data(options)
    return Notification.reconstitute({
      id: data.id,
      recipientId: data.recipientId,
      actorId: data.actorId,
      type: data.type,
      postId: data.postId || null,
      message: data.message || '',
      isRead: data.isRead || false,
      createdAt: data.createdAt.toDate(),
      readAt: data.readAt ? data.readAt.toDate() : null
    })
  }
}

export class FirebaseNotificationRepository
  extends FirebaseBaseRepository<Notification, NotificationId>
  implements INotificationRepository
{
  constructor() {
    super(collections.notifications, NotificationConverter)
  }

  protected idToString(id: NotificationId): string {
    return id.value
  }

  protected getIdFromEntity(entity: Notification): NotificationId {
    return entity.id
  }

  async findByRecipient(
    recipientId: UserId,
    options?: { limit?: number; lastId?: NotificationId }
  ): Promise<Notification[]> {
    try {
      const limit = options?.limit || 20
      let q = query(
        this.collection,
        where('recipientId', '==', recipientId.value),
        orderBy('createdAt', 'desc'),
        fbLimit(limit)
      )

      if (options?.lastId) {
        const lastDocRef = doc(this.collection, options.lastId.value)
        const lastDocSnap = await getDoc(lastDocRef)
        if (lastDocSnap.exists()) {
          q = query(q, startAfter(lastDocSnap))
        }
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => doc.data() as Notification)
    } catch (error) {
      this.handleError('findByRecipient', error)
      return []
    }
  }

  async markAsRead(id: NotificationId): Promise<void> {
    try {
      const docRef = doc(this.collection, id.value)
      await updateDoc(docRef, { isRead: true })
    } catch (error) {
      this.handleError('markAsRead', error)
      throw error
    }
  }

  async markAllAsRead(recipientId: UserId): Promise<void> {
    try {
      const q = query(
        this.collection,
        where('recipientId', '==', recipientId.value),
        where('isRead', '==', false)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return

      const batch = writeBatch(db)
      snapshot.docs.forEach((document) => {
        batch.update(document.ref, { isRead: true })
      })

      await batch.commit()
    } catch (error) {
      this.handleError('markAllAsRead', error)
      throw error
    }
  }

  async getUnreadCount(recipientId: UserId): Promise<number> {
    try {
      const q = query(
        this.collection,
        where('recipientId', '==', recipientId.value),
        where('isRead', '==', false)
      )
      const snap = await getCountFromServer(q)
      return snap.data().count
    } catch (error) {
      this.handleError('getUnreadCount', error)
      return 0
    }
  }

  subscribeToRecipient(
    recipientId: UserId,
    callback: (notifications: Notification[]) => void
  ): Unsubscribe {
    const q = query(
      this.collection,
      where('recipientId', '==', recipientId.value),
      orderBy('createdAt', 'desc'),
      fbLimit(50)
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(docSnap => docSnap.data() as Notification)
        callback(items)
      },
      (error) => {
        this.handleError('subscribeToRecipient', error)
        callback([])
      }
    )
  }
}
