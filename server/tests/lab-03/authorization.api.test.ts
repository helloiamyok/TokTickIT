import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Sprint 3 Requester Authorization & Regression API', () => {
  let req1Cookie: string;
  let req2Cookie: string;
  let req1TicketId: number;

  beforeAll(async () => {
    // Login Requester 1 (Jennifer Anderson)
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    req1Cookie = res1.headers['set-cookie'][0];

    // Login Requester 2 (Amanda Clark)
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amanda.clark@tiktockit.com', password: 'Password123!' });
    req2Cookie = res2.headers['set-cookie'][0];

    // ดึงตั๋วของ Requester 1 หรือสร้างถ้ายังไม่มี
    const ticketsRes = await request(app)
      .get('/api/tickets')
      .set('Cookie', req1Cookie);
    
    if (ticketsRes.body.data && ticketsRes.body.data.length > 0) {
      req1TicketId = ticketsRes.body.data[0].id;
    } else {
      const createRes = await request(app)
        .post('/api/tickets')
        .set('Cookie', req1Cookie)
        .send({
          summary: 'VPN Connection Problem',
          description: 'Cannot connect to company VPN from home',
          categoryId: 1,
          relatedSystemId: 1,
          requestedPriority: 'HIGH',
        });
      req1TicketId = createRes.body.id;
    }
  });

  it('AC-03: Requester can only retrieve tickets they own', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Cookie', req1Cookie);

    expect(res.status).toBe(200);
    const tickets = res.body.data || res.body;
    expect(Array.isArray(tickets)).toBe(true);
    expect(tickets.length).toBeGreaterThan(0);
    tickets.forEach((t: any) => {
      expect(t.requester.email).toBe('jennifer.anderson@tiktockit.com');
    });
  });

  it('BR-03: Ignores client-supplied requesterId and enforces authenticated identity', async () => {
    const res = await request(app)
      .get('/api/tickets?requesterId=9999')
      .set('Cookie', req1Cookie);

    expect(res.status).toBe(200);
    const tickets = res.body.data || res.body;
    expect(Array.isArray(tickets)).toBe(true);
    tickets.forEach((t: any) => {
      expect(t.requester.email).toBe('jennifer.anderson@tiktockit.com');
    });
  });

  it('AC-04: Requester is blocked from accessing internal notes with 403', async () => {
    expect(req1TicketId).toBeDefined();

    const res = await request(app)
      .get(`/api/staff/tickets/${req1TicketId}/internal-notes`)
      .set('Cookie', req1Cookie);

    expect(res.status).toBe(403);
  });

  it('BR-05: Requester can indicate problem is resolved without changing status directly', async () => {
    expect(req1TicketId).toBeDefined();

    const res = await request(app)
      .patch(`/api/tickets/${req1TicketId}/indicate-resolved`)
      .set('Cookie', req1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.requesterResolutionIndicated).toBe(true);
  });
});
