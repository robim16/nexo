<template>
  <div class="saved-posts-page">
    <header class="page-header">
      <h1 class="page-title">Publicaciones Guardadas</h1>
      <p class="page-subtitle">Contenido que has marcado para ver más tarde</p>
    </header>

    <div class="content-container">
      <PostList
        :items="posts"
        :loading="loading"
        @like="handleLike"
        @unlike="handleUnlike"
        @comment="handleComment"
        @share="handleShare"
        @save="handleSave"
        @unsave="handleUnsave"
      />
    </div>

    <CommentDialog
      :is-open="isCommentDialogOpen"
      :post-id="activePostId"
      :loading="isCommenting"
      @close="isCommentDialogOpen = false"
      @submit="submitComment"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import PostList from '@/presentation/components/feed/PostList.vue'
import CommentDialog from '@/presentation/components/feed/CommentDialog.vue'
import { usePostsStore } from '@/application/stores/posts.store'
import { useCommentsStore } from '@/application/stores/comments.store'

const postsStore = usePostsStore()
const commentsStore = useCommentsStore()

const posts = computed(() => {
  return postsStore.savedFeed.map((post) => ({
    ...post,
    isSaved: true // On this page, they are all saved
  }))
})

const loading = computed(() => postsStore.loading)
const isCommentDialogOpen = ref(false)
const isCommenting = ref(false)
const activePostId = ref<string | null>(null)

onMounted(() => {
  postsStore.fetchSavedPosts()
})

const handleLike = (id: string) => {
  postsStore.toggleLike(id)
}

const handleUnlike = (id: string) => {
  postsStore.toggleLike(id)
}

const handleSave = (id: string) => {
  postsStore.toggleSave(id)
}

const handleUnsave = (id: string) => {
  postsStore.toggleSave(id)
}

const handleComment = (id: string) => {
  activePostId.value = id
  isCommentDialogOpen.value = true
}

const handleShare = async (id: string) => {
  const post = postsStore.savedFeed.find((p) => p.id === id)
  if (!post) return
  const url = `${window.location.origin}/post/${id}`
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Post de ${post.authorName || 'Nexo'}`,
        text: post.content,
        url
      })
      await postsStore.sharePost(id)
    } catch (err) {
      console.error('Error sharing', err)
    }
  } else {
    try {
      await navigator.clipboard.writeText(url)
      alert('Enlace copiado al portapapeles')
      await postsStore.sharePost(id)
    } catch (err) {
      console.error('Error copying to clipboard', err)
    }
  }
}

const submitComment = async (content: string) => {
  if (!activePostId.value) return

  isCommenting.value = true
  try {
    await commentsStore.addComment(activePostId.value, content)
    isCommentDialogOpen.value = false
  } catch (err) {
    console.error('Error submitting comment', err)
  } finally {
    isCommenting.value = false
  }
}
</script>

<style scoped>
.saved-posts-page {
  padding: var(--space-4);
  max-width: 680px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.page-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.page-subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.content-container {
  min-height: 400px;
}
</style>
