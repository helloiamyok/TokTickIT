import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Ticket Workflow and Resolution Gate API (Lab 4)', () => {
  let staffToken: string;
  let requesterToken: string;
  let otherRequesterToken: string;
  let testTicketId: number;
  let resolvedTicketId: number;
  let otherTicketId: number;

  beforeAll(async () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'lab3-jwt-secret-key-334';
    const generateToken = (user: { id: number; email: string; role: string }) => {
      return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '1d',
      });
    };

    // 1. ดึงผู้ใช้สำหรับทดสอบจาก Seed Data
    const staff = await prisma.user.findFirst({ where: { role: 'IT_STAFF' } });
    const requester = await prisma.user.findFirst({ where: { role: 'REQUESTER' } });
    const otherRequester = await prisma.user.findFirst({
      where: { role: 'REQUESTER', NOT: { id: requester?.id } },
    });

    if (!staff || !requester || !otherRequester) {
      throw new Error('Seed data required: staff, requester, and otherRequester');
    }

    // 2. ออก Token
    staffToken = (staff as any).token || generateToken(staff);
    requesterToken = (requester as any).token || generateToken(requester);
    otherRequesterToken = (otherRequester as any).token || generateToken(otherRequester);

    // ดึง category และ system สำหรับผูก foreign key
    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();
    const categoryId = cat?.id || 1;
    const relatedSystemId = sys?.id || 1;

    // 3. เตรียม Ticket สถานะ IN_PROGRESS
    const ticket = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-WF-${Date.now()}-1`,
        summary: 'Network printer issue',
        description: 'Unable to connect to office printer',
        requestedPriority: 'HIGH',
        itPriority: 'HIGH',
        currentStatus: 'IN_PROGRESS',
        requesterId: requester.id,
        categoryId,
        relatedSystemId,
      },
    });
    testTicketId = ticket.id;

    // 4. เตรียม Ticket สถานะ RESOLVED
    const resolvedTicket = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-WF-${Date.now()}-2`,
        summary: 'Monitor flickering',
        description: 'HDMI cable faulty',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'RESOLVED',
        requesterId: requester.id,
        categoryId,
        relatedSystemId,
      },
    });
    resolvedTicketId = resolvedTicket.id;

    // 5. เตรียม Ticket ของ otherRequester
    const otherTicket = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-WF-${Date.now()}-3`,
        summary: 'Email sync delay',
        description: 'Emails not syncing in real time',
        requestedPriority: 'LOW',
        itPriority: 'LOW',
        currentStatus: 'OPEN',
        requesterId: otherRequester.id,
        categoryId,
        relatedSystemId,
      },
    });
    otherTicketId = otherTicket.id;
  });

  // TEST 1: Resolution Gate - Requester ต้องไม่สามารถเปลี่ยนสถานะเป็น RESOLVED ได้โดยตรง
  it('rejects Requester attempt to directly resolve ticket with 403 Forbidden (Resolution Gate)', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Resolution Gate/i);
  });

  // TEST 2: Requester คนอื่นพยายามเข้าถึงตั๋ว
  it('rejects update from Requester who does not own the ticket with 403 Forbidden', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${otherRequesterToken}`)
      .send({ requesterIndicatesResolved: true });

    expect(res.status).toBe(403);
  });

  // TEST 3: Requester สามารถส่ง Advisory Note แจ้งว่าปัญหาเสร็จแล้วได้
  it('allows Requester to submit advisory resolution note without changing ticket status', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ requesterIndicatesResolved: true });

    expect(res.status).toBe(200);
    expect(res.body.ticket.status).toBe('IN_PROGRESS'); // สถานะต้องยังไม่เปลี่ยนเป็น RESOLVED
  });

  // TEST 4: ตรวจสอบ Transition Matrix ที่ผิดกฎ (Invalid Transition)
  it('rejects invalid status transition with 400 Bad Request', async () => {
    // จาก IN_PROGRESS พยายามกระโดดไป CLOSED โดยตรง (ต้องผ่าน RESOLVED ก่อน)
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid status transition/i);
  });

  // TEST 5: IT Staff สามารถเปลี่ยนสถานะตาม Transition Matrix ได้อย่างถูกต้อง (IN_PROGRESS -> RESOLVED)
  it('allows IT Staff to transition ticket to RESOLVED', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('RESOLVED');
  });

  // TEST 6: IT Staff ปิดงานตั๋วที่แก้แล้ว (RESOLVED -> CLOSED)
  it('allows IT Staff to close a RESOLVED ticket', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${resolvedTicketId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CLOSED');
  });

  // TEST 7: Stale Update / Concurrency Conflict (409 Conflict)
  it('rejects stale update with 409 Conflict when concurrency timestamp mismatches', async () => {
    const staleTime = new Date('2020-01-01T00:00:00Z').toISOString();

    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${staffToken}`)
      .send({
        status: 'CLOSED',
        updatedAt: staleTime,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('STALE_UPDATE_CONFLICT');
  });

  // TEST 8: Non-existent ticket returns 404 Not Found
  it('returns 404 Not Found when updating status of non-existent ticket', async () => {
    const res = await request(app)
      .patch('/api/tickets/999999/status')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'OPEN' });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/ticket not found/i);
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { ticketNo: { startsWith: 'TKT-WF-' } },
    });
  });
});
