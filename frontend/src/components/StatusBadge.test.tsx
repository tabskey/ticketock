import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from './StatusBadge'

describe('StatusBadge', () => {
  it('renders the PT-BR label for each status', () => {
    render(<StatusBadge status="In Progress" />)
    expect(screen.getByText('Em andamento')).toBeInTheDocument()
  })

  it('renders the Open status label', () => {
    render(<StatusBadge status="Open" />)
    expect(screen.getByText('Aberto')).toBeInTheDocument()
  })
})
