import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Sprint 3 Authorization & Requester Regression Tests', () => {
  let requester1Cookie: string;
  let requester2Cookie: string;
  let itStaffCookie: string;
  let categoryId: number = 2;
  let relatedSystemId: number = 1;

  beforeAll(async () => {
    const defaultHash = await bcrypt.hash('Password123!', 10);

    // Ensure test users exist with active status and standard password
    await prisma.user.upsert({
      where: { email: 'jennifer.anderson@tiktockit.com' },
      update: { passwordHash: defaultHash, isActive: true, mustChangePassword: false },
      create: {
        email: 'jennifer.anderson@tiktockit.com',
        passwordHash: defaultHash,
        name: 'Jennifer Anderson',
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false,
      },
    });

    await prisma.user.upsert({
      where: { email: 'amanda.clark@tiktockit.com' },
      update: { passwordHash: defaultHash, isActive: true, mustChangePassword: false },
      create: {
        email: 'amanda.clark@tiktockit.com',
        passwordHash: defaultHash,
        name: 'Amanda Clark',
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false,
      },
    });

    await prisma.user.upsert({
      where: { email: 'michael.brown@tiktockit.com' },
      update: { passwordHash: defaultHash, isActive: true, mustChangePassword: false },
      create: {
        email: 'michael.brown@tiktockit.com',
        passwordHash: defaultHash,
        name: 'Michael Brown',
        role: 'IT_STAFF',
        isActive: true,
        mustChangePassword: false,
      },
    });

    const cat = await prisma.category.findFirst();
    if (cat) categoryId = cat.id;

    const sys = await prisma.relatedSystem.findFirst();
    if (sys) relatedSystemId = sys.id;

    // ล็อกอิน Jennifer Anderson (Requester 1)
    const res1 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    const cookies1 = res1.headers['set-cookie'];
    requester1Cookie = Array.isArray(cookies1) ? cookies1[0] : cookies1 || '';

    // ล็อกอิน Amanda Clark (Requester 2)
    const res2 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'amanda.clark@tiktockit.com', password: 'Password123!' });
    const cookies2 = res2.headers['set-cookie'];
    requester2Cookie = Array.isArray(cookies2) ? cookies2[0] : cookies2 || '';

    // ล็อกอิน Michael Brown (IT Staff)
    const resStaff = await request(app)
      .post('/api/auth/login')
      .send({ email: 'michael.brown@tiktockit.com', password: 'Password123!' });
    const cookiesStaff = resStaff.headers['set-cookie'];
    itStaffCookie = Array.isArray(cookiesStaff) ? cookiesStaff[0] : cookiesStaff || '';
  });

  it('API-AUTH-01: Requesters can retrieve their own tickets successfully', async () => {
    const res = await request(app)
      .get('/api/tickets')
      .set('Cookie', requester1Cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('API-AUTH-02: Requester cannot view tickets owned by another requester (AC-03)', async () => {
    // สร้างตั๋วด้วย Requester 2
    const createRes = await request(app)
      .post('/api/tickets')
      .set('Cookie', requester2Cookie)
      .send({
        summary: 'Secret Hardware Ticket',
        description: 'Private confidential hardware issue',
        categoryId,
        relatedSystemId,
        requestedPriority: 'HIGH',
      });

    const ticketId = createRes.body.id;

    // Requester 1 พยายามแอบดูตั๋วของ Requester 2
    const unauthorizedRes = await request(app)
      .get(`/api/tickets/${ticketId}`)
      .set('Cookie', requester1Cookie);

    expect(unauthorizedRes.status).toBe(403);
    expect(unauthorizedRes.body.error).toContain('forbidden');
  });

  it('API-AUTH-03: IT Staff can view any requester ticket', async () => {
    // ดึงตั๋วใบเดียวกันด้วย IT Staff
    const res = await request(app)
      .get('/api/tickets')
      .set('Cookie', itStaffCookie);

    expect(res.status).toBe(200);
  });
});
