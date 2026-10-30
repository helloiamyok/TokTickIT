import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketWorkflow } from '../../components/TicketWorkflow';

describe('TicketWorkflow Component (Lab 4 Regression)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('Requester does not see options to change status to RESOLVED or CLOSED (Resolution Gate)', () => {
    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="REQUESTER"
      />
    );

    expect(screen.getByTestId('status-badge')).toBeDefined();
    expect(screen.queryByTestId('status-transition-select')).toBeNull();
    expect(screen.queryByTestId('staff-workflow-section')).toBeNull();
    expect(screen.queryByRole('option', { name: /Resolved/i })).toBeNull();
  });

  it('IT Staff sees permitted next status options according to Transition Matrix', () => {
    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="IT_STAFF"
      />
    );

    expect(screen.getByTestId('staff-workflow-section')).toBeDefined();
    const select = screen.getByTestId('status-transition-select') as HTMLSelectElement;
    const options = Array.from(select.options).map((opt) => opt.value);

    expect(options).toContain('WAITING_FOR_REQUESTER');
    expect(options).toContain('RESOLVED');
    expect(options).toContain('CANCELLED');
    expect(options).not.toContain('NEW');
    expect(options).not.toContain('CLOSED');
  });

  it('allows IT Staff to transition ticket to allowed next status', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 101,
        status: 'RESOLVED',
        currentStatus: 'RESOLVED',
      }),
    });
    global.fetch = fetchMock;

    const onStatusUpdatedMock = vi.fn();

    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="IT_STAFF"
        onStatusUpdated={onStatusUpdatedMock}
      />
    );

    const select = screen.getByTestId('status-transition-select');
    fireEvent.change(select, { target: { value: 'RESOLVED' } });
    fireEvent.click(screen.getByTestId('apply-status-transition-btn'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tickets/101/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'RESOLVED' }),
        })
      );
      expect(onStatusUpdatedMock).toHaveBeenCalledWith('RESOLVED');
    });
  });
});
