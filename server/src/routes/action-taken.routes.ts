import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Helper to resolve ticket by numeric ID or ticketNo
async function findTicket(paramId: string) {
  const numericId = parseInt(paramId, 10);
  if (!isNaN(numericId)) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: numericId },
    });
    if (ticket) return ticket;
  }
  return prisma.ticket.findUnique({
    where: { ticketNo: paramId },
  });
}

// 1. POST /api/tickets/:id/actions - Create Action Taken (IT Staff & Admin only)
router.post('/:id/actions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // 1. ตรวจสอบสิทธิ์ (เฉพาะ IT Staff / Admin)
    if (user.role !== 'IT_STAFF' && user.role !== 'ADMINISTRATOR') {
      return res.status(403).json({ error: 'Forbidden: Only IT Staff and Admin can record actions' });
    }

    const { actionDescription, result, followUpRequired, followUpNote, attachmentNotes, actionDateTime } = req.body;

    // 2. ตรวจสอบ Validation
    if (!actionDescription || typeof actionDescription !== 'string' || actionDescription.trim() === '' ||
        !result || typeof result !== 'string' || result.trim() === '') {
      return res.status(400).json({ error: 'Action description and result are required' });
    }

    const isFollowUp = Boolean(followUpRequired);
    if (isFollowUp && (!followUpNote || typeof followUpNote !== 'string' || followUpNote.trim() === '')) {
      return res.status(400).json({ error: 'Follow-up note is required when follow-up is requested' });
    }

    // 3. ตรวจสอบว่า Ticket มีอยู่จริง
    const ticket = await findTicket(req.params.id as string);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // 4. บันทึกลงฐานข้อมูล (Performed By กำหนดอัตโนมัติจาก authenticated user)
    const action = await prisma.actionTaken.create({
      data: {
        ticketId: ticket.id,
        actionDateTime: actionDateTime ? new Date(actionDateTime) : new Date(),
        actionDescription: actionDescription.trim(),
        result: result.trim(),
        performedById: user.id,
        followUpRequired: isFollowUp,
        followUpNote: isFollowUp ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes ? String(attachmentNotes).trim() : null,
      },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return res.status(201).json(action);
  } catch (error) {
    console.error('Error creating action taken:', error);
    return res.status(500).json({ error: 'Failed to record action taken' });
  }
});

// 2. GET /api/tickets/:id/actions - List Actions Taken
// สิทธิ์: IT Staff, Admin หรือ Requester ที่เป็นเจ้าของ Ticket เท่านั้น
router.get('/:id/actions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;

    // 1. ตรวจสอบว่า Ticket มีอยู่จริง
    const ticket = await findTicket(req.params.id as string);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // 2. ตรวจสอบสิทธิ์ Requester เข้าถึงได้เฉพาะตั๋วที่ตนเองเป็นเจ้าของ
    if (user.role === 'REQUESTER' && ticket.requesterId !== user.id) {
      return res.status(403).json({ error: 'Forbidden: Not the ticket owner' });
    }

    // 3. ดึงรายการ Actions Taken
    const actions = await prisma.actionTaken.findMany({
      where: { ticketId: ticket.id },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { actionDateTime: 'asc' },
    });

    return res.status(200).json(actions);
  } catch (error) {
    console.error('Error fetching actions taken:', error);
    return res.status(500).json({ error: 'Failed to fetch actions taken' });
  }
});

export default router;
