import { Router, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// ทุก Endpoint ใน Route นี้ต้องเป็น Administrator เท่านั้น
router.use(authenticate, requireRole(['ADMINISTRATOR']));

// 1. List Users with Search & Role Filter
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const search = (req.query.search as string)?.trim();
    const role = req.query.role as string;

    const where: any = {};
    if (role && role !== 'ALL') {
      where.role = role as Role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ data: users });
  } catch (error) {
    console.error('Failed to retrieve users:', error);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// 2. Create User
router.post('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, role, initialPassword, isActive = true } = req.body;

    if (!name || !email || !role || !initialPassword) {
      return res.status(400).json({ error: 'All fields including initial password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existing) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        role: role as Role,
        passwordHash,
        isActive: Boolean(isActive),
        mustChangePassword: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Failed to create user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// 3. Update User (with Safety Rules)
router.patch('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { name, email, role, isActive } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Safety Rule 1: Prevent self-deactivation
    if (isActive === false && req.user!.id === targetUserId) {
      return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    // Safety Rule 2: Prevent removing/deactivating the last active administrator
    if (targetUser.role === 'ADMINISTRATOR' && (isActive === false || (role && role !== 'ADMINISTRATOR'))) {
      const activeAdminCount = await prisma.user.count({
        where: { role: 'ADMINISTRATOR', isActive: true },
      });
      if (activeAdminCount <= 1) {
        return res.status(400).json({ error: 'Cannot deactivate or change role of the last active Administrator' });
      }
    }

    // Check duplicate email if changed
    if (email && email.toLowerCase().trim() !== targetUser.email.toLowerCase()) {
      const normalizedEmail = email.toLowerCase().trim();
      const duplicate = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (duplicate) {
        return res.status(400).json({ error: 'Email is already in use' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        name: name ? name.trim() : undefined,
        email: email ? email.toLowerCase().trim() : undefined,
        role: role ? (role as Role) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
      },
    });

    return res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// 4. Set New Initial Password
router.post('/users/:id/reset-password', async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = parseInt(req.params.id, 10);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const { newInitialPassword } = req.body;

    if (!newInitialPassword || typeof newInitialPassword !== 'string' || newInitialPassword.trim().length < 6) {
      return res.status(400).json({ error: 'Initial password must be at least 6 characters' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(newInitialPassword.trim(), 10);

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });

    return res.json({ message: 'New initial password set successfully. User must change it upon next login.' });
  } catch (error) {
    console.error('Failed to reset initial password:', error);
    return res.status(500).json({ error: 'Failed to reset initial password' });
  }
});

export default router;
