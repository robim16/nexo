import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CommentPlainObject } from '../../core/entities/Comment'
import type { GetCommentsUseCase } from '../../core/use-cases/posts/GetCommentsUseCase'
import type { AddCommentUseCase } from '../../core/use-cases/posts/AddCommentUseCase'
import { container } from '../../dependency-injection'
import { useAuthStore } from './auth.store'
import { usePostsStore } from './posts.store'

export const useCommentsStore = defineStore('comments', () => {
  const authStore = useAuthStore()
  const postsStore = usePostsStore()

  // --- Estado ---
  const commentsByPost = ref<Record<string, CommentPlainObject[]>>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // --- Acciones ---

  /**
   * Carga los comentarios de un post.
   */
  async function fetchComments(postId: string) {
    loading.value = true
    error.value = null

    try {
      const useCase = container.get<GetCommentsUseCase>('GetCommentsUseCase')
      const result = await useCase.execute({ postId })

      commentsByPost.value[postId] = result.comments.map((c) => c.toPlainObject())
    } catch (err: any) {
      error.value = err.message || 'Error al cargar los comentarios'
    } finally {
      loading.value = false
    }
  }

  /**
   * Agrega un comentario a un post.
   */
  async function addComment(postId: string, content: string) {
    const userId = authStore.currentUserId
    if (!userId) throw new Error('Usuario no autenticado')

    const useCase = container.get<AddCommentUseCase>('AddCommentUseCase')

    try {
      const result = await useCase.execute({ postId, userId, content })
      const plainComment = result.comment.toPlainObject()

      // Actualizar estado local
      if (!commentsByPost.value[postId]) {
        commentsByPost.value[postId] = []
      }
      commentsByPost.value[postId].push(plainComment)

      // Actualizar contador en el post store
      postsStore.incrementCommentsCount(postId)

      return plainComment
    } catch (err: any) {
      error.value = err.message || 'Error al agregar el comentario'
      throw err
    }
  }

  return {
    commentsByPost,
    loading,
    error,
    fetchComments,
    addComment
  }
})
