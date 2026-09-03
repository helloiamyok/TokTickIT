import 'dotenv/config'
import express, { Request, Response } from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// GET /api/health
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'TokTickIT API' })
})

// GET /api/categories (Connected to PostgreSQL via Prisma)
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    })
    res.status(200).json(categories)
  } catch (error) {
    console.error('Prisma Error Details (Categories):', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// GET /api/requesters - Active requesters for Persona Switcher
app.get(['/api/requesters', '/api/requesters/active'], async (_req: Request, res: Response) => {
  try {
    const requesters = await prisma.requesterUser.findMany({
      where: { isActive: true },
      select: { id: true, name: true, email: true, isActive: true },
      orderBy: { name: 'asc' },
    })
    res.status(200).json(requesters)
  } catch (error) {
    console.error('Prisma Error Details (Requesters):', error)
    res.status(500).json({ error: 'Failed to fetch requesters' })
  }
})

// GET /api/related-systems - Related Systems for ticket creation
app.get('/api/related-systems', async (_req: Request, res: Response) => {
  try {
    const systems = await prisma.relatedSystem.findMany({
      orderBy: { name: 'asc' },
    })
    res.status(200).json(systems)
  } catch (error) {
    console.error('Prisma Error Details (RelatedSystems):', error)
    res.status(500).json({ error: 'Failed to fetch related systems' })
  }
})

// POST /api/tickets - Create Ticket
app.post('/api/tickets', async (req: Request, res: Response) => {
  try {
    const { title, summary, description, requesterId, categoryId, relatedSystemId, requestedPriority } = req.body
    const ticketSummary = summary || title

    if (!ticketSummary || !description || !requesterId || !categoryId || !relatedSystemId) {
      return res.status(400).json({
        error: 'Missing required fields: title/summary, description, requesterId, categoryId, or relatedSystemId',
      })
    }

    const year = new Date().getFullYear()
    const count = await prisma.ticket.count()
    const ticketNo = `TKT-${year}-${String(count + 1).padStart(6, '0')}`

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNo,
        summary: ticketSummary,
        description,
        currentStatus: 'NEW',
        requestedPriority: requestedPriority || 'MEDIUM',
        itPriority: 'MEDIUM',
        requesterId: Number(requesterId),
        categoryId: Number(categoryId),
        relatedSystemId: Number(relatedSystemId),
      },
      include: {
        requester: true,
        category: true,
        relatedSystem: true,
      },
    })

    res.status(201).json(newTicket)
  } catch (error) {
    console.error('Prisma Error Details (Create Ticket):', error)
    res.status(500).json({ error: 'Failed to create ticket' })
  }
})

// GET /api/tickets - Get Tickets
app.get('/api/tickets', async (req: Request, res: Response) => {
  try {
    const { requesterId } = req.query
    const where: any = {}
    if (requesterId) {
      where.requesterId = Number(requesterId)
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        category: true,
        relatedSystem: true,
        requester: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.status(200).json(tickets)
  } catch (error) {
    console.error('Prisma Error Details (Tickets):', error)
    res.status(500).json({ error: 'Failed to fetch tickets' })
  }
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app