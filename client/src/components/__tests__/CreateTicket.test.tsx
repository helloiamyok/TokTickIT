import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateTicket } from '../CreateTicket'

describe('CreateTicket Component Unit Tests (FR-02, BR-01, BR-02)', () => {
  const mockRequester = { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com' }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders form with category, system, priority, summary and description', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Hardware' }],
        })
      }
      if (url.includes('/related-systems')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Corporate Laptop' }],
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(<CreateTicket currentRequester={mockRequester} />)

    expect(screen.getByPlaceholderText(/Brief summary of the issue.../i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Provide details about the issue.../i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Submit Ticket/i })).toBeInTheDocument()
  })

  it('validates required fields on submit without input', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() => Promise.resolve({ ok: true, json: async () => [] }))

    render(<CreateTicket currentRequester={mockRequester} />)

    const submitBtn = screen.getByRole('button', { name: /Submit Ticket/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Ticket Summary is required/i)).toBeInTheDocument()
    })
  })
})
