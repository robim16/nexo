/**
 * DomainError — Clase base abstracta para todos los errores de dominio.
 * Sin dependencias externas. Los errores de dominio representan
 * violaciones de reglas de negocio, NO errores técnicos de infraestructura.
 */
export abstract class DomainError extends Error {
  /** Código único de error legible por máquina (ej: "POST_NOT_FOUND") */
  public abstract readonly code: string

  /** Capa de dominio de origen */
  public abstract readonly domain: string

  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    // Preserva el stack trace correcto en V8 (Node/Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toJSON(): object {
    return {
      name: this.name,
      code: this.code,
      domain: this.domain,
      message: this.message,
    }
  }

  toString(): string {
    return `[${this.domain}:${this.code}] ${this.message}`
  }
}
