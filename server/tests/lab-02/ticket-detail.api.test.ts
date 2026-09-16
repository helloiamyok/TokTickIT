import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

describe('Lab 2: Ticket Detail API Tests (Authenticated Regression / FR-06, FR-09 / AC-03)', () => {
  let user1Id: number
  let user2Id: number
  let user1Cookie: string
  let user2Cookie: string
  let user1TicketId: number

  beforeAll(async () => {
    const defaultHash = await bcrypt.hash('Password123!', 10)

    const user1 = await prisma.user.upsert({
      where: { email: 'jennifer.anderson@tiktockit.com' },
      update: { passwordHash: defaultHash, isActive: true },
      create: {
        email: 'jennifer.anderson@tiktockit.com',
        name: 'Jennifer Anderson',
        passwordHash: defaultHash,
        role: 'REQUESTER',
        isActive: true,
      },
    })
    user1Id = user1.id

    const user2 = await prisma.user.upsert({
      where: { email: 'amanda.clark@tiktockit.com' },
      update: { passwordHash: defaultHash, isActive: true },
      create: {
        email: 'amanda.clark@tiktockit.com',
        name: 'Amanda Clark',
        passwordHash: defaultHash,
        role: 'REQUESTER',
        isActive: true,
      },
    })
    user2Id = user2.id

    const login1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' })
    const cookies1 = login1.headers['set-cookie']
    user1Cookie = Array.isArray(cookies1) ? cookies1[0] : cookies1 || ''

    const login2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amanda.clark@tiktockit.com', password: 'Password123!' })
    const cookies2 = login2.headers['set-cookie']
    user2Cookie = Array.isArray(cookies2) ? cookies2[0] : cookies2 || ''

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
      .set('Cookie', user1Cookie)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe(user1TicketId)
    expect(res.body.summary).toBe('Detailed Inspection Test Ticket')
    expect(res.body).toHaveProperty('category')
    expect(res.body).toHaveProperty('relatedSystem')
    expect(res.body).toHaveProperty('attachments')
  })

  it('API-03b / AC-03: Direct access by another requester returns 403 Forbidden (Isolation)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${user1TicketId}`)
      .set('Cookie', user2Cookie)

    expect(res.status).toBe(403)
    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toMatch(/forbidden|permission|owner/i)
  })

  it('API-03c: Requesting non-existent ticket returns 404 Not Found', async () => {
    const res = await request(app)
      .get('/api/tickets/99999999')
      .set('Cookie', user1Cookie)

    expect(res.status).toBe(404)
    expect(res.body).toHaveProperty('error')
  })
})
