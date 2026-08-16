import express, { Request, Response } from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Mock IT Service Categories for Issue #3
const categories = [
  { id: 1, name: 'Hardware & Devices' },
  { id: 2, name: 'Software & Applications' },
  { id: 3, name: 'Network & Connectivity' },
  { id: 4, name: 'Account & Access' },
]

// GET /api/health (Issue #2)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', service: 'TokTickIT API' })
})

// GET /api/categories (Issue #3)
app.get('/api/categories', (req: Request, res: Response) => {
  res.status(200).json({ categories })
})

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
  })
}

export default app