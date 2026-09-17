import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

describe('Lab 2: Create Ticket API Tests (Authenticated Regression)', () => {
  let activeCookie: string
  let categoryId: number = 1
  let relatedSystemId: number = 1

  beforeAll(async () => {
    const defaultHash = await bcrypt.hash('Password123!', 10)

    await prisma.user.upsert({
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

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' })
    const cookies = loginRes.headers['set-cookie']
    activeCookie = Array.isArray(cookies) ? cookies[0] : cookies || ''

    const cat = await prisma.category.findFirst()
    if (cat) categoryId = cat.id

    const sys = await prisma.relatedSystem.findFirst()
    if (sys) relatedSystemId = sys.id
  })

  it('API-01: Create ticket with valid data returns 201 and valid ticketNo', async () => {
    const payload = {
      categoryId,
      relatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Automated Test Ticket - Printer Error',
      description: 'The office printer is showing paper jam error code 501.',
    }

    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', activeCookie)
      .send(payload)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.ticketNo).toMatch(/^TKT-\d{4}-\d{6}$/)
    expect(res.body.summary).toBe(payload.summary)
    expect(res.body.currentStatus).toBe('NEW')
  })

  it('API-02: Create ticket missing summary returns 400 Bad Request', async () => {
    const payload = {
      categoryId,
      relatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: '',
      description: 'Description without summary',
    }

    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', activeCookie)
      .send(payload)

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('API-03: Create ticket without authentication returns 401 Unauthorized', async () => {
    const payload = {
      categoryId,
      relatedSystemId,
      requestedPriority: 'MEDIUM',
      summary: 'Ticket by unauthenticated requester',
      description: 'Should be rejected',
    }

    const res = await request(app)
      .post('/api/tickets')
      .send(payload)

    expect(res.status).toBe(401)
    expect(res.body.error).toMatch(/authentication/i)
  })
})
