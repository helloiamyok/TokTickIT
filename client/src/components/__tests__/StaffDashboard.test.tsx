import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { StaffDashboard } from '../StaffDashboard';

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

describe('StaffDashboard Component Unit Tests', () => {
  const sampleMetrics = {
    new: 5,
    open: 10,
    inProgress: 3,
    waitingForRequester: 1,
    myAssigned: 4,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all 5 metric cards and triggers drill-down on click', () => {
    const handleNavigate = vi.fn();
    render(
      <BrowserRouter>
        <StaffDashboard
          initialMetrics={sampleMetrics}
          initialRecentTickets={[]}
          onNavigateQueue={handleNavigate}
        />
      </BrowserRouter>
    );

    expect(screen.getByTestId('metric-count-new').textContent).toBe('5');
    expect(screen.getByTestId('metric-count-open').textContent).toBe('10');
    expect(screen.getByTestId('metric-count-in-progress').textContent).toBe('3');
    expect(screen.getByTestId('metric-count-waiting').textContent).toBe('1');
    expect(screen.getByTestId('metric-count-my-assigned').textContent).toBe('4');

    fireEvent.click(screen.getByTestId('metric-card-open'));
    expect(handleNavigate).toHaveBeenCalledWith('OPEN');
  });
});
