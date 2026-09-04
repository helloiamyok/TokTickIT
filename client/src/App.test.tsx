import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import App from './App'

describe('TokTickIT UI Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    try {
      window.localStorage?.clear?.()
    } catch {
      // Ignore if localStorage is not mocked
    }
  })

  it('UI-01: TokTickIT heading renders', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Hardware' }],
        })
      }
      if (url.includes('/related-systems')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Campus Wi-Fi' }],
        })
      }
      if (url.includes('/requesters')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com', isActive: true },
          ],
        })
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ status: 'ok' }),
      })
    })

    render(<App />)
    
    // Switch to System Status tab
    fireEvent.click(screen.getByRole('button', { name: /System Status/i }))
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
      if (url.includes('/related-systems') || url.includes('/requesters')) {
        return Promise.resolve({
          ok: true,
          json: async () => [],
        })
      }
      return Promise.reject(new Error('Unknown endpoint'))
    })

    render(<App />)
    // Switch to System Status tab
    fireEvent.click(screen.getByRole('button', { name: /System Status/i }))
    fireEvent.click(screen.getByRole('button', { name: /Check System/i }))

    await waitFor(() => {
      expect(screen.getByText(/System Status: Online/i)).toBeInTheDocument()
      expect(screen.getByText(/Account and Access/i)).toBeInTheDocument()
      expect(screen.getByText(/Network/i)).toBeInTheDocument()
    })
  })

  it('UI-03: API failure displays a useful error message', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/health')) {
        return Promise.reject(new Error('Network error'))
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
      })
    })

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /System Status/i }))
    fireEvent.click(screen.getByRole('button', { name: /Check System/i }))

    await waitFor(() => {
      expect(screen.getByText(/System Status: Offline/i)).toBeInTheDocument()
      expect(screen.getByText(/Unable to connect to TokTickIT API/i)).toBeInTheDocument()
    })
  })

  it('UI-04: Create Ticket view renders with required form fields', async () => {
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/categories')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Hardware' }],
        })
      }
      if (url.includes('/related-systems')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 1, name: 'Campus Wi-Fi' }],
        })
      }
      if (url.includes('/requesters')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, name: 'Jennifer Anderson', email: 'jennifer@example.com', isActive: true },
          ],
        })
      }
      return Promise.resolve({ ok: true, json: async () => [] })
    })

    render(<App />)
    expect(screen.getByRole('button', { name: /Submit Ticket/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Brief summary of the issue.../i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Provide details about the issue.../i)).toBeInTheDocument()
  })
})