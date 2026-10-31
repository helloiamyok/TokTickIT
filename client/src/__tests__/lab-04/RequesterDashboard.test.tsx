import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RequesterDashboard } from '../../pages/RequesterDashboard';

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 1,
      name: 'Alice Requester',
      email: 'alice@toktick.it',
      role: 'REQUESTER',
    },
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Requester Dashboard Component (Lab 04)', () => {
  const sampleMetrics = {
    openTickets: 3,
    inProgress: 2,
    resolved: 1,
    closed: 5,
  };

  const sampleRecentTickets = [
    {
      id: 201,
      ticketNo: 'TKT-2026-000201',
      title: 'Monitor not turning on',
      status: 'OPEN',
      updatedAt: '2026-10-30T08:00:00Z',
    },
    {
      id: 202,
      ticketNo: 'TKT-2026-000202',
      title: 'Request Software License',
      status: 'RESOLVED',
      updatedAt: '2026-10-30T11:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 4 metric cards with correct values', () => {
    render(
      <BrowserRouter>
        <RequesterDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
        />
      </BrowserRouter>
    );

    // Verify 4 metric cards
    expect(screen.getByTestId('metric-card-open')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-in-progress')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-resolved')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-closed')).toBeInTheDocument();

    // Verify counts
    expect(screen.getByTestId('metric-count-open').textContent).toBe('3');
    expect(screen.getByTestId('metric-count-in-progress').textContent).toBe('2');
    expect(screen.getByTestId('metric-count-resolved').textContent).toBe('1');
    expect(screen.getByTestId('metric-count-closed').textContent).toBe('5');
  });

  it('handles drill-down clicks via card and "View all" buttons', () => {
    const handleNavigateTickets = vi.fn();

    render(
      <BrowserRouter>
        <RequesterDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
          onNavigateTickets={handleNavigateTickets}
        />
      </BrowserRouter>
    );

    // Click "View all" button on Open card
    fireEvent.click(screen.getByTestId('drill-down-open'));
    expect(handleNavigateTickets).toHaveBeenCalledWith('OPEN');

    // Click In Progress card
    fireEvent.click(screen.getByTestId('metric-card-in-progress'));
    expect(handleNavigateTickets).toHaveBeenCalledWith('IN_PROGRESS');

    // Click Resolved card
    fireEvent.click(screen.getByTestId('drill-down-resolved'));
    expect(handleNavigateTickets).toHaveBeenCalledWith('RESOLVED');

    // Click Closed card
    fireEvent.click(screen.getByTestId('drill-down-closed'));
    expect(handleNavigateTickets).toHaveBeenCalledWith('CLOSED');
  });

  it('renders My Recent Tickets and triggers onSelectTicket on click', () => {
    const handleSelectTicket = vi.fn();

    render(
      <BrowserRouter>
        <RequesterDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
          onSelectTicket={handleSelectTicket}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Monitor not turning on')).toBeInTheDocument();
    expect(screen.getByText('Request Software License')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recent-ticket-201'));
    expect(handleSelectTicket).toHaveBeenCalledWith(201);
  });

  it('triggers quick actions: Create Ticket and View My Tickets', () => {
    const handleCreate = vi.fn();
    const handleNavigate = vi.fn();

    render(
      <BrowserRouter>
        <RequesterDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
          onCreateTicket={handleCreate}
          onNavigateTickets={handleNavigate}
        />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTestId('quick-action-create'));
    expect(handleCreate).toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('quick-action-view'));
    expect(handleNavigate).toHaveBeenCalled();
  });

  it('fetches requester dashboard data automatically from API when initialMetrics is omitted', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        metrics: {
          openTickets: 7,
          inProgress: 3,
          resolved: 4,
          closed: 12,
        },
        recentTickets: sampleRecentTickets,
      }),
    });

    render(
      <BrowserRouter>
        <RequesterDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('metric-count-open').textContent).toBe('7');
      expect(screen.getByTestId('metric-count-in-progress').textContent).toBe('3');
      expect(screen.getByTestId('metric-count-resolved').textContent).toBe('4');
      expect(screen.getByTestId('metric-count-closed').textContent).toBe('12');
    });
  });
});
