import { z } from 'zod'

/**
 * PostValidator
 * Esquemas de validación para publicaciones usando Zod.
 */
export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido no puede estar vacío')
    .max(1000, 'El contenido es muy largo'),
  visibility: z.enum(['public', 'private', 'followers']).default('public'),
  images: z.array(z.instanceof(File)).max(4, 'Máximo 4 imágenes').optional()
})

export const UpdatePostSchema = CreatePostSchema.partial()

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>
