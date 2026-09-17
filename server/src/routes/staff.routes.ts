import { Router, Response } from 'express';
import { PrismaClient, Prisma, TicketStatus, Priority } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// GET /api/staff/tickets - IT Staff and Administrator ticket queue
router.get(
  '/tickets',
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
      const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
      const skip = (page - 1) * limit;

      const search = (req.query.search as string)?.trim();
      const status = req.query.status as string;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string, 10) : undefined;
      const itPriority = req.query.itPriority as string;
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'asc' ? 'asc' : 'desc';

      const where: Prisma.TicketWhereInput = {};

      if (search) {
        where.OR = [
          { ticketNo: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status && status !== 'ALL') {
        where.currentStatus = status as TicketStatus;
      }

      if (categoryId && !isNaN(categoryId)) {
        where.categoryId = categoryId;
      }

      if (itPriority && itPriority !== 'ALL') {
        where.itPriority = itPriority as Priority;
      }

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            requester: { select: { id: true, name: true, email: true } },
            assignedTo: { select: { id: true, name: true, email: true } },
            category: true,
            relatedSystem: true,
          },
        }),
        prisma.ticket.count({ where }),
      ]);

      return res.json({
        data: tickets.map((t) => ({
          ...t,
          status: t.currentStatus,
          ticketNumber: t.ticketNo,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      });
    } catch (error) {
      console.error('Staff queue retrieval error:', error);
      return res.status(500).json({ error: 'Failed to retrieve ticket queue' });
    }
  }
);

export default router;
