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

  it('renders staff transition controls in TicketWorkflow when userRole is IT_STAFF', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/api/tickets/1')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 1,
            ticketNumber: 'TKT-2026-000001',
            summary: 'Broken Keyboard Key',
            description: 'The Enter key is stuck.',
            status: 'IN_PROGRESS',
            currentStatus: 'IN_PROGRESS',
            requestedPriority: 'MEDIUM',
            createdAt: new Date().toISOString(),
            updatedAt: '2026-10-30T10:00:00.000Z',
            category: { name: 'Hardware' },
            relatedSystem: { name: 'Corporate Laptop' },
            requester: { name: 'Jennifer Anderson' },
            attachments: [],
          }),
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(
      <TicketDetail
        ticketId={1}
        currentRequester={{ id: 99, name: 'Michael Brown', role: 'IT_STAFF' }}
        currentUserRole="IT_STAFF"
        onBack={vi.fn()}
      />
    )

    await waitFor(() => {
      expect(screen.getByTestId('status-transition-select')).toBeInTheDocument()
      expect(screen.getByTestId('staff-workflow-section')).toBeInTheDocument()
    })
  })
})
