/**
 * IStorageService — Contrato del servicio de almacenamiento de archivos.
 * Implementado por FirebaseStorageService en infraestructura.
 */

export interface UploadOptions {
  /** Función de progreso (0–100) */
  onProgress?: (percent: number) => void
  /** Calidad para imágenes (0.0 – 1.0) */
  quality?: number
  /** Dimensión máxima en px para resize automático */
  maxDimension?: number
}

export interface UploadResult {
  /** URL pública del archivo subido */
  downloadUrl: string
  /** Ruta completa en Storage */
  storagePath: string
  /** Tamaño en bytes */
  sizeBytes: number
  /** MIME type */
  contentType: string
}

export interface IStorageService {
  /**
   * Sube un archivo de imagen.
   * @param file - Archivo a subir
   * @param path - Ruta destino en Storage (ej: "posts/user-id/")
   * @param options - Opciones de progreso y compresión
   */
  uploadImage(file: File, path: string, options?: UploadOptions): Promise<UploadResult>

  /**
   * Sube un archivo genérico.
   */
  uploadFile(file: File, path: string, options?: UploadOptions): Promise<UploadResult>

  /**
   * Elimina un archivo por su URL o ruta de Storage.
   */
  deleteFile(urlOrPath: string): Promise<void>

  /**
   * Elimina múltiples archivos en paralelo.
   */
  deleteFiles(urlsOrPaths: string[]): Promise<void>

  /**
   * Obtiene la URL de descarga para una ruta de Storage.
   */
  getDownloadUrl(storagePath: string): Promise<string>
}
