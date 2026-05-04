import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  limit as fbLimit,
  DocumentData,
  FirestoreDataConverter,
  CollectionReference
} from 'firebase/firestore'
import { db } from '../config/firebase.config'
import { IBaseRepository } from '@/core/ports/repositories/IBaseRepository'

export abstract class FirebaseBaseRepository<T, ID> implements IBaseRepository<T, ID> {
  protected collection: CollectionReference<T>

  constructor(
    protected collectionName: string,
    protected converter: FirestoreDataConverter<T>
  ) {
    this.collection = collection(db, collectionName).withConverter(
      converter
    ) as CollectionReference<T>
  }

  protected abstract idToString(id: ID): string
  protected abstract getIdFromEntity(entity: T): ID

  async findById(id: ID): Promise<T | null> {
    try {
      const docRef = doc(this.collection, this.idToString(id))
      const snapshot = await getDoc(docRef)
      if (!snapshot.exists()) return null
      return snapshot.data()
    } catch (error) {
      this.handleError('findById', error)
      return null
    }
  }

  async findAll(limit: number = 100): Promise<T[]> {
    try {
      const q = query(this.collection, fbLimit(limit))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => doc.data())
    } catch (error) {
      this.handleError('findAll', error)
      return []
    }
  }

  async save(entity: T): Promise<void> {
    try {
      const id = this.idToString(this.getIdFromEntity(entity))
      const docRef = doc(this.collection, id)
      await setDoc(docRef, entity)
    } catch (error) {
      this.handleError('save', error)
      throw error
    }
  }

  async update(entity: T): Promise<void> {
    try {
      const id = this.idToString(this.getIdFromEntity(entity))
      const docRef = doc(this.collection, id)
      // Extraemos el objeto plano usando el converter explícitamente para evitar problemas con TS y genéricos de Firebase
      const firestoreData = this.converter.toFirestore(entity, { merge: true })
      await updateDoc(docRef, firestoreData as any)
    } catch (error) {
      this.handleError('update', error)
      throw error
    }
  }

  async delete(id: ID): Promise<void> {
    try {
      const docRef = doc(this.collection, this.idToString(id))
      await deleteDoc(docRef)
    } catch (error) {
      this.handleError('delete', error)
      throw error
    }
  }

  async exists(id: ID): Promise<boolean> {
    try {
      const docRef = doc(this.collection, this.idToString(id))
      const snapshot = await getDoc(docRef)
      return snapshot.exists()
    } catch (error) {
      this.handleError('exists', error)
      return false
    }
  }

  protected handleError(method: string, error: unknown): void {
    console.error(`[${this.collectionName}Repository.${method}]`, error)
  }
}
