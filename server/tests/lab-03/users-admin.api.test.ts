import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Administrator User Management API Tests', () => {
  let adminCookie: string;
  let requesterCookie: string;
  let adminId: number;

  beforeAll(async () => {
    const defaultHash = await bcrypt.hash('Password123!', 10);

    // Ensure Admin account exists and is active
    const adminUser = await prisma.user.upsert({
      where: { email: 'john.smith@tiktockit.com' },
      update: { passwordHash: defaultHash, role: 'ADMINISTRATOR', isActive: true, mustChangePassword: false },
      create: {
        name: 'John Smith',
        email: 'john.smith@tiktockit.com',
        passwordHash: defaultHash,
        role: 'ADMINISTRATOR',
        isActive: true,
        mustChangePassword: false,
      },
    });

    // Ensure a second Admin exists to allow testing safety rules without depleting active admin count
    await prisma.user.upsert({
      where: { email: 'admin@tiktockit.com' },
      update: { passwordHash: defaultHash, role: 'ADMINISTRATOR', isActive: true, mustChangePassword: false },
      create: {
        name: 'System Administrator',
        email: 'admin@tiktockit.com',
        passwordHash: defaultHash,
        role: 'ADMINISTRATOR',
        isActive: true,
        mustChangePassword: false,
      },
    });

    // Ensure Requester account exists
    await prisma.user.upsert({
      where: { email: 'jennifer.anderson@tiktockit.com' },
      update: { passwordHash: defaultHash, role: 'REQUESTER', isActive: true, mustChangePassword: false },
      create: {
        name: 'Jennifer Anderson',
        email: 'jennifer.anderson@tiktockit.com',
        passwordHash: defaultHash,
        role: 'REQUESTER',
        isActive: true,
        mustChangePassword: false,
      },
    });

    // Ensure IT Staff account exists
    await prisma.user.upsert({
      where: { email: 'michael.brown@tiktockit.com' },
      update: { passwordHash: defaultHash, role: 'IT_STAFF', isActive: true, mustChangePassword: false },
      create: {
        name: 'Michael Brown',
        email: 'michael.brown@tiktockit.com',
        passwordHash: defaultHash,
        role: 'IT_STAFF',
        isActive: true,
        mustChangePassword: false,
      },
    });

    // ล็อกอินด้วยบัญชี Administrator
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.smith@tiktockit.com', password: 'Password123!' });
    adminCookie = adminRes.headers['set-cookie'][0];
    adminId = adminRes.body.user ? adminRes.body.user.id : adminUser.id;

    // ล็อกอินด้วยบัญชี Requester เพื่อทดสอบ Forbidden access
    const reqRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jennifer.anderson@tiktockit.com', password: 'Password123!' });
    requesterCookie = reqRes.headers['set-cookie'][0];
  });

  it('API-ADMIN-01: Non-administrators receive 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Cookie', requesterCookie);

    expect(res.status).toBe(403);
  });

  it('API-ADMIN-02: Administrator can view user list with optional search and role filter', async () => {
    const res = await request(app)
      .get('/api/admin/users?role=IT_STAFF')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((u: any) => {
      expect(u.role).toBe('IT_STAFF');
    });
  });

  it('API-ADMIN-03: Administrator creates a new user with initial password and single role', async () => {
    const uniqueEmail = `testuser_${Date.now()}@tiktockit.com`;
    const res = await request(app)
      .post('/api/admin/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'New Test User',
        email: uniqueEmail,
        role: 'REQUESTER',
        initialPassword: 'TempPassword123!',
        isActive: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe(uniqueEmail);
    expect(res.body.mustChangePassword).toBe(true);
  });

  it('API-ADMIN-04: Rejects duplicate email addresses with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/admin/users')
      .set('Cookie', adminCookie)
      .send({
        name: 'Duplicate Admin',
        email: 'john.smith@tiktockit.com',
        role: 'IT_STAFF',
        initialPassword: 'TempPassword123!',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('API-ADMIN-05 (Safety): Administrator cannot deactivate their own account (BR-06)', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${adminId}`)
      .set('Cookie', adminCookie)
      .send({ isActive: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/cannot deactivate your own account/i);
  });

  it('API-ADMIN-06: Administrator can set a new initial password', async () => {
    // ดึง user คนแรกที่ไม่ใช่ตนเอง
    const listRes = await request(app)
      .get('/api/admin/users')
      .set('Cookie', adminCookie);
    const targetUser = listRes.body.data.find((u: any) => u.id !== adminId);
    expect(targetUser).toBeDefined();

    const res = await request(app)
      .post(`/api/admin/users/${targetUser.id}/reset-password`)
      .set('Cookie', adminCookie)
      .send({ newInitialPassword: 'ResetPassword123!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
