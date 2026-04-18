import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import BaseInput from '../BaseInput.vue'

describe('BaseInput Component', () => {
  it('should render label correctly', () => {
    const { getByText } = render(BaseInput, {
      props: { label: 'Username' }
    })
    expect(getByText('Username')).toBeInTheDocument()
  })

  it('should emit update:modelValue on input', async () => {
    const { getByRole, emitted } = render(BaseInput, {
      props: { modelValue: '' }
    })
    const input = getByRole('textbox')
    await fireEvent.update(input, 'new value')
    
    expect(emitted()).toHaveProperty('update:modelValue')
    expect(emitted()['update:modelValue'][0]).toEqual(['new value'])
  })

  it('should show error message and have error class', () => {
    const { getByText, container } = render(BaseInput, {
      props: { error: 'Invalid field' }
    })
    expect(getByText('Invalid field')).toBeInTheDocument()
    expect(container.querySelector('.base-input__field--error')).toBeInTheDocument()
  })

  it('should toggle password visibility when clicking eye icon', async () => {
    const { getByLabelText, container } = render(BaseInput, {
      props: { type: 'password', modelValue: '123456' }
    })
    
    const input = container.querySelector('input')
    expect(input).toHaveAttribute('type', 'password')
    
    const toggleBtn = getByLabelText('Mostrar contraseña')
    await fireEvent.click(toggleBtn)
    
    expect(input).toHaveAttribute('type', 'text')
    expect(getByLabelText('Ocultar contraseña')).toBeInTheDocument()
  })

  it('should show character counter if maxLength is provided', () => {
    const { getByText } = render(BaseInput, {
      props: { modelValue: 'abc', maxLength: 10 }
    })
    expect(getByText('3/10')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    const { getByRole } = render(BaseInput, {
      props: { disabled: true }
    })
    expect(getByRole('textbox')).toBeDisabled()
  })
})
