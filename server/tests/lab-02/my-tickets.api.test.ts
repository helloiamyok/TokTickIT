import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Lab 2: My Tickets API Tests (API-06 / FR-04, FR-05, FR-09)', () => {
  let user1Id: number
  let user2Id: number
  let cat1Id: number
  let cat2Id: number
  let sysId: number

  beforeAll(async () => {
    // ดึง Requester และ Category ที่มีอยู่ในฐานข้อมูล
    const users = await prisma.requesterUser.findMany({ where: { isActive: true }, take: 2 })
    user1Id = users[0].id
    user2Id = users[1]?.id || users[0].id

    const categories = await prisma.category.findMany({ take: 2 })
    cat1Id = categories[0].id
    cat2Id = categories[1]?.id || categories[0].id

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
    if (user2Id !== user1Id) {
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
    }
  })

  it('FR-09 / AC-06: Returns only tickets owned by the current requester (Isolation)', async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${user1Id}`)

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
      .get(`/api/tickets?requesterId=${user1Id}&search=VPN`)

    expect(res.status).toBe(200)
    for (const t of res.body.data) {
      const match = t.summary.toLowerCase().includes('vpn') || t.ticketNumber.toLowerCase().includes('vpn')
      expect(match).toBe(true)
    }
  })

  it('FR-05: Filters tickets by category', async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${user1Id}&categoryId=${cat1Id}`)

    expect(res.status).toBe(200)
    for (const t of res.body.data) {
      expect(t.categoryId).toBe(cat1Id)
    }
  })

  it('FR-04: Returns pagination metadata (page, limit, totalPages)', async () => {
    const res = await request(app)
      .get(`/api/tickets?requesterId=${user1Id}&page=1&limit=2`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('pagination')
    expect(res.body.pagination.page).toBe(1)
    expect(res.body.pagination.limit).toBe(2)
    expect(res.body.pagination).toHaveProperty('totalPages')
  })

  it('Rejects request without requesterId with 400 Bad Request', async () => {
    const res = await request(app).get('/api/tickets')
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
