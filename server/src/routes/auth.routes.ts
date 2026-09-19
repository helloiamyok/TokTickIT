import 'dotenv/config';
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'lab3-jwt-secret-key-334';

// 1. POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    // ตรวจสอบอีเมลและรหัสผ่าน
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // BR-01: ผู้ใช้ต้อง active เท่านั้น
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Please contact an administrator.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ส่ง cookie กลับไป
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 2. GET /api/auth/me
router.get('/me', authenticate, async (req: Request, res: Response) => {
  return res.status(200).json({ user: req.user });
});

// 3. POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    if (!newPassword) {
      return res.status(400).json({ error: 'New password is required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password if provided or if not in mustChangePassword state
    if (currentPassword) {
      if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
    }

    // Password Complexity Rule: At least 8 characters, at most 128 characters, contains a letter and a number
    if (newPassword.length < 8 || newPassword.length > 128) {
      return res.status(400).json({
        error: 'Password must be between 8 and 128 characters long.',
      });
    }

    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        error: 'Password must contain at least one letter and one number.',
      });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        mustChangePassword: false, // ปลดล็อกสถานะ
      },
    });

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error changing password' });
  }
});

// 4. POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out successfully' });
});

export default router;