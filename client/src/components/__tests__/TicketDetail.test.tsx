import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TicketDetail } from '../TicketDetail'

describe('TicketDetail Component Unit Tests (FR-06, FR-07, FR-08, FR-09)', () => {
  const mockRequester = { id: 1, name: 'Jennifer Anderson' }

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders ticket details in read-only mode with attachments', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/tickets/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 1,
            ticketNumber: 'TKT-2026-000001',
            summary: 'Broken Keyboard Key',
            description: 'The Enter key is stuck.',
            status: 'NEW',
            requestedPriority: 'MEDIUM',
            createdAt: new Date().toISOString(),
            category: { name: 'Hardware' },
            relatedSystem: { name: 'Corporate Laptop' },
            requester: { name: 'Jennifer Anderson' },
            attachments: [
              {
                id: 1,
                fileName: 'photo.jpg',
                fileSize: 204800,
                fileType: 'image/jpeg',
                filePath: '/uploads/photo.jpg',
                createdAt: new Date().toISOString(),
                isDeleted: false,
              },
            ],
          }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(<TicketDetail ticketId={1} currentRequester={mockRequester} onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText(/TKT-2026-000001: Broken Keyboard Key/i)).toBeInTheDocument()
      expect(screen.getByText(/The Enter key is stuck./i)).toBeInTheDocument()
      expect(screen.getByText('photo.jpg')).toBeInTheDocument()
    })
  })

  it('renders 403 Forbidden state when ticket belongs to another requester', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/tickets/2')) {
        return Promise.resolve({
          status: 403,
          ok: false,
          json: async () => ({ error: 'Forbidden' }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(<TicketDetail ticketId={2} currentRequester={mockRequester} onBack={vi.fn()} />)

    await waitFor(() => {
      expect(screen.getByText(/403 - Forbidden Access/i)).toBeInTheDocument()
    })
  })
})
