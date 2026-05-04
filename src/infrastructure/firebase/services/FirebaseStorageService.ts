import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase.config'
import { IStorageService, UploadResult, UploadOptions } from '@/core/ports/services/IStorageService'

export class FirebaseStorageService implements IStorageService {
  async uploadImage(file: File, path: string, options?: UploadOptions): Promise<UploadResult> {
    // Si se necesita re-size usar biblioteca externa. Para la capa de datos subimos directo.
    return this.uploadFile(file, path, options)
  }

  async uploadFile(file: File, path: string, options?: UploadOptions): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (options?.onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            options.onProgress(progress)
          }
        },
        (error) => {
          console.error(`Error uploading to ${path}`, error)
          reject(error)
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
            resolve({
              downloadUrl,
              storagePath: path,
              sizeBytes: file.size,
              contentType: file.type
            })
          } catch (error) {
            reject(error)
          }
        }
      )
    })
  }

  async deleteFile(urlOrPath: string): Promise<void> {
    try {
      let objectRef
      if (urlOrPath.startsWith('http')) {
        // En firebase las imagenes se obtienen por URL y por path
        // Existe refFromURL en sdks viejos, en web v9 no pero ref(storage, url) funciona si la URL es de storage.
        objectRef = ref(storage, urlOrPath)
      } else {
        objectRef = ref(storage, urlOrPath)
      }
      await deleteObject(objectRef)
    } catch (error) {
      console.error(`Error deleting file ${urlOrPath}`, error)
      throw error
    }
  }

  async deleteFiles(urlsOrPaths: string[]): Promise<void> {
    const promises = urlsOrPaths.map((path) => this.deleteFile(path))
    await Promise.allSettled(promises)
  }

  async getDownloadUrl(storagePath: string): Promise<string> {
    const objectRef = ref(storage, storagePath)
    return getDownloadURL(objectRef)
  }
}
