import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/index'

describe('GET /api/categories', () => {
  it('should return 200 and the seeded categories from database', async () => {
    const response = await request(app).get('/api/categories')

    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.length).toBe(4)
    expect(response.body[0]).toMatchObject({ id: expect.any(Number), name: 'Account and Access' })
    expect(response.body[1]).toMatchObject({ id: expect.any(Number), name: 'Hardware' })
    expect(response.body[2]).toMatchObject({ id: expect.any(Number), name: 'Software' })
    expect(response.body[3]).toMatchObject({ id: expect.any(Number), name: 'Network' })
  })
})
