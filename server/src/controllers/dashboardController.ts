import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// 1. IT Staff Dashboard API
export const getStaffDashboard = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const role = user.role ? String(user.role).toUpperCase() : '';
  if (role !== 'IT_STAFF' && role !== 'ADMIN' && role !== 'ADMINISTRATOR') {
    return res.status(403).json({ error: 'Forbidden: IT Staff access only' });
  }

  try {
    const [countNew, countOpen, countInProgress, countWaiting, countMyAssigned] =
      await Promise.all([
        prisma.ticket.count({ where: { currentStatus: 'NEW' } }),
        prisma.ticket.count({ where: { currentStatus: 'OPEN' } }),
        prisma.ticket.count({ where: { currentStatus: 'IN_PROGRESS' } }),
        prisma.ticket.count({ where: { currentStatus: 'WAITING_FOR_REQUESTER' } }),
        prisma.ticket.count({ where: { assignedToId: user.id } }),
      ]);

    const recentTicketsRaw = await prisma.ticket.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        ticketNo: true,
        summary: true,
        currentStatus: true,
        updatedAt: true,
        assignedTo: { select: { name: true } },
      },
    });

    const recentTickets = recentTicketsRaw.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      title: t.summary,
      summary: t.summary,
      status: t.currentStatus,
      currentStatus: t.currentStatus,
      updatedAt: t.updatedAt,
      assignedTo: t.assignedTo,
    }));

    return res.status(200).json({
      metrics: {
        new: countNew,
        open: countOpen,
        inProgress: countInProgress,
        waitingForRequester: countWaiting,
        myAssigned: countMyAssigned,
      },
      recentTickets,
    });
  } catch (error) {
    console.error('Error retrieving staff dashboard data:', error);
    return res.status(500).json({ error: 'Failed to retrieve staff dashboard data' });
  }
};

// 2. Requester Dashboard API
export const getRequesterDashboard = async (req: Request, res: Response) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const [countOpen, countInProgress, countResolved, countClosed] =
      await Promise.all([
        prisma.ticket.count({
          where: { requesterId: user.id, currentStatus: { in: ['NEW', 'OPEN'] } },
        }),
        prisma.ticket.count({
          where: { requesterId: user.id, currentStatus: 'IN_PROGRESS' },
        }),
        prisma.ticket.count({
          where: { requesterId: user.id, currentStatus: 'RESOLVED' },
        }),
        prisma.ticket.count({
          where: { requesterId: user.id, currentStatus: 'CLOSED' },
        }),
      ]);

    const recentTicketsRaw = await prisma.ticket.findMany({
      where: { requesterId: user.id },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        ticketNo: true,
        summary: true,
        currentStatus: true,
        updatedAt: true,
      },
    });

    const recentTickets = recentTicketsRaw.map((t) => ({
      id: t.id,
      ticketNo: t.ticketNo,
      title: t.summary,
      summary: t.summary,
      status: t.currentStatus,
      currentStatus: t.currentStatus,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json({
      metrics: {
        openTickets: countOpen,
        inProgress: countInProgress,
        resolved: countResolved,
        closed: countClosed,
      },
      recentTickets,
    });
  } catch (error) {
    console.error('Error retrieving requester dashboard data:', error);
    return res.status(500).json({ error: 'Failed to retrieve requester dashboard data' });
  }
};
