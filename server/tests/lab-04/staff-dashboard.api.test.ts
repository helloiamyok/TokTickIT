import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('IT Staff Dashboard API (Lab 4)', () => {
  let staffToken: string;
  let requesterToken: string;
  let staffUserId: number;

  beforeAll(async () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'lab3-jwt-secret-key-334';
    const generateToken = (user: { id: number; email: string; role: string }) => {
      return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '1d',
      });
    };

    const staff = await prisma.user.findFirst({ where: { role: 'IT_STAFF' } });
    const requester = await prisma.user.findFirst({ where: { role: 'REQUESTER' } });

    if (!staff || !requester) {
      throw new Error('Seed data required: staff and requester users');
    }

    staffUserId = staff.id;
    staffToken = (staff as any).token || generateToken(staff);
    requesterToken = (requester as any).token || generateToken(requester);

    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();
    const categoryId = cat?.id || 1;
    const relatedSystemId = sys?.id || 1;

    // Seed specific tickets to guarantee metrics calculation
    await prisma.ticket.createMany({
      data: [
        {
          ticketNo: `TKT-DASH-STF-${Date.now()}-1`,
          summary: 'New Unassigned Issue',
          description: 'Testing new metric',
          requestedPriority: 'LOW',
          itPriority: 'LOW',
          currentStatus: 'NEW',
          requesterId: requester.id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-STF-${Date.now()}-2`,
          summary: 'Open Ticket for Team',
          description: 'Testing open metric',
          requestedPriority: 'MEDIUM',
          itPriority: 'MEDIUM',
          currentStatus: 'OPEN',
          requesterId: requester.id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-STF-${Date.now()}-3`,
          summary: 'Active In Progress Item',
          description: 'Assigned to current staff user',
          requestedPriority: 'HIGH',
          itPriority: 'HIGH',
          currentStatus: 'IN_PROGRESS',
          assignedToId: staffUserId,
          requesterId: requester.id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-STF-${Date.now()}-4`,
          summary: 'Pending User Feedback',
          description: 'Waiting for requester response',
          requestedPriority: 'MEDIUM',
          itPriority: 'MEDIUM',
          currentStatus: 'WAITING_FOR_REQUESTER',
          assignedToId: staffUserId,
          requesterId: requester.id,
          categoryId,
          relatedSystemId,
        },
      ],
    });
  });

  // TEST 1: Requester Access is Blocked (403 Forbidden)
  it('rejects Requester access to staff dashboard with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/dashboard/staff')
      .set('Authorization', `Bearer ${requesterToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/forbidden|staff access only/i);
  });

  // TEST 2: Unauthenticated Access is Blocked (401 Unauthorized)
  it('rejects unauthenticated access with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/dashboard/staff');
    expect(res.status).toBe(401);
  });

  // TEST 3: IT Staff Retrieves Accurate Aggregate Metrics and Recent Tickets
  it('allows IT Staff to retrieve staff dashboard metrics and recent tickets', async () => {
    const res = await request(app)
      .get('/api/dashboard/staff')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();

    const { metrics, recentTickets } = res.body;

    // Aggregate Metric counts must be numbers and reflect active counts
    expect(typeof metrics.new).toBe('number');
    expect(metrics.new).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.open).toBe('number');
    expect(metrics.open).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.inProgress).toBe('number');
    expect(metrics.inProgress).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.waitingForRequester).toBe('number');
    expect(metrics.waitingForRequester).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.myAssigned).toBe('number');
    expect(metrics.myAssigned).toBeGreaterThanOrEqual(2);

    // Recent Tickets Verification
    expect(Array.isArray(recentTickets)).toBe(true);
    expect(recentTickets.length).toBeGreaterThan(0);
    expect(recentTickets.length).toBeLessThanOrEqual(5);

    const firstTicket = recentTickets[0];
    expect(firstTicket.id).toBeDefined();
    expect(firstTicket.summary || firstTicket.title).toBeDefined();
    expect(firstTicket.status || firstTicket.currentStatus).toBeDefined();
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: { ticketNo: { startsWith: 'TKT-DASH-STF-' } },
    });
  });
});
