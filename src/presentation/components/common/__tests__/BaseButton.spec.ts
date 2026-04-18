import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import BaseButton from '../BaseButton.vue'

describe('BaseButton Component', () => {
  it('should render slot content', () => {
    const { getByText } = render(BaseButton, {
      slots: { default: 'Click me' }
    })
    expect(getByText('Click me')).toBeInTheDocument()
  })

  it('should apply correct variant class', () => {
    const { container } = render(BaseButton, {
      props: { variant: 'danger' }
    })
    const button = container.querySelector('button')
    expect(button).toHaveClass('base-btn--danger')
  })

  it('should apply correct size class', () => {
    const { container } = render(BaseButton, {
      props: { size: 'lg' }
    })
    const button = container.querySelector('button')
    expect(button).toHaveClass('base-btn--lg')
  })

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(BaseButton, {
      props: { disabled: true }
    })
    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-disabled', 'true')
  })

  it('should show spinner and be disabled when loading prop is true', () => {
    const { container, getByRole } = render(BaseButton, {
      props: { loading: true }
    })
    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(container.querySelector('.base-btn__spinner')).toBeInTheDocument()
  })

  it('should emit click event when clicked', async () => {
    const { getByRole, emitted } = render(BaseButton, {
      slots: { default: 'Click' }
    })
    await fireEvent.click(getByRole('button'))
    expect(emitted()).toHaveProperty('click')
  })

  it('should NOT emit click event when disabled', async () => {
    const { getByRole, emitted } = render(BaseButton, {
      props: { disabled: true },
      slots: { default: 'Click' }
    })
    await fireEvent.click(getByRole('button'))
    expect(emitted().click).toBeUndefined()
  })

  it('should NOT emit click event when loading', async () => {
    const { getByRole, emitted } = render(BaseButton, {
      props: { loading: true },
      slots: { default: 'Click' }
    })
    await fireEvent.click(getByRole('button'))
    expect(emitted().click).toBeUndefined()
  })
})
