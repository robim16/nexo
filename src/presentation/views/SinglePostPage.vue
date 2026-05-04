<template>
  <div class="single-post-page">
    <header class="page-header">
      <div class="header-content">
        <BaseButton variant="glass" size="sm" class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </BaseButton>
        <h1 class="page-title">Post</h1>
      </div>
    </header>

    <div v-if="loading" class="loading-container">
      <LoadingSpinner size="lg" />
    </div>
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <BaseButton @click="$router.push('/')">Go Home</BaseButton>
    </div>
    <div v-else-if="post" class="post-container">
      <PostCard
        :post="post"
        @like="postsStore.toggleLike"
        @comment="handleComment"
        @share="handleShare"
        @save="postsStore.toggleSave"
        @unsave="postsStore.toggleSave"
      />

      <div class="comments-section">
        <h3 class="comments-title">Comments ({{ comments.length }})</h3>

        <div v-if="commentsLoading" class="comments-loading">
          <LoadingSpinner size="sm" />
        </div>
        <div v-else-if="comments.length === 0" class="empty-comments">
          <p>No comments yet. Be the first!</p>
        </div>
        <div v-else class="comments-list">
          <CommentItem v-for="comment in comments" :key="comment.id" :comment="comment" />
        </div>
      </div>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsStore } from '@/application/stores/posts.store'
import { useCommentsStore } from '@/application/stores/comments.store'
import PostCard from '@/presentation/components/feed/PostCard.vue'
import CommentItem from '@/presentation/components/feed/CommentItem.vue'
import CommentDialog from '@/presentation/components/feed/CommentDialog.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue'

const route = useRoute()
const postsStore = usePostsStore()
const commentsStore = useCommentsStore()

const isCommentDialogOpen = ref(false)
const isCommenting = ref(false)
const activePostId = ref<string | null>(null)

const postId = computed(() => route.params.id as string)
const post = computed(() => postsStore.currentPost)
const loading = computed(() => postsStore.loading && !post.value)
const error = computed(() => postsStore.error)

const comments = computed(() => commentsStore.commentsByPost[postId.value] || [])
const commentsLoading = computed(() => commentsStore.loading)

onMounted(() => {
  loadData()
})

watch(postId, () => {
  if (postId.value) loadData()
})

const loadData = async () => {
  if (postId.value) {
    await postsStore.fetchPostById(postId.value)
    await commentsStore.fetchComments(postId.value)
  }
}

const handleComment = (id: string) => {
  activePostId.value = id
  isCommentDialogOpen.value = true
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

const handleShare = async (id: string) => {
  const postToShare = postsStore.feed.find((p) => p.id === id) || postsStore.currentPost
  if (!postToShare) return

  const url = `${window.location.origin}/post/${id}`
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Post de ${postToShare.authorName || 'Nexo'}`,
        text: postToShare.content,
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
</script>

<style scoped>
.single-post-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-header {
  padding: var(--space-6) var(--space-4);
  background: rgba(10, 10, 11, 0.8);
  backdrop-filter: var(--backdrop-blur);
  -webkit-backdrop-filter: var(--backdrop-blur);
  border-bottom: 1px solid var(--surface-glass-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-content {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.back-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  gap: var(--space-6);
  text-align: center;
  color: var(--text-secondary);
}

.post-container {
  padding: var(--space-4);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.comments-section {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--surface-glass-border);
}

.comments-title {
  margin: 0 0 var(--space-4);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.comments-loading,
.empty-comments {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
  color: var(--text-tertiary);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
</style>
