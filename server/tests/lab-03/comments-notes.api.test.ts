import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Comments and Internal Notes API', () => {
  let staffCookie: string;
  let requesterCookie: string;
  let ticketId: number;

  beforeAll(async () => {
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'michael.brown@tiktockit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];

    const reqRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    requesterCookie = reqRes.headers['set-cookie'][0];

    const queueRes = await request(app).get('/api/staff/tickets').set('Cookie', staffCookie);
    ticketId = queueRes.body.data[0].id;
  });

  it('allows posting public comments', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticketId}/comments`)
      .set('Cookie', staffCookie)
      .send({ content: 'Investigation has started.' });

    expect(res.status).toBe(201);
    expect(res.body.isInternal).toBe(false);
  });

  it('blocks requesters from accessing internal notes (AC-04, BR-04)', async () => {
    const res = await request(app)
      .get(`/api/staff/tickets/${ticketId}/internal-notes`)
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(403);
  });

  it('allows staff to post internal notes', async () => {
    const res = await request(app)
      .post(`/api/staff/tickets/${ticketId}/internal-notes`)
      .set('Cookie', staffCookie)
      .send({ content: 'Private note: checking server logs.' });

    expect(res.status).toBe(201);
    expect(res.body.isInternal).toBe(true);
  });
});
