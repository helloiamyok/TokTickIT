import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('TokTickIT UI Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('UI-01: TokTickIT heading renders', () => {
    render(<App />)
    expect(screen.getByText(/TokTickIT IT Service Desk/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Check System/i })).toBeInTheDocument()
  })

  it('UI-02: Loading state changes to category list', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/health')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ status: 'ok', service: 'TokTickIT API' }),
        })
      }
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, name: 'Account and Access' },
            { id: 2, name: 'Hardware' },
            { id: 3, name: 'Software' },
            { id: 4, name: 'Network' },
          ],
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Check System/i }))

    await waitFor(() => {
      expect(screen.getByText(/System Status: Online/i)).toBeInTheDocument()
      expect(screen.getByText(/Account and Access/i)).toBeInTheDocument()
      expect(screen.getByText(/Network/i)).toBeInTheDocument()
    })
  })

  it('UI-03: API failure displays a useful error message', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Check System/i }))

    await waitFor(() => {
      expect(screen.getByText(/System Status: Offline/i)).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to TokTickIT API/i)).toBeInTheDocument()
    })
  })
})