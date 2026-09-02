import express, { Request, Response } from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// GET /api/health
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'TokTickIT API' })
})

// GET /api/categories (Connected to PostgreSQL via Prisma)
app.get('/api/categories', async (req: Request, res: Response) => {
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app