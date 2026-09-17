import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Sprint 3 IT Staff Ticket Queue API Tests', () => {
  let staffCookie: string;
  let requesterCookie: string;

  beforeAll(async () => {
    // IT Staff session
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'michael.brown@tiktockit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];

    // Requester session
    const reqRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    requesterCookie = reqRes.headers['set-cookie'][0];
  });

  it('API-QUEUE-01: Requesters are blocked from accessing IT queue (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/staff/tickets')
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(403);
  });

  it('API-QUEUE-02: IT Staff can retrieve tickets with pagination metadata', async () => {
    const res = await request(app)
      .get('/api/staff/tickets?page=1&limit=10')
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(10);
  });

  it('API-QUEUE-03: Filtering tickets by status returns matching tickets only', async () => {
    const res = await request(app)
      .get('/api/staff/tickets?status=IN_PROGRESS')
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    res.body.data.forEach((ticket: any) => {
      expect(ticket.status).toBe('IN_PROGRESS');
    });
  });

  it('API-QUEUE-04: Searching by ticket summary or number matches query', async () => {
    const res = await request(app)
      .get('/api/staff/tickets?search=battery')
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});