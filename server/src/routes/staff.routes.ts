import { Router, Response } from 'express';
import { PrismaClient, Prisma, TicketStatus, Priority } from '@prisma/client';
import { authenticate, requireRole, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Permitted status transitions matrix (BR-11)
const PERMITTED_TRANSITIONS: Record<string, string[]> = {
  NEW: ['OPEN', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  REOPENED: ['IN_PROGRESS', 'CANCELLED'],
  CLOSED: [],
  CANCELLED: []
};

// GET /api/staff/tickets - IT Staff and Administrator ticket queue
router.get(
  ['/tickets', '/api/staff/tickets'],
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
            requester: { select: { id: true, name: true, email: true, role: true } },
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
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

// GET /api/staff/tickets/:id - IT Staff and Administrator ticket detail
router.get(
  ['/tickets/:id', '/api/staff/tickets/:id'],
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({
        where: { id: ticketId },
        include: {
          category: true,
          relatedSystem: true,
          requester: { select: { id: true, name: true, email: true, role: true } },
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          attachments: { where: { isDeleted: false } },
        },
      });

      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      return res.json({
        ...ticket,
        status: ticket.currentStatus,
        ticketNumber: ticket.ticketNo,
      });
    } catch (error) {
      console.error('Staff ticket detail retrieval error:', error);
      return res.status(500).json({ error: 'Failed to retrieve ticket' });
    }
  }
);

// 1. Assign / Claim Ticket (BR-02, AC-02)
router.patch(
  ['/tickets/:id/assign', '/api/staff/tickets/:id/assign'],
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const { assignedToId } = req.body;

      if (assignedToId) {
        const staffUser = await prisma.user.findUnique({ where: { id: assignedToId } });
        if (!staffUser || !staffUser.isActive || staffUser.role === 'REQUESTER') {
          return res.status(400).json({ error: 'Assigned user must be an active IT Staff or Administrator' });
        }
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { assignedToId: assignedToId || null },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          requester: { select: { id: true, name: true, email: true, role: true } },
          category: true,
          relatedSystem: true,
        }
      });

      return res.json({
        ...updatedTicket,
        status: updatedTicket.currentStatus,
        ticketNumber: updatedTicket.ticketNo,
      });
    } catch (error) {
      console.error('Failed to assign ticket:', error);
      return res.status(500).json({ error: 'Failed to assign ticket' });
    }
  }
);

// 2. Update IT Priority (BR-12)
router.patch(
  ['/tickets/:id/priority', '/api/staff/tickets/:id/priority'],
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const { itPriority } = req.body;

      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(itPriority)) {
        return res.status(400).json({ error: 'Invalid IT Priority value' });
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { itPriority: itPriority as Priority },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          requester: { select: { id: true, name: true, email: true, role: true } },
          category: true,
          relatedSystem: true,
        }
      });

      return res.json({
        ...updatedTicket,
        status: updatedTicket.currentStatus,
        ticketNumber: updatedTicket.ticketNo,
      });
    } catch (error) {
      console.error('Failed to update priority:', error);
      return res.status(500).json({ error: 'Failed to update priority' });
    }
  }
);

// 3. Update Status (with Transition Matrix validation - BR-11)
router.patch(
  ['/tickets/:id/status', '/api/staff/tickets/:id/status'],
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      const { status } = req.body;

      const allowedNext = PERMITTED_TRANSITIONS[ticket.currentStatus] || [];
      if (!allowedNext.includes(status)) {
        return res.status(422).json({
          error: `Invalid transition from ${ticket.currentStatus} to ${status}`
        });
      }

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { currentStatus: status as TicketStatus },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          requester: { select: { id: true, name: true, email: true, role: true } },
          category: true,
          relatedSystem: true,
        }
      });

      return res.json({
        ...updatedTicket,
        status: updatedTicket.currentStatus,
        ticketNumber: updatedTicket.ticketNo,
      });
    } catch (error) {
      console.error('Failed to update status:', error);
      return res.status(500).json({ error: 'Failed to update status' });
    }
  }
);

// 4. Requester Indicate Resolved (BR-05)
router.patch(
  ['/tickets/:id/indicate-resolved', '/api/tickets/:id/indicate-resolved', '/tickets/:id/resolution-feedback', '/api/tickets/:id/resolution-feedback'],
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        return res.status(404).json({ error: 'Ticket not found' });
      }

      if (req.user!.role === 'REQUESTER' && ticket.requesterId !== req.user!.id) {
        return res.status(403).json({ error: 'Not the ticket owner' });
      }

      const { problemAppearsResolved, requesterResolutionIndicated } = req.body || {};
      const value = typeof requesterResolutionIndicated === 'boolean'
        ? requesterResolutionIndicated
        : (typeof problemAppearsResolved === 'boolean' ? problemAppearsResolved : true);

      const updatedTicket = await prisma.ticket.update({
        where: { id: ticketId },
        data: { requesterResolutionIndicated: value },
        include: {
          assignedTo: { select: { id: true, name: true, email: true, role: true } },
          requester: { select: { id: true, name: true, email: true, role: true } },
          category: true,
          relatedSystem: true,
        }
      });

      return res.json({
        ...updatedTicket,
        status: updatedTicket.currentStatus,
        ticketNumber: updatedTicket.ticketNo,
      });
    } catch (error) {
      console.error('Failed to indicate resolution:', error);
      return res.status(500).json({ error: 'Failed to indicate resolution' });
    }
  }
);

// 5. Comments (Public) & Notes (Internal)
// GET /api/tickets/:id/comments (Public comments only)
router.get(
  ['/tickets/:id/comments', '/api/tickets/:id/comments'],
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      if (req.user!.role === 'REQUESTER' && ticket.requesterId !== req.user!.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const comments = await prisma.ticketComment.findMany({
        where: { ticketId, isInternal: false },
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      });
      return res.json({ data: comments });
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
  }
);

// POST /api/tickets/:id/comments (Create Public comment)
router.post(
  ['/tickets/:id/comments', '/api/tickets/:id/comments'],
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const { content } = req.body;

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      if (req.user!.role === 'REQUESTER' && ticket.requesterId !== req.user!.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const comment = await prisma.ticketComment.create({
        data: {
          ticketId,
          authorId: req.user!.id,
          content: content.trim(),
          isInternal: false
        },
        include: { author: { select: { id: true, name: true, role: true } } }
      });
      return res.status(201).json(comment);
    } catch (error) {
      console.error('Failed to create comment:', error);
      return res.status(500).json({ error: 'Failed to create comment' });
    }
  }
);

// GET /api/staff/tickets/:id/internal-notes (IT Staff & Admin only)
router.get(
  ['/tickets/:id/internal-notes', '/api/staff/tickets/:id/internal-notes'],
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      const notes = await prisma.ticketComment.findMany({
        where: { ticketId, isInternal: true },
        include: { author: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' }
      });
      return res.json({ data: notes });
    } catch (error) {
      console.error('Failed to fetch internal notes:', error);
      return res.status(500).json({ error: 'Failed to fetch internal notes' });
    }
  }
);

// POST /api/staff/tickets/:id/internal-notes (IT Staff & Admin only)
router.post(
  ['/tickets/:id/internal-notes', '/api/staff/tickets/:id/internal-notes'],
  authenticate,
  requireRole(['IT_STAFF', 'ADMINISTRATOR']),
  async (req: AuthRequest, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id, 10);
      if (isNaN(ticketId)) {
        return res.status(400).json({ error: 'Invalid ticket ID' });
      }

      const { content } = req.body;

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

      const note = await prisma.ticketComment.create({
        data: {
          ticketId,
          authorId: req.user!.id,
          content: content.trim(),
          isInternal: true
        },
        include: { author: { select: { id: true, name: true, role: true } } }
      });
      return res.status(201).json(note);
    } catch (error) {
      console.error('Failed to create internal note:', error);
      return res.status(500).json({ error: 'Failed to create internal note' });
    }
  }
);

export default router;
