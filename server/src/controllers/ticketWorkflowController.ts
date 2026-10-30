import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ALLOWED_TRANSITIONS, TicketStatus } from '../constants/ticketWorkflow';

// Normalize role strings (handles variations like ADMIN, ADMINISTRATOR, IT_STAFF, staff, etc.)
export function normalizeRole(role?: string): 'REQUESTER' | 'IT_STAFF' | 'ADMINISTRATOR' | 'UNKNOWN' {
  if (!role) return 'UNKNOWN';
  const upper = String(role).trim().toUpperCase();
  if (upper === 'ADMIN' || upper === 'ADMINISTRATOR') return 'ADMINISTRATOR';
  if (upper === 'IT_STAFF' || upper === 'STAFF' || upper === 'IT') return 'IT_STAFF';
  if (upper === 'REQUESTER' || upper === 'USER') return 'REQUESTER';
  return 'UNKNOWN';
}

// Single source of truth for Ticket API response contract (normalizes status & currentStatus)
export function formatTicketResponse(ticket: any) {
  const status = ticket.currentStatus || ticket.status || 'NEW';
  return {
    ...ticket,
    currentStatus: status,
    status: status, // normalized for contract stability
    ticketNumber: ticket.ticketNo || ticket.ticketNumber,
  };
}

export const updateTicketWorkflowStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    status: nextStatus,
    requesterIndicatesResolved,
    requesterResolvedNote,
    indicateResolved,
    updatedAt: clientUpdatedAt,
  } = req.body;
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const numericId = parseInt(id as string, 10);
    const ticket = !isNaN(numericId)
      ? await prisma.ticket.findUnique({
          where: { id: numericId },
          include: {
            requester: { select: { id: true, name: true, email: true, role: true } },
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
            category: true,
            relatedSystem: true,
          },
        })
      : await prisma.ticket.findUnique({
          where: { ticketNo: id as string },
          include: {
            requester: { select: { id: true, name: true, email: true, role: true } },
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
            category: true,
            relatedSystem: true,
          },
        });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    // Concurrency / Stale Update Guard (BR-04 Concurrency Standard)
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

    const userRole = normalizeRole(user.role);

    // 1. กฎสำหรับ REQUESTER (Resolution Gate)
    if (userRole === 'REQUESTER') {
      if (ticket.requesterId !== user.id) {
        return res.status(403).json({ error: 'Forbidden: You do not own this ticket' });
      }

      // Resolution Gate: Requester ไม่มีสิทธิ์เปลี่ยนสถานะตั๋วเป็น RESOLVED หรือ CLOSED ได้โดยตรง
      if (nextStatus === 'RESOLVED' || nextStatus === 'CLOSED') {
        return res.status(403).json({
          error: 'Resolution Gate: Requesters cannot resolve tickets directly. IT Staff review is required.',
        });
      }

      // อนุญาตให้ส่ง advisory note เพื่อแจ้งว่าปัญหาคลี่คลายแล้ว (Single API Contract)
      const isAdvisory =
        requesterIndicatesResolved !== undefined ||
        requesterResolvedNote !== undefined ||
        indicateResolved !== undefined;

      if (isAdvisory) {
        const note =
          typeof requesterResolvedNote === 'string'
            ? requesterResolvedNote.trim()
            : typeof requesterIndicatesResolved === 'string'
            ? requesterIndicatesResolved.trim()
            : 'Problem reported as resolved by requester';

        const updated = await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            requesterResolutionIndicated:
              requesterIndicatesResolved !== undefined
                ? Boolean(requesterIndicatesResolved)
                : true,
            resolutionSummary: note || ticket.resolutionSummary,
          },
          include: {
            requester: { select: { id: true, name: true, email: true, role: true } },
            assignedTo: { select: { id: true, name: true, email: true, role: true } },
            category: true,
            relatedSystem: true,
          },
        });

        const ticketPayload = formatTicketResponse(updated);

        return res.status(200).json({
          message: 'Advisory resolution noted for staff review',
          ticket: ticketPayload,
          ...ticketPayload,
        });
      }

      return res.status(403).json({
        error: 'Forbidden: Requesters can only submit advisory resolution notes',
      });
    }

    // 2. กฎสำหรับ IT STAFF และ ADMIN (Normalized Role Check)
    if (userRole !== 'IT_STAFF' && userRole !== 'ADMINISTRATOR') {
      return res.status(403).json({
        error: 'Forbidden: Insufficient permissions to change ticket status',
      });
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

    // บันทึกสถานะใหม่
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        currentStatus: nextStatus as any,
      },
      include: {
        requester: { select: { id: true, name: true, email: true, role: true } },
        assignedTo: { select: { id: true, name: true, email: true, role: true } },
        category: true,
        relatedSystem: true,
      },
    });

    const ticketPayload = formatTicketResponse(updatedTicket);

    return res.status(200).json(ticketPayload);
  } catch (error) {
    console.error('Error updating ticket workflow status:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTicketStatus = updateTicketWorkflowStatus;
