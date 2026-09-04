import express, { Request, Response } from 'express'
import cors from 'cors'
import { PrismaClient, Priority, TicketStatus } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// ฟังก์ชันสร้าง Ticket Number แบบเป็นทางการ (BR-01) เช่น TKT-2026-000001
function generateTicketNumber(id: number): string {
  const year = new Date().getFullYear()
  return `TKT-${year}-${String(id).padStart(6, '0')}`
}

// ----------------------------------------------------
// 1. Master Data Endpoints
// ----------------------------------------------------

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'TokTickIT API' })
})

// GET /api/categories (Connected to PostgreSQL via Prisma)
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, isActive: true },
      orderBy: { id: 'asc' },
    })
    res.status(200).json(categories)
  } catch (error) {
    console.error('Prisma Error Details (Categories):', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/related-systems - ดึงรายชื่อ Related Systems สำหรับ Dropdown ในฟอร์ม
app.get('/api/related-systems', async (_req: Request, res: Response) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      where: { isActive: true },
      select: { id: true, name: true, isActive: true },
      orderBy: { id: 'asc' },
    })
    res.status(200).json(systems)
  } catch (error) {
    console.error('Prisma Error Details (Related Systems):', error)
    res.status(500).json({ error: 'Failed to fetch related systems' })
  }
})

// GET /api/requesters - ดึงรายชื่อ Requester ทั้งหมดสำหรับ Persona Switcher
app.get('/api/requesters', async (_req: Request, res: Response) => {
  try {
    const requesters = await prisma.requesterUser.findMany({
      orderBy: { id: 'asc' },
    })
    res.status(200).json(requesters)
  } catch (error) {
    console.error('Prisma Error Details (Requesters):', error)
    res.status(500).json({ error: 'Failed to fetch requesters' })
  }
})

// GET /api/requesters/active - ดึงรายชื่อ Active Requester เท่านั้น
app.get('/api/requesters/active', async (_req: Request, res: Response) => {
  try {
    const activeRequesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      orderBy: { id: 'asc' },
    })
    res.status(200).json(activeRequesters)
  } catch (error) {
    console.error('Prisma Error Details (Active Requesters):', error)
    res.status(500).json({ error: 'Failed to fetch active requesters' })
  }
})

// ----------------------------------------------------
// 2. Ticket Endpoints
// ----------------------------------------------------

// POST /api/tickets - สร้าง Ticket ใหม่ (FR-02, BR-01, BR-02)
app.post('/api/tickets', async (req: Request, res: Response) => {
  try {
    const { requesterId, summary, description, categoryId, relatedSystemId, requestedPriority } = req.body

    // 1. ตรวจสอบข้อมูลจำเป็น (Backend Validation)
    if (!requesterId || !summary || !description || !categoryId || !relatedSystemId || !requestedPriority) {
      return res.status(400).json({ error: 'All required fields must be provided.' })
    }

    if (typeof summary !== 'string' || summary.trim().length === 0 || summary.length > 100) {
      return res.status(400).json({ error: 'Summary must be between 1 and 100 characters.' })
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required.' })
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH']
    if (!validPriorities.includes(requestedPriority)) {
      return res.status(400).json({ error: 'Invalid requested priority. Must be LOW, MEDIUM, or HIGH.' })
    }

    // ตรวจสอบว่า Requester มีอยู่จริงและ Active (BR-04)
    const requester = await prisma.requesterUser.findUnique({
      where: { id: Number(requesterId) },
    })
    if (!requester || !requester.isActive) {
      return res.status(400).json({ error: 'Requester user not found or inactive.' })
    }

    // ตรวจสอบ Category & RelatedSystem
    const category = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    })
    if (!category) {
      return res.status(400).json({ error: 'Category not found.' })
    }

    const relatedSystem = await prisma.relatedSystem.findUnique({
      where: { id: Number(relatedSystemId) },
    })
    if (!relatedSystem) {
      return res.status(400).json({ error: 'Related system not found.' })
    }

    // 2. บันทึกและสร้างเลข Ticket Number ด้วย Transaction (BR-01, BR-02)
    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          requesterId: Number(requesterId),
          summary: summary.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          relatedSystemId: Number(relatedSystemId),
          requestedPriority: requestedPriority as Priority,
          itPriority: requestedPriority as Priority,
          currentStatus: TicketStatus.NEW, // BR-02: สถานะเริ่มต้น NEW
          ticketNo: `PENDING-${Date.now()}`,
        },
      })

      const officialNumber = generateTicketNumber(ticket.id)

      const updated = await tx.ticket.update({
        where: { id: ticket.id },
        data: { ticketNo: officialNumber },
        include: {
          category: true,
          relatedSystem: true,
          requester: true,
          attachments: true,
        },
      })

      return {
        ...updated,
        ticketNumber: updated.ticketNo,
      }
    })

    return res.status(201).json(newTicket)
  } catch (error) {
    console.error('Create Ticket Error:', error)
    return res.status(500).json({ error: 'Failed to create ticket. Server error.' })
  }
})

// GET /api/tickets - ดึงรายการ Tickets ของ Requester พร้อม Search, Filter, Pagination (FR-04, FR-05, FR-09)
app.get('/api/tickets', async (req: Request, res: Response) => {
  try {
    const requesterIdHeader = req.headers['x-requester-id']
    const requesterId = requesterIdHeader ? Number(requesterIdHeader) : Number(req.query.requesterId)

    if (!requesterId || isNaN(requesterId)) {
      return res.status(400).json({ error: 'Requester ID is required (x-requester-id header or requesterId query param).' })
    }

    const { search, categoryId, priority, status, page = '1', limit = '8' } = req.query
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const take = Math.max(1, parseInt(limit as string, 10) || 8)
    const skip = (pageNum - 1) * take

    const where: any = {
      requesterId, // FR-09: Isolation - only fetch tickets for the requested user
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim()
      where.OR = [
        { ticketNo: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      where.categoryId = Number(categoryId)
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority as string)) {
      where.requestedPriority = priority as Priority
    }

    if (status && Object.values(TicketStatus).includes(status as TicketStatus)) {
      where.currentStatus = status as TicketStatus
    }

    const [totalCount, tickets] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        include: {
          category: true,
          relatedSystem: true,
          requester: true,
          attachments: {
            where: { isDeleted: false },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
    ])

    const totalPages = Math.ceil(totalCount / take) || 1

    return res.status(200).json({
      data: tickets.map((t) => ({ ...t, ticketNumber: t.ticketNo })),
      pagination: {
        page: pageNum,
        limit: take,
        totalCount,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get Tickets Error:', error)
    return res.status(500).json({ error: 'Failed to fetch tickets' })
  }
})

// GET /api/tickets/:id - ดูรายละเอียด Ticket (FR-06, FR-09)
app.get('/api/tickets/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ticket ID.' })
    }

    const requesterIdHeader = req.headers['x-requester-id']
    const requesterId = requesterIdHeader ? Number(requesterIdHeader) : Number(req.query.requesterId)

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        relatedSystem: true,
        requester: true,
        attachments: true,
      },
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // FR-09 / AC-03: Cross-requester data isolation
    if (requesterId && ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to view this ticket.' })
    }

    return res.status(200).json({ ...ticket, ticketNumber: ticket.ticketNo })
  } catch (error) {
    console.error('Get Ticket Detail Error:', error)
    return res.status(500).json({ error: 'Failed to fetch ticket detail' })
  }
})

// ----------------------------------------------------
// 3. Attachment Endpoints (FR-07, FR-08, BR-05, BR-06, BR-07)
// ----------------------------------------------------

// POST /api/tickets/:id/attachments - อัปโหลดไฟล์แนบ
app.post('/api/tickets/:id/attachments', async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id)
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID.' })
    }

    const requesterIdHeader = req.headers['x-requester-id']
    const requesterId = requesterIdHeader ? Number(requesterIdHeader) : Number(req.body.requesterId)
    const { fileName, fileSize, fileType, filePath } = req.body

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        attachments: {
          where: { isDeleted: false },
        },
      },
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    if (requesterId && ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: 'Forbidden: Cannot add attachment to another requester ticket.' })
    }

    // BR-06: Maximum 5 active attachments per ticket
    if (ticket.attachments.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 active attachments allowed per ticket.' })
    }

    // BR-05: Allowed attachment file types (JPG, PNG, WEBP, PDF)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!fileType || !allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed formats: JPG, PNG, WEBP, PDF.' })
    }

    // BR-05: Maximum size is 5 MB
    const maxSize = 5 * 1024 * 1024
    if (!fileSize || Number(fileSize) > maxSize) {
      return res.status(400).json({ error: 'File size exceeds 5 MB limit.' })
    }

    const newAttachment = await prisma.attachment.create({
      data: {
        ticketId,
        fileName: fileName || 'attachment',
        fileSize: Number(fileSize),
        fileType,
        filePath: filePath || `/uploads/${fileName}`,
      },
    })

    return res.status(201).json(newAttachment)
  } catch (error) {
    console.error('Create Attachment Error:', error)
    return res.status(500).json({ error: 'Failed to upload attachment' })
  }
})

// DELETE /api/attachments/:id - Soft-remove attachment with mandatory reason (FR-08, BR-07)
app.delete('/api/attachments/:id', async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid attachment ID.' })
    }

    const requesterIdHeader = req.headers['x-requester-id']
    const requesterId = requesterIdHeader ? Number(requesterIdHeader) : Number(req.body.requesterId)
    const { deletedReason } = req.body

    if (!deletedReason || typeof deletedReason !== 'string' || deletedReason.trim().length === 0) {
      return res.status(400).json({ error: 'Mandatory reason is required for soft-removal.' })
    }

    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: { ticket: true },
    })

    if (!attachment) {
      return res.status(404).json({ error: 'Attachment not found' })
    }

    if (requesterId && attachment.ticket.requesterId !== requesterId) {
      return res.status(403).json({ error: 'Forbidden: Cannot remove attachment from another requester ticket.' })
    }

    const updated = await prisma.attachment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedReason: deletedReason.trim(),
        deletedAt: new Date(),
      },
    })

    return res.status(200).json(updated)
  } catch (error) {
    console.error('Delete Attachment Error:', error)
    return res.status(500).json({ error: 'Failed to remove attachment' })
  }
})

// ----------------------------------------------------
// Server Listener
// ----------------------------------------------------
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app