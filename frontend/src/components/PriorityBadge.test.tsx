import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PriorityBadge } from './PriorityBadge'

describe('PriorityBadge', () => {
  it('renders the PT-BR label for a priority', () => {
    render(<PriorityBadge priority="Urgent" />)
    expect(screen.getByText('● Urgente')).toBeInTheDocument()
  })

  it('renders the Low priority label', () => {
    render(<PriorityBadge priority="Low" />)
    expect(screen.getByText('● Baixa')).toBeInTheDocument()
  })
})
