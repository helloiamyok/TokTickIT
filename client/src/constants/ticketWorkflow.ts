export const TICKET_STATUSES = [
  'NEW',
  'OPEN',
  'IN_PROGRESS',
  'WAITING_FOR_REQUESTER',
  'RESOLVED',
  'CLOSED',
  'REOPENED',
  'CANCELLED',
] as const;

export type TicketStatus = typeof TICKET_STATUSES[number];

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  NEW: ['OPEN', 'CANCELLED'],
  OPEN: ['IN_PROGRESS', 'WAITING_FOR_REQUESTER', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED'],
  WAITING_FOR_REQUESTER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'REOPENED'],
  CLOSED: ['REOPENED'],
  REOPENED: ['IN_PROGRESS', 'CANCELLED'],
  CANCELLED: [],
};

export const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_REQUESTER: 'Waiting for Requester',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  REOPENED: 'Reopened',
  CANCELLED: 'Cancelled',
};

export const STATUS_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  NEW: { bg: '#EAF6EF', text: '#006B3C', border: '#A7F3D0' },
  OPEN: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  IN_PROGRESS: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  WAITING_FOR_REQUESTER: { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' },
  RESOLVED: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  CLOSED: { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' },
  REOPENED: { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
};
