import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('TokTickIT Ticket Creation UI Tests (4 States + Zen Green)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    try {
      localStorage.clear()
    } catch {
      // ignore
    }

    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
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
      return Promise.reject(new Error('Unknown endpoint'))
    })
  })

  it('State 1 (Idle): Renders Zen Green header, Requester, Title, Category, Related System, and Description fields', async () => {
    render(<App />)

    expect(screen.getByText(/TokTickIT/i)).toBeInTheDocument()
    expect(screen.getByText(/Zen Green/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Create Support Ticket/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Title \/ Summary/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Related System/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Create Ticket/i })).toBeInTheDocument()

    // Wait for master data to load
    await waitFor(() => {
      expect(screen.getAllByText(/Jennifer Anderson/i).length).toBeGreaterThan(0)
      expect(screen.getByRole('option', { name: /Hardware/i })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /Corporate Laptop/i })).toBeInTheDocument()
    })
  })

  it('State 2 (Error): Shows red error banner when submitting empty form', async () => {
    render(<App />)

    await waitFor(() => {
      expect(screen.getAllByText(/Jennifer Anderson/i).length).toBeGreaterThan(0)
    })

    const submitBtn = screen.getByRole('button', { name: /Create Ticket/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Please correct the errors below before submitting:/i)).toBeInTheDocument()
      expect(screen.getAllByText(/Title \/ Summary is required/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Please select a Category/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Please select a Related System/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Description is required/i).length).toBeGreaterThan(0)
    })
  })

  it('State 3 & 4 (Loading & Success): Submits valid form, shows Submitting Ticket... and displays green success banner with Ticket ID', async () => {
    globalThis.fetch = vi.fn().mockImplementation((url: string, options?: any) => {
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
          ],
        })
      }
      if (url.includes('/api/related-systems')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, name: 'Corporate Laptop' },
          ],
        })
      }
      if (url.includes('/api/tickets') && options?.method === 'POST') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({
                id: 42,
                ticketNo: 'TKT-2026-000042',
                summary: 'Laptop Battery Issue',
                description: 'Battery drains in 30 minutes',
                currentStatus: 'NEW',
                requestedPriority: 'HIGH',
                createdAt: new Date().toISOString(),
              }),
            })
          }, 100)
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getAllByText(/Jennifer Anderson/i).length).toBeGreaterThan(0)
    })

    // Fill form
    fireEvent.change(screen.getByLabelText(/Title \/ Summary/i), { target: { value: 'Laptop Battery Issue' } })
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Related System/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Battery drains in 30 minutes' } })

    const submitBtn = screen.getByRole('button', { name: /Create Ticket/i })
    fireEvent.click(submitBtn)

    // State 3: Loading
    expect(screen.getByText(/Submitting Ticket.../i)).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeDisabled()

    // State 4: Success
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Ticket Created Successfully!/i })).toBeInTheDocument()
      expect(screen.getByText(/ID: #42/i)).toBeInTheDocument()
      expect(screen.getByText(/TKT-2026-000042/i)).toBeInTheDocument()
    })
  })
})