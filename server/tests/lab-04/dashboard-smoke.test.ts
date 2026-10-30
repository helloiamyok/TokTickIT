import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app';
import { prisma } from '../../src/lib/prisma';

describe('Dashboard API Smoke Tests (Issue 5 Verification)', () => {
  let staffToken: string;
  let requesterToken: string;

  beforeAll(async () => {
    const JWT_SECRET = process.env.JWT_SECRET || 'lab3-jwt-secret-key-334';
    const generateToken = (user: { id: number; email: string; role: string }) => {
      return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: '1d',
      });
    };

    const staffUser = await prisma.user.findFirst({ where: { role: 'IT_STAFF' } });
    const requesterUser = await prisma.user.findFirst({ where: { role: 'REQUESTER' } });

    if (!staffUser || !requesterUser) {
      throw new Error('Prisma seed data required: staff and requester users');
    }

    staffToken = (staffUser as any).token || generateToken(staffUser);
    requesterToken = (requesterUser as any).token || generateToken(requesterUser);
  });

  // Smoke 1: GET /api/dashboard/staff must return 401 without token
  it('SMOKE-01: GET /api/dashboard/staff returns 401 when no token is provided', async () => {
    const res = await request(app).get('/api/dashboard/staff');
    expect(res.status).toBe(401);
  });

  // Smoke 2: GET /api/dashboard/staff must return 403 for requester
  it('SMOKE-02: GET /api/dashboard/staff returns 403 Forbidden for requester role', async () => {
    const res = await request(app)
      .get('/api/dashboard/staff')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toMatch(/forbidden|staff access only/i);
  });

  // Smoke 3: GET /api/dashboard/staff must return 200 for staff
  it('SMOKE-03: GET /api/dashboard/staff returns 200 OK for IT staff', async () => {
    const res = await request(app)
      .get('/api/dashboard/staff')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('metrics');
    expect(res.body.metrics).toHaveProperty('new');
    expect(res.body.metrics).toHaveProperty('open');
    expect(res.body.metrics).toHaveProperty('inProgress');
    expect(res.body.metrics).toHaveProperty('waitingForRequester');
    expect(res.body.metrics).toHaveProperty('myAssigned');
    expect(res.body).toHaveProperty('recentTickets');
  });

  // Smoke 4: GET /api/dashboard/requester must return 200 for requester
  it('SMOKE-04: GET /api/dashboard/requester returns 200 OK for requester', async () => {
    const res = await request(app)
      .get('/api/dashboard/requester')
      .set('Authorization', `Bearer ${requesterToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('metrics');
    expect(res.body.metrics).toHaveProperty('openTickets');
    expect(res.body.metrics).toHaveProperty('inProgress');
    expect(res.body.metrics).toHaveProperty('resolved');
    expect(res.body.metrics).toHaveProperty('closed');
    expect(res.body).toHaveProperty('recentTickets');
  });
});
