import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from './Modal'

describe('Modal', () => {
  afterEach(() => {
    document.body.style.overflow = ''
  })

  it('renders children inside an accessible dialog', () => {
    render(
      <Modal onClose={vi.fn()} labelledBy="title">
        <h2 id="title">Resolve ticket</h2>
      </Modal>,
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-labelledby', 'title')
    expect(screen.getByText('Resolve ticket')).toBeInTheDocument()
  })

  it('locks body scroll while open', () => {
    const { unmount } = render(
      <Modal onClose={vi.fn()} labelledBy="title">
        content
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('calls onClose when clicking outside the panel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} labelledBy="title">
        content
      </Modal>,
    )
    await user.click(screen.getByRole('dialog').parentElement as HTMLElement)
    expect(onClose).toHaveBeenCalled()
  })

  it('does not call onClose when clicking inside the panel', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} labelledBy="title">
        <span>content</span>
      </Modal>,
    )
    await user.click(screen.getByText('content'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal onClose={onClose} labelledBy="title">
        content
      </Modal>,
    )
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
