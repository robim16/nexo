/**
 * Value Object: PostContent
 * Encapsula el texto de una publicación con validación de límites
 * y capacidad de extraer automáticamente hashtags y menciones.
 */
export class PostContent {
  static readonly MIN_LENGTH = 1
  static readonly MAX_LENGTH = 2000

  private static readonly HASHTAG_REGEX = /#([a-zA-ZÀ-ÿ0-9_]+)/g
  private static readonly MENTION_REGEX = /@([a-zA-Z0-9_.-]+)/g

  private constructor(
    public readonly value: string,
    public readonly hashtags: readonly string[],
    public readonly mentions: readonly string[]
  ) {}

  /**
   * Crea y valida el contenido de un post.
   * Extrae automáticamente hashtags y menciones.
   */
  static create(rawContent: string): PostContent {
    if (!rawContent || rawContent.trim().length === 0) {
      throw new Error('El contenido del post no puede estar vacío')
    }

    const trimmed = rawContent.trim()

    if (trimmed.length < PostContent.MIN_LENGTH) {
      throw new Error(
        `El contenido del post debe tener al menos ${PostContent.MIN_LENGTH} carácter`
      )
    }

    if (trimmed.length > PostContent.MAX_LENGTH) {
      throw new Error(
        `El contenido del post no puede superar ${PostContent.MAX_LENGTH} caracteres ` +
        `(actual: ${trimmed.length})`
      )
    }

    const hashtags = PostContent.extractHashtags(trimmed)
    const mentions = PostContent.extractMentions(trimmed)

    return new PostContent(trimmed, hashtags, mentions)
  }

  /** Reconstitución desde persistencia */
  static reconstitute(value: string): PostContent {
    const hashtags = PostContent.extractHashtags(value)
    const mentions = PostContent.extractMentions(value)
    return new PostContent(value, hashtags, mentions)
  }

  /** Cuántos caracteres quedan disponibles */
  get remainingChars(): number {
    return PostContent.MAX_LENGTH - this.value.length
  }

  /** Verifica si hay menciones en el contenido */
  hasMentions(): boolean {
    return this.mentions.length > 0
  }

  /** Verifica si hay hashtags en el contenido */
  hasHashtags(): boolean {
    return this.hashtags.length > 0
  }

  equals(other: PostContent): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  private static extractHashtags(text: string): string[] {
    const matches: string[] = []
    let match: RegExpExecArray | null
    const regex = new RegExp(PostContent.HASHTAG_REGEX.source, 'g')
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].toLowerCase())
    }
    // Eliminar duplicados
    return [...new Set(matches)]
  }

  private static extractMentions(text: string): string[] {
    const matches: string[] = []
    let match: RegExpExecArray | null
    const regex = new RegExp(PostContent.MENTION_REGEX.source, 'g')
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].toLowerCase())
    }
    return [...new Set(matches)]
  }
}
