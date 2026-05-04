import { User } from '@/core/entities/User'
import { Post } from '@/core/entities/Post'
import { Comment } from '@/core/entities/Comment'

/**
 * Generador de IDs únicos para tests
 */
let counter = 0
const nextId = (prefix: string = 'id') =>
  `${prefix}-${++counter}-${Math.random().toString(36).substring(7)}`

/**
 * Fábrica para la entidad User
 */
export function createTestUser(overrides: any = {}): User {
  const now = new Date().toISOString()
  return User.reconstitute({
    id: nextId('user'),
    email: `test-${counter}@nexo.com`,
    displayName: 'Test User',
    bio: 'I am a test user',
    avatar: null,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: now,
    updatedAt: now,
    isVerified: false,
    isActive: true,
    ...overrides
  })
}

/**
 * Fábrica para la entidad Post
 */
export function createTestPost(overrides: any = {}): Post {
  const now = new Date().toISOString()
  return Post.reconstitute({
    id: nextId('post'),
    authorId: nextId('user'),
    content: 'Default test content',
    images: [],
    likes: [],
    likesCount: 0,
    commentsCount: 0,
    sharesCount: 0,
    visibility: 'public',
    createdAt: now,
    updatedAt: now,
    isEdited: false,
    ...overrides
  })
}

/**
 * Fábrica para la entidad Comment
 */
export function createTestComment(overrides: any = {}): Comment {
  const now = new Date().toISOString()
  return Comment.reconstitute({
    id: nextId('comment'),
    postId: nextId('post'),
    authorId: nextId('user'),
    content: 'Default test comment',
    likes: [],
    likesCount: 0,
    createdAt: now,
    updatedAt: now,
    isEdited: false,
    ...overrides
  })
}
