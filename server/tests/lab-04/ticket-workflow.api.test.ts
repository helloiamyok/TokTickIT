import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { prisma } from '../../src/lib/prisma';

describe('Ticket Workflow and Resolution Gate API (Lab 4)', () => {
  let itStaffToken: string;
  let requesterToken: string;
  let otherRequesterToken: string;
  let testTicketId: number;
  let otherTicketId: number;

  beforeAll(async () => {
    // 1. IT Staff Login
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'michael.brown@tiktockit.com', password: 'Password123!' });
    itStaffToken = staffRes.body.token || staffRes.headers['set-cookie'][0].split(';')[0].replace('token=', '');

    // 2. Requester 1 Login (Jennifer Anderson)
    const reqRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    requesterToken = reqRes.body.token || reqRes.headers['set-cookie'][0].split(';')[0].replace('token=', '');
    const requesterId = reqRes.body.user.id;

    // 3. Requester 2 Login (Amanda Clark)
    const req2Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amanda.clark@tiktockit.com', password: 'Password123!' });
    otherRequesterToken = req2Res.body.token || req2Res.headers['set-cookie'][0].split(';')[0].replace('token=', '');
    const otherRequesterId = req2Res.body.user.id;

    // Get categories and systems
    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();

    // 4. Create or reset Test Ticket 1 (Owned by Requester 1, IN_PROGRESS)
    const ticket1 = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-WF-${Date.now()}-1`,
        summary: 'Network VPN Dropping Under Load',
        description: 'Connection fails every 10 minutes when connected to VPN gateway.',
        requestedPriority: 'HIGH',
        itPriority: 'HIGH',
        currentStatus: 'IN_PROGRESS',
        requesterId,
        categoryId: cat?.id || 1,
        relatedSystemId: sys?.id || 1,
      },
    });
    testTicketId = ticket1.id;

    // 5. Create Test Ticket 2 (Owned by Requester 2, NEW)
    const ticket2 = await prisma.ticket.create({
      data: {
        ticketNo: `TKT-WF-${Date.now()}-2`,
        summary: 'Cannot Access Email Client',
        description: 'Outlook credentials rejected after reset.',
        requestedPriority: 'MEDIUM',
        itPriority: 'MEDIUM',
        currentStatus: 'NEW',
        requesterId: otherRequesterId,
        categoryId: cat?.id || 1,
        relatedSystemId: sys?.id || 1,
      },
    });
    otherTicketId = ticket2.id;
  });

  // -------------------------------------------------------------------------
  // Test 1: Resolution Gate - Requester cannot directly resolve ticket
  // -------------------------------------------------------------------------
  it('rejects Requester attempt to directly resolve ticket with 403 Forbidden (Resolution Gate)', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Resolution Gate/i);
  });

  // -------------------------------------------------------------------------
  // Test 2: Resolution Gate - Requester cannot directly close ticket
  // -------------------------------------------------------------------------
  it('rejects Requester attempt to directly close ticket with 403 Forbidden', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Resolution Gate/i);
  });

  // -------------------------------------------------------------------------
  // Test 3: Requester can submit advisory resolution note
  // -------------------------------------------------------------------------
  it('allows Requester to submit advisory resolution note without changing status directly', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ requesterResolvedNote: 'VPN reconnected and is working stably now' });

    expect(res.status).toBe(200);
    expect(res.body.requesterResolutionIndicated).toBe(true);

    // Verify ticket in DB still retains IN_PROGRESS status
    const verified = await prisma.ticket.findUnique({ where: { id: testTicketId } });
    expect(verified?.currentStatus).toBe('IN_PROGRESS');
    expect(verified?.requesterResolutionIndicated).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Test 4: Requester cannot modify status on another requester ticket
  // -------------------------------------------------------------------------
  it('rejects Requester attempt to modify ticket owned by another user with 403 Forbidden', async () => {
    // Requester 1 attempts to modify Ticket 2 (owned by Requester 2)
    const res = await request(app)
      .patch(`/api/tickets/${otherTicketId}/status`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ requesterResolvedNote: 'Malicious attempt' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden|not own/i);
  });

  // -------------------------------------------------------------------------
  // Test 5: Invalid Transition Matrix - Rejected with 400 Bad Request
  // -------------------------------------------------------------------------
  it('rejects invalid status transition with 400 Bad Request', async () => {
    // Attempting invalid transition from IN_PROGRESS directly to CLOSED
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${itStaffToken}`)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid status transition/i);
  });

  // -------------------------------------------------------------------------
  // Test 6: IT Staff moves IN_PROGRESS -> RESOLVED (Allowed transition)
  // -------------------------------------------------------------------------
  it('allows IT Staff to transition ticket to permitted next status (RESOLVED)', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${itStaffToken}`)
      .send({ status: 'RESOLVED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('RESOLVED');

    const check = await prisma.ticket.findUnique({ where: { id: testTicketId } });
    expect(check?.currentStatus).toBe('RESOLVED');
  });

  // -------------------------------------------------------------------------
  // Test 7: IT Staff moves RESOLVED -> CLOSED (Allowed transition)
  // -------------------------------------------------------------------------
  it('allows IT Staff to transition RESOLVED ticket to CLOSED', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${itStaffToken}`)
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('CLOSED');
  });

  // -------------------------------------------------------------------------
  // Test 8: IT Staff moves CLOSED -> REOPENED (Allowed transition)
  // -------------------------------------------------------------------------
  it('allows IT Staff to transition CLOSED ticket to REOPENED', async () => {
    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${itStaffToken}`)
      .send({ status: 'REOPENED' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('REOPENED');
  });

  // -------------------------------------------------------------------------
  // Test 9: Stale Update / Concurrency Conflict (409 Conflict)
  // -------------------------------------------------------------------------
  it('rejects stale update with 409 Conflict when concurrency timestamp mismatches', async () => {
    const staleTime = new Date('2020-01-01T00:00:00Z').toISOString();

    const res = await request(app)
      .patch(`/api/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${itStaffToken}`)
      .send({
        status: 'IN_PROGRESS',
        updatedAt: staleTime,
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('STALE_UPDATE_CONFLICT');
  });

  // -------------------------------------------------------------------------
  // Test 10: Non-existent ticket returns 404 Not Found
  // -------------------------------------------------------------------------
  it('returns 404 Not Found when updating status of non-existent ticket', async () => {
    const res = await request(app)
      .patch('/api/tickets/999999/status')
      .set('Authorization', `Bearer ${itStaffToken}`)
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
