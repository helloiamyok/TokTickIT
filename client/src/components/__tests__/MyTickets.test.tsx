import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MyTickets } from '../MyTickets'

describe('MyTickets Component Unit Tests (FR-04, FR-05, FR-09)', () => {
  const mockRequester = { id: 1, name: 'Jennifer Anderson' }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders search, filter controls and populated table data', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/tickets')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [
              {
                id: 1,
                ticketNumber: 'TKT-2026-000001',
                summary: 'VPN Issue',
                status: 'NEW',
                requestedPriority: 'HIGH',
                createdAt: new Date().toISOString(),
                category: { name: 'Network' },
              },
            ],
            pagination: { page: 1, limit: 5, totalItems: 1, totalPages: 1 },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(<MyTickets currentRequester={mockRequester} />)

    expect(screen.getByRole('heading', { name: /My Tickets/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Ticket No or Summary.../i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText('TKT-2026-000001')[0]).toBeInTheDocument()
      expect(screen.getAllByText('VPN Issue')[0]).toBeInTheDocument()
    })
  })

  it('renders empty state when requester has no tickets', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/tickets')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: [],
            pagination: { page: 1, limit: 5, totalItems: 0, totalPages: 1 },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(<MyTickets currentRequester={mockRequester} />)

    await waitFor(() => {
      expect(screen.getByText(/No Tickets Found/i)).toBeInTheDocument()
    })
  })
})
