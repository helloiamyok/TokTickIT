import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/index'

describe('Lab 2: Create Ticket API Tests', () => {
  it('API-01: Create ticket with valid data returns 201 and valid ticketNo', async () => {
    const payload = {
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: 'MEDIUM',
      summary: 'Automated Test Ticket - Printer Error',
      description: 'The office printer is showing paper jam error code 501.',
    }

    const res = await request(app)
      .post('/api/tickets')
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.ticketNo).toMatch(/^TKT-\d{4}-\d{6}$/)
    expect(res.body.summary).toBe(payload.summary)
    expect(res.body.currentStatus).toBe('NEW')
  })

  it('API-02: Create ticket missing summary returns 400 Bad Request', async () => {
    const payload = {
      requesterId: 1,
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: 'MEDIUM',
      summary: '',
      description: 'Description without summary',
    }

    const res = await request(app)
      .post('/api/tickets')
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('API-03: Create ticket with inactive requester returns 400 Bad Request', async () => {
    const payload = {
      requesterId: 5, // John Inactive
      categoryId: 1,
      relatedSystemId: 1,
      requestedPriority: 'MEDIUM',
      summary: 'Ticket by inactive requester',
      description: 'Should be rejected',
    }

    const res = await request(app)
      .post('/api/tickets')
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/inactive/i)
  })
})
