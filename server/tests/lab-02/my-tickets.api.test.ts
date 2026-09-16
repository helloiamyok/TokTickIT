import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

describe('Lab 2: My Tickets API Tests (Authenticated Regression)', () => {
  let user1Id: number
  let user2Id: number
  let user1Cookie: string
  let cat1Id: number
  let cat2Id: number
  let sysId: number

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

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' })
    const cookies = loginRes.headers['set-cookie']
    user1Cookie = Array.isArray(cookies) ? cookies[0] : cookies || ''

    const categories = await prisma.category.findMany({ take: 2 })
    cat1Id = categories[0]?.id || 1
    cat2Id = categories[1]?.id || cat1Id

    const sys = await prisma.relatedSystem.findFirst()
    sysId = sys ? sys.id : 1

    // สร้าง Seed ตั๋วสำหรับ User 1
    await prisma.ticket.create({
      data: {
        ticketNo: `TKT-TEST-${Date.now()}-1`,
        summary: 'VPN Connection Failed from Home',
        description: 'Unable to establish secure tunnel.',
        categoryId: cat1Id,
        relatedSystemId: sysId,
        requesterId: user1Id,
        requestedPriority: 'HIGH',
        currentStatus: 'NEW',
      },
    })

    // สร้าง Seed ตั๋วสำหรับ User 2
    await prisma.ticket.create({
      data: {
        ticketNo: `TKT-TEST-${Date.now()}-2`,
        summary: 'Software License Expired',
        description: 'Photoshop license expired.',
        categoryId: cat2Id,
        relatedSystemId: sysId,
        requesterId: user2Id,
        requestedPriority: 'LOW',
        currentStatus: 'RESOLVED',
      },
    })
  })

  it('FR-09 / AC-06: Returns only tickets owned by the current requester (Isolation)', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Cookie', user1Cookie)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)

    // ทุกตั๋วต้องเป็นของ user1Id เท่านั้น
    for (const t of res.body.data) {
      expect(t.requesterId).toBe(user1Id)
    }
  })

  it('FR-05: Filters tickets by search keyword', async () => {
    const res = await request(app)
      .get('/api/tickets?search=VPN')
      .set('Cookie', user1Cookie)

    expect(res.status).toBe(200)
    for (const t of res.body.data) {
      const match = t.summary.toLowerCase().includes('vpn') || t.ticketNumber.toLowerCase().includes('vpn')
      expect(match).toBe(true)
    }
  })

  it('FR-05: Filters tickets by category', async () => {
    const res = await request(app)
      .get(`/api/tickets?categoryId=${cat1Id}`)
      .set('Cookie', user1Cookie)

    expect(res.status).toBe(200)
    for (const t of res.body.data) {
      expect(t.categoryId).toBe(cat1Id)
    }
  })

  it('FR-04: Returns pagination metadata (page, limit, totalPages)', async () => {
    const res = await request(app)
      .get('/api/tickets?page=1&limit=2')
      .set('Cookie', user1Cookie)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('pagination')
    expect(res.body.pagination.page).toBe(1)
    expect(res.body.pagination.limit).toBe(2)
    expect(res.body.pagination).toHaveProperty('totalPages')
  })

  it('Rejects request without authentication with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/tickets')
    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })
})
