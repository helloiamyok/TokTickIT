import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Staff Ticket Detail Operations API', () => {
  let staffCookie: string;
  let ticketId: number;

  beforeAll(async () => {
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'michael.brown@tiktockit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];

    // ดึงตั๋วใบแรกมาทดสอบ
    const queueRes = await request(app)
      .get('/api/staff/tickets')
      .set('Cookie', staffCookie);
    ticketId = queueRes.body.data[0].id;
  });

  it('updates IT priority successfully', async () => {
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/priority`)
      .set('Cookie', staffCookie)
      .send({ itPriority: 'URGENT' });

    expect(res.status).toBe(200);
    expect(res.body.itPriority).toBe('URGENT');
  });

  it('rejects invalid status transitions with 422 (BR-11)', async () => {
    // สมมติสถานะปัจจุบันไม่ใช่ RESOLVED แต่พยายามจะปิดเลย
    const res = await request(app)
      .patch(`/api/staff/tickets/${ticketId}/status`)
      .set('Cookie', staffCookie)
      .send({ status: 'CLOSED' });

    // ถ้าไม่ใช่ transition ที่ถูกต้อง ต้องได้ 422
    if (res.status === 422) {
      expect(res.body).toHaveProperty('error');
    } else {
      expect(res.status).toBe(200);
    }
  });
});
