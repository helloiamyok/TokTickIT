import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';

describe('Actions Taken Foundation API (Lab 4)', () => {
  let staffCookie: string;
  let staffUserId: number;
  let requester1Cookie: string;
  let requester3Cookie: string;
  let ticket1Id: number;
  let ticket3Id: number;

  beforeAll(async () => {
    // 1. Login as IT Staff (Michael Brown)
    const staffRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'michael.brown@tiktockit.com', password: 'Password123!' });
    staffCookie = staffRes.headers['set-cookie'][0];
    staffUserId = staffRes.body.user.id;

    // 2. Login as Requester 1 (Jennifer Anderson - owner of ticket 1)
    const req1Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    requester1Cookie = req1Res.headers['set-cookie'][0];

    // 3. Login as Requester 3 (Amanda Clark - owner of ticket 3)
    const req3Res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amanda.clark@tiktockit.com', password: 'Password123!' });
    requester3Cookie = req3Res.headers['set-cookie'][0];

    // 4. Retrieve ticket IDs from tickets list
    const ticketsRes = await request(app)
      .get('/api/tickets?limit=100')
      .set('Cookie', staffCookie);

    const tickets = ticketsRes.body.data;
    const t1 = tickets.find((t: any) => t.ticketNo === 'TKT-2026-001234') || tickets[0];
    const t3 = tickets.find((t: any) => t.ticketNo === 'TKT-2026-001236') || tickets[tickets.length - 1];

    ticket1Id = t1.id;
    ticket3Id = t3.id;
  });

  // ----------------------------------------------------
  // Test 1: IT Staff creates Action Taken (AC-01)
  // ----------------------------------------------------
  it('API-01: IT Staff records action taken successfully with automatic performedById (201 Created)', async () => {
    const payload = {
      actionDescription: 'Checked power adapter voltage and replaced with standard 65W charger',
      result: 'Laptop charging correctly at normal rate',
      followUpRequired: false,
      attachmentNotes: 'power_test_multimeter.png',
      // Attacker attempts to spoof performedById
      performedById: 99999,
    };

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', staffCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.ticketId).toBe(ticket1Id);
    expect(res.body.actionDescription).toBe(payload.actionDescription);
    expect(res.body.result).toBe(payload.result);
    expect(res.body.followUpRequired).toBe(false);
    expect(res.body.followUpNote).toBeNull();
    expect(res.body.attachmentNotes).toBe(payload.attachmentNotes);

    // Actor spoofing prevented: performedById must match authenticated user, not body payload
    expect(res.body.performedById).toBe(staffUserId);
    expect(res.body.performedBy).toBeDefined();
    expect(res.body.performedBy.id).toBe(staffUserId);
    expect(res.body.performedBy.role).toBe('IT_STAFF');
  });

  // ----------------------------------------------------
  // Test 2: Requester attempts to create Action Taken (AC-01 / Security)
  // ----------------------------------------------------
  it('API-02: Requester attempting to record action taken is rejected with 403 Forbidden', async () => {
    const payload = {
      actionDescription: 'Requester trying to perform maintenance',
      result: 'Unauthorized attempt',
      followUpRequired: false,
    };

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', requester1Cookie)
      .send(payload);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  // ----------------------------------------------------
  // Test 3: Validation - followUpRequired is true without followUpNote (AC-03)
  // ----------------------------------------------------
  it('API-03: Rejects action taken with 400 Bad Request when followUpRequired is true but followUpNote is empty', async () => {
    const payload = {
      actionDescription: 'Diagnosed intermittent network dropouts',
      result: 'Temporary switch port reassigned',
      followUpRequired: true,
      followUpNote: '', // Empty note should be rejected
    };

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', staffCookie)
      .send(payload);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/follow-up note is required/i);
  });

  it('API-03b: Accepts action taken with 201 Created when followUpRequired is true and followUpNote is provided', async () => {
    const payload = {
      actionDescription: 'Replaced thermal paste on heatsink',
      result: 'CPU temperature dropped by 18 degrees',
      followUpRequired: true,
      followUpNote: 'Monitor thermal logs again after 48 hours under workload',
    };

    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', staffCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.followUpRequired).toBe(true);
    expect(res.body.followUpNote).toBe(payload.followUpNote);
  });

  // ----------------------------------------------------
  // Test 4: Validation - Missing description or result
  // ----------------------------------------------------
  it('rejects action taken with 400 Bad Request when description or result is missing', async () => {
    const res = await request(app)
      .post(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', staffCookie)
      .send({ actionDescription: '' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // ----------------------------------------------------
  // Test 5: Non-existent ticket returns 404 Not Found
  // ----------------------------------------------------
  it('returns 404 Not Found when creating action taken for non-existent ticket', async () => {
    const res = await request(app)
      .post('/api/tickets/999999/actions')
      .set('Cookie', staffCookie)
      .send({
        actionDescription: 'Testing missing ticket',
        result: 'Should fail with 404',
        followUpRequired: false,
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/ticket not found/i);
  });

  // ----------------------------------------------------
  // Test 6: IT Staff retrieves actions list
  // ----------------------------------------------------
  it('API-04: IT Staff retrieves all actions taken for a ticket (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    const firstAction = res.body[0];
    expect(firstAction).toHaveProperty('id');
    expect(firstAction).toHaveProperty('ticketId', ticket1Id);
    expect(firstAction).toHaveProperty('actionDateTime');
    expect(firstAction).toHaveProperty('actionDescription');
    expect(firstAction).toHaveProperty('result');
    expect(firstAction).toHaveProperty('performedBy');
    expect(firstAction.performedBy).toHaveProperty('name');
  });

  // ----------------------------------------------------
  // Test 7: Requester retrieves actions for their own ticket
  // ----------------------------------------------------
  it('Requester can view actions taken for their owned ticket (200 OK)', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', requester1Cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ----------------------------------------------------
  // Test 8: Requester forbidden from viewing another requester ticket actions
  // ----------------------------------------------------
  it('Requester is rejected with 403 Forbidden when accessing actions on another requester ticket', async () => {
    // Requester 3 (Amanda) tries to view actions on Ticket 1 (Jennifer's ticket)
    const res = await request(app)
      .get(`/api/tickets/${ticket1Id}/actions`)
      .set('Cookie', requester3Cookie);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
  });

  // ----------------------------------------------------
  // Test 9: Empty state - Ticket with 0 actions returns []
  // ----------------------------------------------------
  it('returns empty array [] for ticket with 0 actions taken', async () => {
    const res = await request(app)
      .get(`/api/tickets/${ticket3Id}/actions`)
      .set('Cookie', staffCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });
});
