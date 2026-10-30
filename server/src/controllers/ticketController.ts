import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { ALLOWED_TRANSITIONS, TicketStatus } from '../constants/ticketWorkflow';
import { AuthRequest } from '../middlewares/auth.middleware';

// Helper to resolve ticket by numeric ID or ticketNo
async function findTicket(paramId: string) {
  const numericId = parseInt(paramId, 10);
  if (!isNaN(numericId)) {
    const ticket = await prisma.ticket.findUnique({
      where: { id: numericId },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        relatedSystem: true,
      },
    });
    if (ticket) return ticket;
  }
  return prisma.ticket.findUnique({
    where: { ticketNo: paramId },
    include: {
      requester: { select: { id: true, name: true, email: true, role: true } },
      assignedTo: { select: { id: true, name: true, email: true, role: true } },
      category: true,
      relatedSystem: true,
    },
  });
}

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status: nextStatus, requesterResolvedNote, updatedAt: clientUpdatedAt } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const ticket = await findTicket(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // --- Concurrency / Stale Update Guard (BR-04 / Section 5) ---
    if (clientUpdatedAt) {
      const serverTime = new Date(ticket.updatedAt).getTime();
      const clientTime = new Date(clientUpdatedAt).getTime();
      if (!isNaN(clientTime) && Math.abs(serverTime - clientTime) > 1000) {
        return res.status(409).json({
          error: 'Ticket has been modified by another user. Please refresh and try again.',
          code: 'STALE_UPDATE_CONFLICT',
        });
      }
    }

    // --- กฎสำหรับ REQUESTER ---
    if (user.role === 'REQUESTER') {
      // ตรวจสอบความเป็นเจ้าของตั๋ว
      if (ticket.requesterId !== user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
      }

      // Resolution Gate: Requester ไม่มีสิทธิ์เปลี่ยนสถานะตั๋วเป็น RESOLVED หรือ CLOSED ได้โดยตรง
      if (nextStatus === 'RESOLVED' || nextStatus === 'CLOSED') {
        return res.status(403).json({
          error: 'Resolution Gate: Requesters cannot resolve tickets directly. IT Staff review is required.',
        });
      }

      // อนุญาตให้ Requester ระบุข้อแนะนำ (Advisory) ว่าปัญหาได้รับการแก้ไขแล้วได้
      if (requesterResolvedNote !== undefined || req.body.indicateResolved === true) {
        const note = typeof requesterResolvedNote === 'string' ? requesterResolvedNote.trim() : 'Problem reported as resolved by requester';
        const updatedTicket = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            requesterResolutionIndicated: true,
            resolutionSummary: note || ticket.resolutionSummary,
          },
          include: {
            requester: { select: { id: true, name: true, email: true, role: true } },
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
            category: true,
            relatedSystem: true,
          },
        });
        return res.status(200).json({
          message: 'Advisory resolution noted for staff review',
          ticket: updatedTicket,
          requesterResolutionIndicated: true,
          status: updatedTicket.currentStatus,
          ticketNumber: updatedTicket.ticketNo,
        });
      }

      return res.status(403).json({
        error: 'Forbidden: Requesters can only provide advisory resolution notes',
      });
    }

    // --- กฎสำหรับ IT STAFF และ ADMIN ---
    if (user.role !== 'IT_STAFF' && user.role !== 'ADMINISTRATOR' && (user.role as string) !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions to change status' });
    }

    if (!nextStatus) {
      return res.status(400).json({ error: 'Next status is required' });
    }

    // ตรวจสอบ Transition Matrix
    const currentStatus = ticket.currentStatus as TicketStatus;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus as TicketStatus)) {
      return res.status(400).json({
        error: `Invalid status transition from ${currentStatus} to ${nextStatus}`,
      });
    }

    // บันทึกการเปลี่ยนสถานะ
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        currentStatus: nextStatus as any,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        requester: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        relatedSystem: true,
      },
    });

    return res.status(200).json({
      ...updatedTicket,
      status: updatedTicket.currentStatus,
      ticketNumber: updatedTicket.ticketNo,
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
