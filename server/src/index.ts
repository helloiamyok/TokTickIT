import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { PrismaClient, Priority, TicketStatus } from '@prisma/client'
import authRoutes from './routes/auth.routes'
import staffRoutes from './routes/staff.routes'
import adminRoutes from './routes/admin.routes'
import { authenticate, AuthRequest } from './middlewares/auth.middleware'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

// ตั้งค่า CORS ให้รองรับ Cookie/Credentials สำหรับ Authentication
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

// เชื่อมต่อ Auth Routes, Staff Routes และ Admin Routes สำหรับ Sprint 3
app.use('/api/auth', authRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/admin', adminRoutes)
app.use('/', staffRoutes)

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

// GET /api/requesters - ดึงรายชื่อ Requester ทั้งหมด
app.get('/api/requesters', async (_req: Request, res: Response) => {
  try {
    const requesters = await prisma.user.findMany({
      where: { role: 'REQUESTER' },
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
    const activeRequesters = await prisma.user.findMany({
      where: { role: 'REQUESTER', isActive: true },
      orderBy: { id: 'asc' },
    })
    res.status(200).json(activeRequesters)
  } catch (error) {
    console.error('Prisma Error Details (Active Requesters):', error)
    res.status(500).json({ error: 'Failed to fetch active requesters' })
  }
})

// ----------------------------------------------------
// 2. Ticket Endpoints (Guarded by Authenticate & RBAC)
// ----------------------------------------------------

// POST /api/tickets - สร้าง Ticket ใหม่ (ใช้ authenticated user identity เสมอ)
app.post('/api/tickets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { summary, description, categoryId, relatedSystemId, requestedPriority } = req.body
    const requesterId = req.user!.id

    // 1. ตรวจสอบข้อมูลจำเป็น (Backend Validation)
    if (!summary || !description || !categoryId || !relatedSystemId) {
      return res.status(400).json({ error: 'All required fields must be provided.' })
    }

    if (typeof summary !== 'string' || summary.trim().length === 0 || summary.length > 100) {
      return res.status(400).json({ error: 'Summary must be between 1 and 100 characters.' })
    }

    if (typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'Description is required.' })
    }

    const priorityValue = requestedPriority || 'MEDIUM'
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
    if (!validPriorities.includes(priorityValue)) {
      return res.status(400).json({ error: 'Invalid requested priority. Must be LOW, MEDIUM, HIGH, or URGENT.' })
    }

    // ตรวจสอบ Category & RelatedSystem
    const parsedCategoryId = parseInt(categoryId, 10)
    const parsedRelatedSystemId = parseInt(relatedSystemId, 10)

    if (isNaN(parsedCategoryId) || isNaN(parsedRelatedSystemId)) {
      return res.status(400).json({ error: 'Invalid categoryId or relatedSystemId.' })
    }

    const category = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    })
    if (!category) {
      return res.status(400).json({ error: 'Category not found.' })
    }

    const relatedSystem = await prisma.relatedSystem.findUnique({
      where: { id: parsedRelatedSystemId },
    })
    if (!relatedSystem) {
      return res.status(400).json({ error: 'Related system not found.' })
    }

    const mappedPriority = (priorityValue === 'URGENT' ? 'HIGH' : priorityValue) as Priority

    // 2. บันทึกและสร้างเลข Ticket Number ด้วย Transaction
    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          requesterId,
          summary: summary.trim(),
          description: description.trim(),
          categoryId: parsedCategoryId,
          relatedSystemId: parsedRelatedSystemId,
          requestedPriority: mappedPriority,
          itPriority: mappedPriority,
          currentStatus: TicketStatus.NEW,
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
          requester: {
            select: { id: true, name: true, email: true, role: true },
          },
          attachments: true,
        },
      })

      return {
        ...updated,
        ticketNumber: updated.ticketNo,
        status: updated.currentStatus,
      }
    })

    return res.status(201).json(newTicket)
  } catch (error) {
    console.error('Create Ticket Error:', error)
    return res.status(500).json({ error: 'Failed to create ticket. Server error.' })
  }
})

// GET /api/tickets - ดึงรายการ Tickets (Requester ได้เฉพาะของตัวเอง, Staff/Admin ได้ทั้งหมด)
app.get('/api/tickets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const isRequester = req.user!.role === 'REQUESTER'

    const {
      search,
      categoryId,
      priority,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = '1',
      limit = '5',
    } = req.query

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1)
    const take = Math.max(1, parseInt(limit as string, 10) || 5)
    const skip = (pageNum - 1) * take

    // BR-03: ถ้าเป็น REQUESTER จะถูกกรองเฉพาะ requesterId ของตัวเองเสมอ
    const where: any = isRequester ? { requesterId: req.user!.id } : {}

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim()
      where.OR = [
        { ticketNo: { contains: q, mode: 'insensitive' } },
        { summary: { contains: q, mode: 'insensitive' } },
      ]
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = Number(categoryId)
    }

    if (priority && priority !== 'ALL') {
      if (['LOW', 'MEDIUM', 'HIGH'].includes(priority as string)) {
        where.requestedPriority = priority as Priority
      } else if (priority === 'URGENT') {
        where.requestedPriority = Priority.HIGH
      }
    }

    if (status && status !== 'ALL' && Object.values(TicketStatus).includes(status as TicketStatus)) {
      where.currentStatus = status as TicketStatus
    }

    const sortField = typeof sortBy === 'string' ? sortBy : 'createdAt'
    const sortDirection = order === 'asc' ? 'asc' : 'desc'

    const [totalCount, tickets] = await prisma.$transaction([
      prisma.ticket.count({ where }),
      prisma.ticket.findMany({
        where,
        include: {
          category: true,
          relatedSystem: true,
          requester: {
            select: { id: true, name: true, email: true, role: true },
          },
          attachments: {
            where: { isDeleted: false },
          },
        },
        orderBy: { [sortField]: sortDirection },
        skip,
        take,
      }),
    ])

    const totalPages = Math.ceil(totalCount / take) || 1

    return res.status(200).json({
      data: tickets.map((t) => ({
        ...t,
        ticketNumber: t.ticketNo,
        status: t.currentStatus,
      })),
      pagination: {
        page: pageNum,
        limit: take,
        totalItems: totalCount,
        totalPages,
      },
    })
  } catch (error) {
    console.error('Get Tickets Error:', error)
    return res.status(500).json({ error: 'Failed to fetch tickets' })
  }
})

// GET /api/tickets/:id - ดูรายละเอียด Ticket (AC-03: ตรวจสอบความเป็นเจ้าของสำหรับ Requester)
app.get('/api/tickets/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ticket ID.' })
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        relatedSystem: true,
        requester: {
          select: { id: true, name: true, email: true, role: true },
        },
        attachments: true,
      },
    })

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' })
    }

    // Ownership Check: ถ้าเป็น Requester และไม่ใช่เจ้าของตั๋ว ให้ตอบกลับ 403 Forbidden (AC-03)
    if (req.user!.role === 'REQUESTER' && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: 'Access forbidden: not the ticket owner' })
    }

    return res.status(200).json({
      ...ticket,
      ticketNumber: ticket.ticketNo,
      status: ticket.currentStatus,
    })
  } catch (error) {
    console.error('Get Ticket Detail Error:', error)
    return res.status(500).json({ error: 'Failed to fetch ticket detail' })
  }
})

// ----------------------------------------------------
// 3. Attachment Endpoints (Guarded by Authenticate & Ownership)
// ----------------------------------------------------

// POST /api/tickets/:id/attachments - อัปโหลดไฟล์แนบ
app.post('/api/tickets/:id/attachments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const ticketId = parseInt(req.params.id as string, 10)
    if (isNaN(ticketId)) {
      return res.status(400).json({ error: 'Invalid ticket ID.' })
    }

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

    // Ownership Check for Requester
    if (req.user!.role === 'REQUESTER' && ticket.requesterId !== req.user!.id) {
      return res.status(403).json({ error: 'Forbidden: Cannot add attachment to another requester ticket.' })
    }

    if (ticket.attachments.length >= 5) {
      return res.status(400).json({ error: 'Maximum 5 active attachments allowed per ticket.' })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!fileType || !allowedTypes.includes(fileType)) {
      return res.status(400).json({ error: 'Invalid file type. Allowed formats: JPG, PNG, WEBP, PDF.' })
    }

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

// DELETE /api/attachments/:id - Soft-remove attachment
app.delete('/api/attachments/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid attachment ID.' })
    }

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

    // Ownership Check for Requester
    if (req.user!.role === 'REQUESTER' && attachment.ticket.requesterId !== req.user!.id) {
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