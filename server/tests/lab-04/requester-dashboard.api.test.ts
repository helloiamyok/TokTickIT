import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Requester Dashboard API (Lab 4)', () => {
  let requester1Token: string;
  let requester2Token: string;
  let requester1Id: number;
  let requester2Id: number;

  beforeAll(async () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'lab3-jwt-secret-key-334';
    const generateToken = (user: { id: number; email: string; role: string }) => {
      return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '1d',
      });
    };

    const requester1 = await prisma.user.findFirst({ where: { role: 'REQUESTER' } });
    const requester2 = await prisma.user.findFirst({
      where: { role: 'REQUESTER', NOT: { id: requester1?.id } },
    });

    if (!requester1 || !requester2) {
      throw new Error('Seed data required: at least 2 requester users');
    }

    requester1Id = requester1.id;
    requester2Id = requester2.id;
    requester1Token = (requester1 as any).token || generateToken(requester1);
    requester2Token = (requester2 as any).token || generateToken(requester2);

    const cat = await prisma.category.findFirst();
    const sys = await prisma.relatedSystem.findFirst();
    const categoryId = cat?.id || 1;
    const relatedSystemId = sys?.id || 1;

    // Seed tickets for Requester 1
    await prisma.ticket.createMany({
      data: [
        {
          ticketNo: `TKT-DASH-REQ1-${Date.now()}-1`,
          summary: 'Requester 1 New Issue',
          description: 'Testing new count',
          requestedPriority: 'LOW',
          itPriority: 'LOW',
          currentStatus: 'NEW',
          requesterId: requester1Id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-REQ1-${Date.now()}-2`,
          summary: 'Requester 1 Open Issue',
          description: 'Testing open count',
          requestedPriority: 'MEDIUM',
          itPriority: 'MEDIUM',
          currentStatus: 'OPEN',
          requesterId: requester1Id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-REQ1-${Date.now()}-3`,
          summary: 'Requester 1 In Progress',
          description: 'Testing in progress count',
          requestedPriority: 'HIGH',
          itPriority: 'HIGH',
          currentStatus: 'IN_PROGRESS',
          requesterId: requester1Id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-REQ1-${Date.now()}-4`,
          summary: 'Requester 1 Resolved',
          description: 'Testing resolved count',
          requestedPriority: 'MEDIUM',
          itPriority: 'MEDIUM',
          currentStatus: 'RESOLVED',
          requesterId: requester1Id,
          categoryId,
          relatedSystemId,
        },
        {
          ticketNo: `TKT-DASH-REQ1-${Date.now()}-5`,
          summary: 'Requester 1 Closed',
          description: 'Testing closed count',
          requestedPriority: 'LOW',
          itPriority: 'LOW',
          currentStatus: 'CLOSED',
          requesterId: requester1Id,
          categoryId,
          relatedSystemId,
        },
      ],
    });

    // Seed tickets for Requester 2 (Ownership isolation verification)
    await prisma.ticket.createMany({
      data: [
        {
          ticketNo: `TKT-DASH-REQ2-${Date.now()}-1`,
          summary: 'Requester 2 Confidential Issue',
          description: 'Must never appear in requester 1 dashboard',
          requestedPriority: 'URGENT',
          itPriority: 'URGENT',
          currentStatus: 'OPEN',
          requesterId: requester2Id,
          categoryId,
          relatedSystemId,
        },
      ],
    });
  });

  // TEST 1: Unauthenticated Access is Blocked (401 Unauthorized)
  it('rejects unauthenticated access with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/dashboard/requester');
    expect(res.status).toBe(401);
  });

  // TEST 2: Requester Retrieves Accurate Metrics
  it('allows Requester to fetch their own dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/dashboard/requester')
      .set('Authorization', `Bearer ${requester1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();

    const { metrics, recentTickets } = res.body;

    // openTickets aggregates NEW and OPEN
    expect(typeof metrics.openTickets).toBe('number');
    expect(metrics.openTickets).toBeGreaterThanOrEqual(2);

    expect(typeof metrics.inProgress).toBe('number');
    expect(metrics.inProgress).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.resolved).toBe('number');
    expect(metrics.resolved).toBeGreaterThanOrEqual(1);

    expect(typeof metrics.closed).toBe('number');
    expect(metrics.closed).toBeGreaterThanOrEqual(1);

    expect(Array.isArray(recentTickets)).toBe(true);
    expect(recentTickets.length).toBeGreaterThan(0);
    expect(recentTickets.length).toBeLessThanOrEqual(5);
  });

  // TEST 3: Ownership Protection - No Cross-Requester Data Leakage
  it('enforces ownership protection so Requester only receives their own recent tickets', async () => {
    const res = await request(app)
      .get('/api/dashboard/requester')
      .set('Authorization', `Bearer ${requester1Token}`);

    expect(res.status).toBe(200);
    const { recentTickets } = res.body;

    // Verify none of Requester 2's tickets leak into Requester 1's dashboard
    const requester2Ticket = recentTickets.find((t: any) =>
      t.summary?.includes('Requester 2 Confidential Issue') ||
      t.title?.includes('Requester 2 Confidential Issue')
    );
    expect(requester2Ticket).toBeUndefined();

    // Verify all returned recent tickets belong to Requester 1 in database
    const ticketIds = recentTickets.map((t: any) => t.id);
    const dbTickets = await prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      select: { requesterId: true },
    });
    dbTickets.forEach((t) => {
      expect(t.requesterId).toBe(requester1Id);
    });
  });

  afterAll(async () => {
    await prisma.ticket.deleteMany({
      where: {
        OR: [
          { ticketNo: { startsWith: 'TKT-DASH-REQ1-' } },
          { ticketNo: { startsWith: 'TKT-DASH-REQ2-' } },
        ],
      },
    });
  });
});
