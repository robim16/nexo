import { describe, it, expect } from 'vitest'
import { Post } from '../Post'
import { UserId } from '../../value-objects/UserId'
import { PostContent } from '../../value-objects/PostContent'
import { createTestPost } from '@/__tests__/utils/mock-data'

import { PostVisibility } from '../../value-objects/PostVisibility'

describe('Post Entity', () => {
  it('should allow liking a post', () => {
    const post = createTestPost()
    const userId = UserId.generate()
    
    post.like(userId)
    
    expect(post.likesCount).toBe(1)
    expect(post.likes).toContain(userId.value)
  })

  it('should throw error if liking twice', () => {
    const userId = UserId.generate()
    const post = createTestPost({ likes: [userId.value], likesCount: 1 })
    
    expect(() => post.like(userId)).toThrow('Ya has dado like')
  })

  it('should allow unliking a post', () => {
    const userId = UserId.generate()
    const post = createTestPost({ likes: [userId.value], likesCount: 1 })
    
    post.unlike(userId)
    
    expect(post.likesCount).toBe(0)
    expect(post.likes).not.toContain(userId.value)
  })

  it('should throw error if unliking without previous like', () => {
    const userId = UserId.generate()
    const post = createTestPost()
    
    expect(() => post.unlike(userId)).toThrow('No has dado like')
  })

  it('should allow editing by author within window', () => {
    const authorIdStr = 'author-123'
    const authorId = UserId.reconstitute(authorIdStr)
    const post = createTestPost({ authorId: authorIdStr })
    const newContent = PostContent.create('Updated content')
    
    post.edit(newContent, authorId)
    
    expect(post.content.value).toBe('Updated content')
    expect(post.isEdited).toBe(true)
  })

  it('should throw error if editing by non-author', () => {
    const post = createTestPost({ authorId: 'author-123' })
    const nonAuthorId = UserId.generate()
    const newContent = PostContent.create('Updated content')
    
    expect(() => post.edit(newContent, nonAuthorId)).toThrow('No tienes permiso')
  })

  it('should throw error if editing after window expired', () => {
    const authorIdStr = 'author-123'
    const authorId = UserId.reconstitute(authorIdStr)
    // Hace 25 horas
    const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
    const post = createTestPost({ authorId: authorIdStr, createdAt: oldDate })
    const newContent = PostContent.create('Updated content')
    
    expect(() => post.edit(newContent, authorId)).toThrow('Las publicaciones solo pueden editarse dentro de las primeras 24 horas')
  })

  it('should allow changing visibility by author', () => {
    const authorIdStr = 'author-123'
    const authorId = UserId.reconstitute(authorIdStr)
    const post = createTestPost({ authorId: authorIdStr })
    
    post.changeVisibility(PostVisibility.private(), authorId)
    
    expect(post.visibility.value).toBe('private')
  })
})
