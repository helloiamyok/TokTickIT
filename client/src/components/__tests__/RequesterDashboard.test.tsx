import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { RequesterDashboard } from '../RequesterDashboard';

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

describe('RequesterDashboard Component Unit Tests', () => {
  const sampleMetrics = {
    openTickets: 4,
    inProgress: 1,
    resolved: 6,
    closed: 8,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 4 metric cards and triggers drill-down on click', () => {
    const handleNavigate = vi.fn();
    render(
      <BrowserRouter>
        <RequesterDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={[]}
          onNavigateTickets={handleNavigate}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('metric-count-open').textContent).toBe('4');
    expect(screen.getByTestId('metric-count-in-progress').textContent).toBe('1');
    expect(screen.getByTestId('metric-count-resolved').textContent).toBe('6');
    expect(screen.getByTestId('metric-count-closed').textContent).toBe('8');

    fireEvent.click(screen.getByTestId('metric-card-open'));
    expect(handleNavigate).toHaveBeenCalledWith('OPEN');
  });
});
