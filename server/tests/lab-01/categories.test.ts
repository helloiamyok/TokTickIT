import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/index'

describe('GET /api/categories', () => {
  it('should return 200 and a list of categories', async () => {
    const response = await request(app).get('/api/categories')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('categories')
    expect(Array.isArray(response.body.categories)).toBe(true)
    expect(response.body.categories.length).toBeGreaterThan(0)
    expect(response.body.categories[0]).toHaveProperty('id')
    expect(response.body.categories[0]).toHaveProperty('name')
  })
})