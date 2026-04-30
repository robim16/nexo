/**
 * CloudinaryStorageService
 * Implementación de IStorageService usando Cloudinary Upload API (unsigned).
 *
 * Sube imágenes directamente desde el browser sin exponer credenciales de servidor.
 * Requiere configurar un Upload Preset de tipo "Unsigned" en el dashboard de Cloudinary.
 *
 * Variables de entorno necesarias:
 *   VITE_CLOUDINARY_CLOUD_NAME    → nombre del cloud (ej: "mi-app")
 *   VITE_CLOUDINARY_UPLOAD_PRESET → nombre del upload preset unsigned (ej: "nexo_unsigned")
 */

import type {
  IStorageService,
  UploadOptions,
  UploadResult,
} from '@/core/ports/services/IStorageService'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn(
    '[CloudinaryStorageService] Faltan variables de entorno: ' +
      'VITE_CLOUDINARY_CLOUD_NAME y/o VITE_CLOUDINARY_UPLOAD_PRESET. ' +
      'Los uploads de imágenes no funcionarán.'
  )
}

/**
 * Genera un public_id único combinando el path lógico y un timestamp.
 * Cloudinary usa el public_id como identificador permanente del asset.
 *
 * Ejemplo: "posts/uid-123/" → "posts/uid-123/1714520400000"
 */
function buildPublicId(path: string, fileName: string): string {
  const base = path.endsWith('/') ? path : `${path}/`
  const nameStem = fileName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_')
  return `${base}${nameStem}_${Date.now()}`
}

/**
 * Sube un File a Cloudinary mediante XMLHttpRequest para soportar progreso.
 */
function uploadToCloudinary(
  file: File,
  publicId: string,
  options?: UploadOptions
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('public_id', publicId)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url, true)

    // Progreso del upload
    if (options?.onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          options.onProgress!(percent)
        }
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve({
            downloadUrl: response.secure_url as string,
            storagePath: response.public_id as string,
            sizeBytes: response.bytes as number,
            contentType: file.type,
          })
        } catch {
          reject(new Error('Error al parsear la respuesta de Cloudinary'))
        }
      } else {
        let errorMessage = `Upload fallido con status ${xhr.status}`
        try {
          const errBody = JSON.parse(xhr.responseText)
          errorMessage = errBody?.error?.message || errorMessage
        } catch {
          // ignorar
        }
        reject(new Error(errorMessage))
      }
    }

    xhr.onerror = () => reject(new Error('Error de red al subir imagen a Cloudinary'))
    xhr.onabort = () => reject(new Error('Upload cancelado'))

    xhr.send(formData)
  })
}

export class CloudinaryStorageService implements IStorageService {
  /**
   * Sube una imagen a Cloudinary.
   * @param file    Archivo de imagen a subir
   * @param path    Carpeta lógica destino (ej: "posts/uid-123/" o "avatars/")
   * @param options Opciones de progreso
   */
  async uploadImage(file: File, path: string, options?: UploadOptions): Promise<UploadResult> {
    const publicId = buildPublicId(path, file.name)
    return uploadToCloudinary(file, publicId, options)
  }

  /**
   * Alias de uploadImage (Cloudinary maneja todos los tipos de archivo igual).
   */
  async uploadFile(file: File, path: string, options?: UploadOptions): Promise<UploadResult> {
    return this.uploadImage(file, path, options)
  }

  /**
   * Eliminar un archivo en Cloudinary requiere una firma del servidor (api_secret).
   * En esta implementación solo se registra un warning, dado que el app es client-only.
   *
   * Para habilitar eliminación real, crear una Cloud Function / Netlify Function
   * que firme y ejecute la Destroy API con las credenciales del servidor.
   */
  async deleteFile(urlOrPath: string): Promise<void> {
    console.warn(
      '[CloudinaryStorageService] deleteFile no está implementado en modo browser-only. ' +
        `Archivo a eliminar: ${urlOrPath}. ` +
        'Implementa un endpoint de servidor para borrar assets via Cloudinary Admin API.'
    )
  }

  /**
   * Elimina múltiples archivos (no-op en cliente).
   */
  async deleteFiles(urlsOrPaths: string[]): Promise<void> {
    for (const path of urlsOrPaths) {
      await this.deleteFile(path)
    }
  }

  /**
   * En Cloudinary el storagePath (public_id) no es una URL directa.
   * La URL pública ya se devuelve en uploadImage como `downloadUrl`.
   * Este método construye la URL de descarga a partir del public_id.
   */
  async getDownloadUrl(storagePath: string): Promise<string> {
    // Si ya es una URL completa, devolverla directamente
    if (storagePath.startsWith('http')) return storagePath
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${storagePath}`
  }
}
