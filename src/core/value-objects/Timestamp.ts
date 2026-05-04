/**
 * Value Object: Timestamp
 * Wrapper inmutable sobre Date.
 * Provee helpers de formato relativo (e.g., "hace 5 minutos") sin dependencias externas.
 */
export class Timestamp {
  private constructor(public readonly value: Date) {}

  static now(): Timestamp {
    return new Timestamp(new Date())
  }

  static fromDate(date: Date): Timestamp {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error('Fecha inválida para crear Timestamp')
    }
    return new Timestamp(new Date(date.getTime()))
  }

  static fromISO(isoString: string): Timestamp {
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      throw new Error(`ISO string inválido: "${isoString}"`)
    }
    return new Timestamp(date)
  }

  static reconstitute(value: Date | string): Timestamp {
    if (typeof value === 'string') {
      return Timestamp.fromISO(value)
    }
    return new Timestamp(new Date(value.getTime()))
  }

  /** Diferencia en milisegundos respecto a ahora */
  get millisSinceNow(): number {
    return Date.now() - this.value.getTime()
  }

  /** Formato relativo en español (ej: "hace 3 horas") */
  toRelative(): string {
    const diff = this.millisSinceNow
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)

    if (seconds < 60) return 'ahora mismo'
    if (minutes < 60) return `hace ${minutes}m`
    if (hours < 24) return `hace ${hours}h`
    if (days < 7) return `hace ${days}d`
    if (weeks < 4) return `hace ${weeks}sem`
    if (months < 12) return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`
  }

  /** Formato corto para UI: "15 abr 2026" */
  toShortLabel(): string {
    return this.value.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  toISO(): string {
    return this.value.toISOString()
  }

  isBefore(other: Timestamp): boolean {
    return this.value.getTime() < other.value.getTime()
  }

  isAfter(other: Timestamp): boolean {
    return this.value.getTime() > other.value.getTime()
  }

  equals(other: Timestamp): boolean {
    return this.value.getTime() === other.value.getTime()
  }

  toString(): string {
    return this.toISO()
  }
}
