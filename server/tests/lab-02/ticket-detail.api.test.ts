import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Lab 2: Ticket Detail API Tests (FR-06, FR-09 / AC-03)', () => {
  let user1Id: number
  let user2Id: number
  let user1TicketId: number

  beforeAll(async () => {
    const users = await prisma.requesterUser.findMany({ where: { isActive: true }, take: 2 })
    user1Id = users[0].id
    user2Id = users[1]?.id || users[0].id

    const cat = await prisma.category.findFirst()
    const sys = await prisma.relatedSystem.findFirst()

    const ticket = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-DETAIL-${Date.now()}`,
        summary: 'Detailed Inspection Test Ticket',
        description: 'Testing read-only details and attachment lists.',
        categoryId: cat ? cat.id : 1,
        relatedSystemId: sys ? sys.id : 1,
        requesterId: user1Id,
        requestedPriority: 'MEDIUM',
        currentStatus: 'NEW',
      },
    })
    user1TicketId = ticket.id
  })

  it('API-03a: Owner can retrieve ticket detail with 200 OK', async () => {
    const res = await request(app)
      .get(`/api/tickets/${user1TicketId}`)
      .set('x-requester-id', String(user1Id))

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(user1TicketId)
    expect(res.body.summary).toBe('Detailed Inspection Test Ticket')
    expect(res.body).toHaveProperty('category')
    expect(res.body).toHaveProperty('relatedSystem')
    expect(res.body).toHaveProperty('attachments')
  })

  it('API-03b / AC-03: Direct access by another requester returns 403 Forbidden (Isolation)', async () => {
    if (user1Id === user2Id) return

    const res = await request(app)
      .get(`/api/tickets/${user1TicketId}`)
      .set('x-requester-id', String(user2Id))

    expect(res.status).toBe(403)
    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toMatch(/forbidden|permission/i)
  })

  it('API-03c: Requesting non-existent ticket returns 404 Not Found', async () => {
    const res = await request(app)
      .get('/api/tickets/99999999')
      .set('x-requester-id', String(user1Id))

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })
})
