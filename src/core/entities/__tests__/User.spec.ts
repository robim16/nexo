import { describe, it, expect } from 'vitest'
import { User } from '../User'
import { createTestUser } from '@/__tests__/utils/mock-data'

describe('User Entity', () => {
  it('should update profile correctly', () => {
    const user = createTestUser()
    user.updateProfile('New Name', 'New Bio')

    expect(user.displayName.value).toBe('New Name')
    expect(user.bio.value).toBe('New Bio')
  })

  it('should increment following count', () => {
    const user = createTestUser({ followingCount: 5 })
    user.follow()
    expect(user.followingCount).toBe(6)
  })

  it('should decrement following count but not below 0', () => {
    const user = createTestUser({ followingCount: 1 })
    user.unfollow()
    expect(user.followingCount).toBe(0)
    user.unfollow()
    expect(user.followingCount).toBe(0)
  })

  it('should increment followers count', () => {
    const user = createTestUser({ followersCount: 10 })
    user.incrementFollowers()
    expect(user.followersCount).toBe(11)
  })

  it('should decrement followers count but not below 0', () => {
    const user = createTestUser({ followersCount: 1 })
    user.decrementFollowers()
    expect(user.followersCount).toBe(0)
    user.decrementFollowers()
    expect(user.followersCount).toBe(0)
  })

  it('should verify user', () => {
    const user = createTestUser({ isVerified: false })
    user.verify()
    expect(user.isVerified).toBe(true)
  })

  it('should deactivate and activate user', () => {
    const user = createTestUser({ isActive: true })
    user.deactivate()
    expect(user.isActive).toBe(false)
    user.activate()
    expect(user.isActive).toBe(true)
  })

  it('should determine if user can post', () => {
    const activeUser = createTestUser({ isActive: true })
    const inactiveUser = createTestUser({ isActive: false })

    expect(activeUser.canPost()).toBe(true)
    expect(inactiveUser.canPost()).toBe(false)
  })

  it('toPlainObject should return a valid plain object', () => {
    const user = createTestUser({ displayName: 'John Doe' })
    const plain = user.toPlainObject()

    expect(plain.displayName).toBe('John Doe')
    expect(typeof plain.id).toBe('string')
  })
})
