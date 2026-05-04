import { defineStore } from 'pinia'
import { searchService } from '../services/SearchService'
import type { UserPlainObject } from '../../core/entities/User'
import type { PostPlainObject } from '../../core/entities/Post'

export const useSearchStore = defineStore('search', {
  state: () => ({
    query: '',
    userResults: [] as UserPlainObject[],
    postResults: [] as PostPlainObject[],
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    async performSearch(query: string) {
      if (!query || query.trim().length < 2) {
        this.clearResults()
        this.query = query
        return
      }

      this.query = query
      this.isLoading = true
      this.error = null

      try {
        const [users, posts] = await Promise.all([
          searchService.searchUsers(query),
          searchService.searchPosts(query)
        ])

        this.userResults = users
        this.postResults = posts
      } catch (err: any) {
        this.error = err.message || 'Error al realizar la búsqueda'
        console.error('Search error:', err)
      } finally {
        this.isLoading = false
      }
    },

    clearResults() {
      this.userResults = []
      this.postResults = []
      this.query = ''
    }
  }
})
