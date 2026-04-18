import { WriteBatch, writeBatch, Transaction, runTransaction } from 'firebase/firestore'
import { db } from './firebase.config'

export const firestoreUtils = {
  /**
   * Obtiene una nueva instancia de WriteBatch
   */
  getBatch(): WriteBatch {
    return writeBatch(db)
  },

  /**
   * Ejecuta una transacción tipada en un entorno Firestore
   */
  async runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>): Promise<T> {
    return runTransaction(db, updateFunction)
  }
}
