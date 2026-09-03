import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('Create Support Ticket Form Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders Zen Green header, title, and initial idle state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) => {
        if (url.includes('/api/requesters')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com', isActive: true },
            ],
          })
        }
        if (url.includes('/api/categories')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 1, name: 'Hardware' },
              { id: 2, name: 'Software' },
            ],
          })
        }
        if (url.includes('/api/related-systems')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 1, name: 'Corporate Laptop' },
              { id: 2, name: 'Campus Wi-Fi' },
            ],
          })
        }
        return Promise.resolve({ ok: true, json: async () => [] })
      })
    )

    render(<App />)

    expect(screen.getByText('TokTickIT')).toBeInTheDocument()
    expect(screen.getByText('Create Support Ticket')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Ticket/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getAllByText(/Jennifer Anderson/i).length).toBeGreaterThan(0)
    })
  })

  it('shows error banner when submitting invalid form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }))

    render(<App />)

    const submitBtn = screen.getByRole('button', { name: /Create Ticket/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors below/i)).toBeInTheDocument()
    })
  })

  it('successfully creates ticket and shows success banner', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string, options?: any) => {
        if (options?.method === 'POST') {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              id: 101,
              ticketNo: 'TKT-2026-000101',
              summary: 'Wi-Fi connection drop',
              description: 'Wi-Fi keeps dropping randomly',
              currentStatus: 'NEW',
              requestedPriority: 'MEDIUM',
              createdAt: new Date().toISOString(),
            }),
          })
        }
        if (url.includes('/api/requesters')) {
          return Promise.resolve({
            ok: true,
            json: async () => [
              { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com', isActive: true },
            ],
          })
        }
        if (url.includes('/api/categories')) {
          return Promise.resolve({
            ok: true,
            json: async () => [{ id: 1, name: 'Network' }],
          })
        }
        if (url.includes('/api/related-systems')) {
          return Promise.resolve({
            ok: true,
            json: async () => [{ id: 1, name: 'Campus Wi-Fi' }],
          })
        }
        return Promise.resolve({ ok: true, json: async () => [] })
      })
    )

    render(<App />)

    await waitFor(() => {
      expect(screen.getAllByText(/Jennifer Anderson/i).length).toBeGreaterThan(0)
    })

    fireEvent.change(screen.getByPlaceholderText(/Cannot connect to Campus Wi-Fi/i), {
      target: { value: 'Wi-Fi connection drop' },
    })
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Related System/i), { target: { value: '1' } })
    fireEvent.change(screen.getByPlaceholderText(/Provide details about the issue/i), {
      target: { value: 'Wi-Fi keeps dropping randomly every 10 minutes.' },
    })

    const submitBtn = screen.getByRole('button', { name: /Create Ticket/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Ticket Created Successfully!/i)).toBeInTheDocument()
      expect(screen.getByText(/TKT-2026-000101/i)).toBeInTheDocument()
    })
  })
})