<template>
  <div class="profile-page">
    <header class="page-header">
      <div class="header-content">
        <BaseButton variant="glass" size="sm" class="back-btn" @click="$router.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </BaseButton>
        <div class="header-info">
          <h1 class="page-title">{{ profileUser?.displayName || 'Profile' }}</h1>
          <span class="post-count">{{ stats.posts }} posts</span>
        </div>
      </div>
    </header>

    <div v-if="loading" class="loading-container">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="profileUser" class="profile-container">
      <div class="profile-top-section">
        <ProfileHeader
          :user="profileUser"
          :isOwnProfile="isOwnProfile"
          :isFollowing="usersStore.isFollowingProfile"
        />
        <div class="stats-wrapper">
          <ProfileStats :stats="stats" @click-stat="handleStatClick" />
        </div>
      </div>

      <div class="profile-content">
        <div class="profile-tabs glass">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <span class="tab-label">{{ tab.label }}</span>
            <div class="tab-indicator"></div>
          </button>
        </div>

        <div class="feed-wrapper">
          <transition name="fade-slide" mode="out-in">
            <div v-if="activeTab === 'posts'">
              <PostList
                :items="postsStore.feed"
                :loading="postsStore.loading"
                @like="postsStore.toggleLike"
                @comment="handleComment"
                @share="handleShare"
              />
            </div>

            <div v-else-if="activeTab === 'followers'" class="user-list">
              <UserListItem v-for="user in usersStore.followers" :key="user.id" :user="user" />
              <div v-if="usersStore.followers.length === 0" class="empty-state">
                <p>No followers yet.</p>
              </div>
            </div>

            <div v-else-if="activeTab === 'following'" class="user-list">
              <UserListItem v-for="user in usersStore.following" :key="user.id" :user="user" />
              <div v-if="usersStore.following.length === 0" class="empty-state">
                <p>Not following anyone yet.</p>
              </div>
            </div>

            <div v-else class="empty-state">
              <svg
                class="empty-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p>Nothing to see here yet.</p>
            </div>
          </transition>
          <CommentDialog
            :is-open="isCommentDialogOpen"
            :post-id="activePostId"
            :loading="isCommenting"
            @close="isCommentDialogOpen = false"
            @submit="submitComment"
          />
        </div>
      </div>
    </div>

    <div v-else class="error-container">
      <p>User not found or error loading profile.</p>
      <BaseButton @click="$router.push('/')">Go Home</BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsStore } from '@/application/stores/posts.store'
import { useAuthStore } from '@/application/stores/auth.store'
import { useUsersStore } from '@/application/stores/users.store'
import { useCommentsStore } from '@/application/stores/comments.store'
import ProfileHeader from '@/presentation/components/profile/ProfileHeader.vue'
import ProfileStats from '@/presentation/components/profile/ProfileStats.vue'
import UserListItem from '@/presentation/components/profile/UserListItem.vue'
import PostList from '@/presentation/components/feed/PostList.vue'
import CommentDialog from '@/presentation/components/feed/CommentDialog.vue'
import BaseButton from '@/presentation/components/common/BaseButton.vue'
import LoadingSpinner from '@/presentation/components/common/LoadingSpinner.vue'

const route = useRoute()
const postsStore = usePostsStore()
const authStore = useAuthStore()
const usersStore = useUsersStore()
const commentsStore = useCommentsStore()

const activeTab = ref('posts')
const loading = ref(true)

const isCommentDialogOpen = ref(false)
const isCommenting = ref(false)
const activePostId = ref<string | null>(null)

const userId = computed(() => (route.params.id as string) || authStore.currentUserId)

const tabs = [
  { id: 'posts', label: 'Posts' },
  { id: 'followers', label: 'Followers' },
  { id: 'following', label: 'Following' },
  { id: 'likes', label: 'Likes' }
]

const profileUser = computed(() => {
  if (!userId.value) return null
  return (
    usersStore.profiles[userId.value] ||
    (userId.value === authStore.user?.id ? authStore.user : null)
  )
})

const stats = computed(() => ({
  posts: profileUser.value?.postsCount || 0,
  followers: profileUser.value?.followersCount || 0,
  following: profileUser.value?.followingCount || 0
}))

const isOwnProfile = computed(() => authStore.user?.id === userId.value)

const handleStatClick = (statId: string) => {
  if (statId === 'followers' || statId === 'following' || statId === 'posts') {
    activeTab.value = statId
  }
}

const handleComment = (id: string) => {
  activePostId.value = id
  isCommentDialogOpen.value = true
}

const handleShare = async (id: string) => {
  const post = postsStore.feed.find((p) => p.id === id)
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

onMounted(() => {
  loadProfileData()
})

onUnmounted(() => {
  if (userId.value) {
    usersStore.unsubscribeFromProfile(userId.value)
  }
  postsStore.unsubscribe()
})

const loadProfileData = async () => {
  if (!userId.value) {
    loading.value = false
    return
  }

  loading.value = true
  try {
    // 1. Cargar perfil inicial y suscribirse
    await usersStore.fetchProfile(userId.value)
    usersStore.subscribeToProfile(userId.value)

    // 2. Suscribirse a posts del usuario
    postsStore.subscribeToUserPosts(userId.value)

    // 3. Verificar si lo seguimos
    if (!isOwnProfile.value) {
      await usersStore.checkIsFollowing(userId.value)
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  } finally {
    loading.value = false
  }
}

// Cargar listas cuando se cambia de pestaña
watch(activeTab, (newTab) => {
  if (newTab === 'followers' && userId.value) {
    usersStore.fetchFollowers(userId.value)
  } else if (newTab === 'following' && userId.value) {
    usersStore.fetchFollowing(userId.value)
  }
})

// Recargar si cambia el ID en la ruta
watch(
  () => route.params.id,
  (newId, oldId) => {
    if (oldId) {
      usersStore.unsubscribeFromProfile(oldId as string)
    }
    activeTab.value = 'posts'
    loadProfileData()
  }
)
</script>

<style scoped>
.profile-page {
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

.header-info {
  display: flex;
  flex-direction: column;
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.post-count {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}

.profile-container {
  display: flex;
  flex-direction: column;
}

.stats-wrapper {
  padding: 0 var(--space-4);
}

.profile-tabs {
  display: flex;
  margin: var(--space-6) var(--space-4);
  border-radius: var(--radius-2xl);
  background: var(--surface-glass);
  padding: var(--space-1);
}

.tab-item {
  flex: 1;
  padding: var(--space-4);
  background: transparent;
  border: none;
  font-weight: var(--font-weight-bold);
  color: var(--text-tertiary);
  cursor: pointer;
  position: relative;
  transition: var(--transition-base);
  border-radius: var(--radius-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.tab-item:hover {
  background-color: var(--surface-glass-bright);
  color: var(--text-primary);
}

.tab-item.active {
  color: var(--color-primary);
}

.tab-indicator {
  position: absolute;
  bottom: 8px;
  width: 20px;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: var(--radius-full);
  opacity: 0;
  transform: scaleX(0.5);
  transition: var(--transition-base);
  box-shadow: 0 0 10px var(--color-primary);
}

.tab-item.active .tab-indicator {
  opacity: 1;
  transform: scaleX(1);
}

.feed-wrapper {
  padding: 0 var(--space-4) var(--space-12);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12);
  border-radius: var(--radius-3xl);
  color: var(--text-tertiary);
  text-align: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
  color: var(--text-disabled);
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

.user-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
