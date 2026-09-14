import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../src/index';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Sprint 3 Auth API Tests', () => {
  let staffTokenCookie: string;
  let firstLoginCookie: string;

  beforeAll(async () => {
    const defaultHash = await bcrypt.hash('Password123!', 10);
    const initialHash = await bcrypt.hash('Initial123!', 10);

    await prisma.user.updateMany({
      where: { email: 'michael.brown@tiktockit.com' },
      data: { passwordHash: defaultHash, isActive: true, mustChangePassword: false },
    });

    await prisma.user.updateMany({
      where: { email: 'kevin.patel@tiktockit.com' },
      data: { passwordHash: defaultHash, isActive: false, mustChangePassword: false },
    });

    await prisma.user.updateMany({
      where: { email: 'emily.davis@tiktockit.com' },
      data: { passwordHash: initialHash, isActive: true, mustChangePassword: true },
    });
  });

  it('API-01: Valid login returns 200 and sanitized user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'michael.brown@tiktockit.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(200);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.role).toBe('IT_STAFF');
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.headers['set-cookie']).toBeDefined();

    const cookies = res.headers['set-cookie'];
    staffTokenCookie = Array.isArray(cookies) ? cookies[0] : cookies || '';
  });

  it('API-02: Invalid credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'michael.brown@tiktockit.com',
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  it('API-03: Inactive user login returns 403', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'kevin.patel@tiktockit.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('deactivated');
  });

  it('API-04: GET /api/auth/me with session cookie returns authenticated user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', staffTokenCookie);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('michael.brown@tiktockit.com');
  });

  it('API-05: Change password validates complexity and updates password successfully', async () => {
    // 1. Login as user requiring password change
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'emily.davis@tiktockit.com',
        password: 'Initial123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user.mustChangePassword).toBe(true);
    const cookies = loginRes.headers['set-cookie'];
    firstLoginCookie = Array.isArray(cookies) ? cookies[0] : cookies || '';

    // 2. Reject weak password
    const weakRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', firstLoginCookie)
      .send({
        currentPassword: 'Initial123!',
        newPassword: 'weak',
      });

    expect(weakRes.status).toBe(400);

    // 3. Accept strong password
    const changeRes = await request(app)
      .post('/api/auth/change-password')
      .set('Cookie', firstLoginCookie)
      .send({
        currentPassword: 'Initial123!',
        newPassword: 'NewSecurePass123!',
      });

    expect(changeRes.status).toBe(200);
  });

  it('API-06: POST /api/auth/logout clears session token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/logged out/i);
  });
});
