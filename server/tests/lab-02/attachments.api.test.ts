import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../src/index'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

describe('Lab 2: Attachments API Tests (FR-07, FR-08, BR-05, BR-06, BR-07 / AC-04, AC-05)', () => {
  let userId: number
  let ticketId: number
  let createdAttachmentId: number

  beforeAll(async () => {
    const user = await prisma.requesterUser.findFirst({ where: { isActive: true } })
    userId = user ? user.id : 1

    const cat = await prisma.category.findFirst()
    const sys = await prisma.relatedSystem.findFirst()

    const ticket = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-ATT-${Date.now()}`,
        summary: 'Attachment Testing Ticket',
        description: 'Testing upload, validation, and soft-delete.',
        categoryId: cat ? cat.id : 1,
        relatedSystemId: sys ? sys.id : 1,
        requesterId: userId,
        requestedPriority: 'LOW',
        currentStatus: 'NEW',
      },
    })
    ticketId = ticket.id
  })

  it('API-04a: Successfully uploads permitted attachment (JPG/PNG/WEBP/PDF <= 5MB)', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('x-requester-id', String(userId))
      .send({
        requesterId: userId,
        fileName: 'error-screenshot.png',
        fileSize: 102400, // 100 KB
        fileType: 'image/png',
        filePath: '/uploads/error-screenshot.png',
      })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.fileName).toBe('error-screenshot.png')
    expect(res.body.isDeleted).toBe(false)
    createdAttachmentId = res.body.id
  })

  it('API-04b / AC-04: Rejects attachment with invalid file type (e.g. .exe / .zip)', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('x-requester-id', String(userId))
      .send({
        requesterId: userId,
        fileName: 'malware.exe',
        fileSize: 50000,
        fileType: 'application/x-msdownload',
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/invalid file type/i)
  })

  it('API-04c / AC-04: Rejects attachment exceeding 5 MB limit', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/attachments`)
      .set('x-requester-id', String(userId))
      .send({
        requesterId: userId,
        fileName: 'huge-file.pdf',
        fileSize: 6 * 1024 * 1024, // 6 MB
        fileType: 'application/pdf',
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/5 mb/i)
  })

  it('API-05a / AC-05: Soft-removes an attachment with mandatory reason (BR-07)', async () => {
    const res = await request(app)
      .delete(`/api/attachments/${createdAttachmentId}`)
      .set('x-requester-id', String(userId))
      .send({
        requesterId: userId,
        deletedReason: 'Uploaded wrong document screenshot',
      })

    expect(res.status).toBe(200)
    expect(res.body.isDeleted).toBe(true)
    expect(res.body.deletedReason).toBe('Uploaded wrong document screenshot')
    expect(res.body).toHaveProperty('deletedAt')
  })

  it('API-05b: Rejects soft-removal without mandatory reason', async () => {
    // Create temporary attachment
    const tempAtt = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: 'temp.jpg',
        fileSize: 5000,
        fileType: 'image/jpeg',
        filePath: '/uploads/temp.jpg',
      },
    })

    const res = await request(app)
      .delete(`/api/attachments/${tempAtt.id}`)
      .set('x-requester-id', String(userId))
      .send({
        requesterId: userId,
        deletedReason: '', // Empty reason
      })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/mandatory reason/i)
  })
})
