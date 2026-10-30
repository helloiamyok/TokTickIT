import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { StaffDashboard } from '../../pages/StaffDashboard';

// Mock AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 2,
      name: 'Bob Staff',
      email: 'bob@toktick.it',
      role: 'IT_STAFF',
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

describe('IT Staff Dashboard Component (Lab 04)', () => {
  const sampleMetrics = {
    new: 3,
    open: 8,
    inProgress: 4,
    waitingForRequester: 2,
    myAssigned: 5,
  };

  const sampleRecentTickets = [
    {
      id: 101,
      ticketNo: 'TKT-2026-000101',
      title: 'VPN Connection Failure',
      status: 'IN_PROGRESS',
      updatedAt: '2026-10-30T09:00:00Z',
      assignedTo: { name: 'Bob Staff' },
    },
    {
      id: 102,
      ticketNo: 'TKT-2026-000102',
      title: 'Email Password Reset',
      status: 'NEW',
      updatedAt: '2026-10-30T10:30:00Z',
      assignedTo: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 5 metric cards with correct counts', () => {
    render(
      <BrowserRouter>
        <StaffDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
        />
      </BrowserRouter>
    );

    // Verify 5 metric cards
    expect(screen.getByTestId('metric-card-new')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-open')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-in-progress')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-waiting')).toBeInTheDocument();
    expect(screen.getByTestId('metric-card-my-assigned')).toBeInTheDocument();

    // Verify counts
    expect(screen.getByTestId('metric-count-new').textContent).toBe('3');
    expect(screen.getByTestId('metric-count-open').textContent).toBe('8');
    expect(screen.getByTestId('metric-count-in-progress').textContent).toBe('4');
    expect(screen.getByTestId('metric-count-waiting').textContent).toBe('2');
    expect(screen.getByTestId('metric-count-my-assigned').textContent).toBe('5');
  });

  it('triggers drill-down when a metric card is clicked', () => {
    const handleNavigateQueue = vi.fn();

    render(
      <BrowserRouter>
        <StaffDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
          onNavigateQueue={handleNavigateQueue}
        />
      </BrowserRouter>
    );

    // Click 'New' card
    fireEvent.click(screen.getByTestId('metric-card-new'));
    expect(handleNavigateQueue).toHaveBeenCalledWith('NEW');

    // Click 'Open' card
    fireEvent.click(screen.getByTestId('metric-card-open'));
    expect(handleNavigateQueue).toHaveBeenCalledWith('OPEN');

    // Click 'In Progress' card
    fireEvent.click(screen.getByTestId('metric-card-in-progress'));
    expect(handleNavigateQueue).toHaveBeenCalledWith('IN_PROGRESS');

    // Click 'My Assigned' card
    fireEvent.click(screen.getByTestId('metric-card-my-assigned'));
    expect(handleNavigateQueue).toHaveBeenCalledWith('MY_ASSIGNED');
  });

  it('renders recent queue activity list and quick action buttons', () => {
    const handleSelectTicket = vi.fn();

    render(
      <BrowserRouter>
        <StaffDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={sampleRecentTickets}
          onSelectTicket={handleSelectTicket}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('VPN Connection Failure')).toBeInTheDocument();
    expect(screen.getByText('Email Password Reset')).toBeInTheDocument();

    // Click recent ticket
    fireEvent.click(screen.getByTestId('recent-ticket-101'));
    expect(handleSelectTicket).toHaveBeenCalledWith(101);

    // Verify quick action buttons exist
    expect(screen.getByTestId('quick-action-queue')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-search')).toBeInTheDocument();
    expect(screen.getByTestId('quick-action-create')).toBeInTheDocument();
  });

  it('fetches metrics automatically from API when no initialMetrics prop is given', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        metrics: {
          new: 12,
          open: 15,
          inProgress: 7,
          waitingForRequester: 3,
          myAssigned: 9,
        },
        recentTickets: sampleRecentTickets,
      }),
    });

    render(
      <BrowserRouter>
        <StaffDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('metric-count-new').textContent).toBe('12');
      expect(screen.getByTestId('metric-count-open').textContent).toBe('15');
      expect(screen.getByTestId('metric-count-in-progress').textContent).toBe('7');
    });
  });
});
