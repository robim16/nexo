import { describe, it, expect } from 'vitest'
import { PostVisibility } from '../PostVisibility'

describe('PostVisibility Value Object', () => {
  it('should create public visibility', () => {
    const visibility = PostVisibility.public()
    expect(visibility.value).toBe('public')
    expect(visibility.isPublic()).toBe(true)
  })

  it('should create private visibility', () => {
    const visibility = PostVisibility.private()
    expect(visibility.value).toBe('private')
    expect(visibility.isPrivate()).toBe(true)
  })

  it('should create followers-only visibility', () => {
    const visibility = PostVisibility.followers()
    expect(visibility.value).toBe('followers')
    expect(visibility.isFollowersOnly()).toBe(true)
  })

  it('should fail for invalid visibility string', () => {
    // @ts-ignore - probando error en runtime si se salta el tipado
    expect(() => PostVisibility.create('invalid')).toThrow()
  })
})
