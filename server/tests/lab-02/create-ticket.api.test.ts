import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Lab 2: Create Ticket API Tests', () => {
  let activeRequesterId: number
  let inactiveRequesterId: number
  let categoryId: number
  let relatedSystemId: number

  beforeAll(async () => {
    const activeReq = await prisma.user.findFirst({ where: { role: 'REQUESTER', isActive: true } })
    activeRequesterId = activeReq ? activeReq.id : 1

    const inactiveReq = await prisma.user.findFirst({ where: { role: 'REQUESTER', isActive: false } })
    inactiveRequesterId = inactiveReq ? inactiveReq.id : 999

    const cat = await prisma.category.findFirst()
    categoryId = cat ? cat.id : 1

    const sys = await prisma.relatedSystem.findFirst()
    relatedSystemId = sys ? sys.id : 1
  })

  it('API-01: Create ticket with valid data returns 201 and valid ticketNo', async () => {
    const payload = {
      requesterId: activeRequesterId,
      categoryId,
      relatedSystemId,
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
      requesterId: activeRequesterId,
      categoryId,
      relatedSystemId,
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
      requesterId: inactiveRequesterId,
      categoryId,
      relatedSystemId,
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

