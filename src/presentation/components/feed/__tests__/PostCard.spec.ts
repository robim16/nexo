import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import PostCard from '../PostCard.vue'

describe('PostCard Component', () => {
  const mockPost = {
    id: 'post-1',
    authorId: 'user-1',
    authorName: 'Jane Doe',
    authorAvatar: 'https://avatar.url',
    content: 'Hello World!',
    createdAt: new Date().getTime(),
    likes: [],
    likesCount: 10,
    commentsCount: 5,
    isLiked: false
  }

  it('should render post information correctly', () => {
    const { getByText } = render(PostCard, {
      props: { post: mockPost },
      global: {
        stubs: { BaseAvatar: true }
      }
    })

    expect(getByText('Jane Doe')).toBeInTheDocument()
    expect(getByText('Hello World!')).toBeInTheDocument()
    expect(getByText('10')).toBeInTheDocument()
    expect(getByText('5')).toBeInTheDocument()
  })

  it('should emit like event when unliked and heart is clicked', async () => {
    const { container, emitted } = render(PostCard, {
      props: { post: mockPost },
      global: {
        stubs: { BaseAvatar: true }
      }
    })

    const likeBtn = container.querySelector('.action-btn--like')!
    await fireEvent.click(likeBtn)

    expect(emitted()).toHaveProperty('like')
    expect(emitted().like[0]).toEqual(['post-1'])
  })

  it('should emit unlike event when liked and heart is clicked', async () => {
    const likedPost = { ...mockPost, isLiked: true }
    const { container, emitted } = render(PostCard, {
      props: { post: likedPost },
      global: {
        stubs: { BaseAvatar: true }
      }
    })

    const likeBtn = container.querySelector('.action-btn--like')!
    await fireEvent.click(likeBtn)

    expect(emitted()).toHaveProperty('unlike')
    expect(emitted().unlike[0]).toEqual(['post-1'])
  })

  it('should emit comment event when comment button is clicked', async () => {
    const { container, emitted } = render(PostCard, {
      props: { post: mockPost },
      global: {
        stubs: { BaseAvatar: true }
      }
    })

    const commentBtn = container.querySelector('.action-btn--comment')!
    await fireEvent.click(commentBtn)

    expect(emitted()).toHaveProperty('comment')
    expect(emitted().comment[0]).toEqual(['post-1'])
  })

  it('should emit share event when share button is clicked', async () => {
    const { container, emitted } = render(PostCard, {
      props: { post: mockPost },
      global: {
        stubs: { BaseAvatar: true }
      }
    })

    const shareBtn = container.querySelector('.action-btn--share')!
    await fireEvent.click(shareBtn)

    expect(emitted()).toHaveProperty('share')
    expect(emitted().share[0]).toEqual(['post-1'])
  })
})
