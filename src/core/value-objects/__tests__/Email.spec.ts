import { describe, it, expect } from 'vitest'
import { Email } from '../Email'

describe('Email Value Object', () => {
  it('should create a valid email', () => {
    const emailStr = 'test@example.com'
    const email = Email.create(emailStr)
    expect(email.value).toBe(emailStr)
  })

  it('should throw error for invalid email format', () => {
    const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test@example']
    invalidEmails.forEach((email) => {
      expect(() => Email.create(email)).toThrow()
    })
  })

  it('should normalize email to lowercase', () => {
    const email = Email.create('TEST@EXAMPLE.COM')
    expect(email.value).toBe('test@example.com')
  })

  it('should compare equality correctly', () => {
    const email1 = Email.create('a@b.com')
    const email2 = Email.create('a@b.com')
    const email3 = Email.create('x@y.com')

    expect(email1.equals(email2)).toBe(true)
    expect(email1.equals(email3)).toBe(false)
  })
})
