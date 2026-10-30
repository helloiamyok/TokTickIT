import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TicketWorkflow } from '../TicketWorkflow';

describe('TicketWorkflow Component (Lab 4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Test 1: Requester does NOT see option to change status to RESOLVED or CLOSED
  // -------------------------------------------------------------------------
  it('Requester does not see options to change status to RESOLVED or CLOSED (Resolution Gate)', () => {
    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="REQUESTER"
      />
    );

    // Status badge is rendered
    expect(screen.getByTestId('status-badge')).toBeDefined();
    expect(screen.getByText(/In Progress/i)).toBeDefined();

    // The staff transition select is NOT rendered for Requester
    expect(screen.queryByTestId('status-transition-select')).toBeNull();
    expect(screen.queryByTestId('staff-workflow-section')).toBeNull();

    // Verify there is no button or option to directly resolve or close
    expect(screen.queryByRole('option', { name: /Resolved/i })).toBeNull();
    expect(screen.queryByRole('option', { name: /Closed/i })).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Test 2: Requester sees advisory action button
  // -------------------------------------------------------------------------
  it('Requester sees "Mark as Problem Solved (Advisory)" action when ticket is active', () => {
    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="REQUESTER"
        requesterResolutionIndicated={false}
      />
    );

    const advisoryBtn = screen.getByTestId('indicate-resolved-btn');
    expect(advisoryBtn).toBeDefined();
    expect(advisoryBtn.textContent).toMatch(/Mark as Problem Solved/i);
  });

  // -------------------------------------------------------------------------
  // Test 3: Requester can submit advisory note
  // -------------------------------------------------------------------------
  it('allows Requester to submit advisory feedback for IT staff review', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: 'Advisory resolution noted for staff review',
        requesterResolutionIndicated: true,
      }),
    });
    global.fetch = fetchMock;

    const onIndicateResolvedMock = vi.fn();

    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="REQUESTER"
        onIndicateResolved={onIndicateResolvedMock}
      />
    );

    // Click advisory button to open note input
    fireEvent.click(screen.getByTestId('indicate-resolved-btn'));

    const textarea = screen.getByTestId('advisory-note-input');
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'Everything is working normally now.' } });
    fireEvent.click(screen.getByTestId('submit-advisory-btn'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tickets/101/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            requesterResolvedNote: 'Everything is working normally now.',
          }),
        })
      );
      expect(onIndicateResolvedMock).toHaveBeenCalled();
      expect(screen.getByTestId('advisory-indicated-badge')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Test 4: IT Staff sees permitted next status options according to Transition Matrix
  // -------------------------------------------------------------------------
  it('IT Staff sees permitted next status options according to Transition Matrix', () => {
    // When currentStatus is IN_PROGRESS:
    // ALLOWED_TRANSITIONS['IN_PROGRESS'] = ['WAITING_FOR_REQUESTER', 'RESOLVED', 'CANCELLED']
    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="IT_STAFF"
      />
    );

    expect(screen.getByTestId('staff-workflow-section')).toBeDefined();
    const select = screen.getByTestId('status-transition-select') as HTMLSelectElement;
    expect(select).toBeDefined();

    const options = Array.from(select.options).map((opt) => opt.value);

    // Placeholder + 3 allowed transitions
    expect(options).toContain('');
    expect(options).toContain('WAITING_FOR_REQUESTER');
    expect(options).toContain('RESOLVED');
    expect(options).toContain('CANCELLED');

    // Forbidden transitions must NOT be present
    expect(options).not.toContain('NEW');
    expect(options).not.toContain('OPEN');
    expect(options).not.toContain('CLOSED');
    expect(options).not.toContain('REOPENED');
  });

  // -------------------------------------------------------------------------
  // Test 5: IT Staff can trigger status transition
  // -------------------------------------------------------------------------
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

    const updateBtn = screen.getByTestId('apply-status-transition-btn');
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/tickets/101/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'RESOLVED' }),
        })
      );
      expect(onStatusUpdatedMock).toHaveBeenCalledWith('RESOLVED');
      expect(screen.getByTestId('workflow-success-alert')).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Test 6: Synchronizes state when props update (prevents stale UI state)
  // -------------------------------------------------------------------------
  it('synchronizes lifecycle status and resolution indicated state when props update', () => {
    const { rerender } = render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="OPEN"
        userRole="REQUESTER"
        requesterResolutionIndicated={false}
      />
    );

    expect(screen.getByTestId('status-badge').textContent).toMatch(/Open/i);
    expect(screen.queryByTestId('advisory-indicated-badge')).toBeNull();

    // Re-render with new props after parent re-fetches
    rerender(
      <TicketWorkflow
        ticketId={101}
        currentStatus="RESOLVED"
        userRole="REQUESTER"
        requesterResolutionIndicated={true}
      />
    );

    expect(screen.getByTestId('status-badge').textContent).toMatch(/Resolved/i);
    expect(screen.getByTestId('advisory-indicated-badge')).toBeDefined();
  });

  // -------------------------------------------------------------------------
  // Test 7: Clears selectedNextStatus when currentStatus prop changes externally
  // -------------------------------------------------------------------------
  it('clears selectedNextStatus when currentStatus prop changes externally', () => {
    const { rerender } = render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="IT_STAFF"
      />
    );

    const select = screen.getByTestId('status-transition-select') as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'RESOLVED' } });
    expect(select.value).toBe('RESOLVED');

    // External status change occurs
    rerender(
      <TicketWorkflow
        ticketId={101}
        currentStatus="RESOLVED"
        userRole="IT_STAFF"
      />
    );

    const updatedSelect = screen.getByTestId('status-transition-select') as HTMLSelectElement;
    expect(updatedSelect.value).toBe('');
  });

  // -------------------------------------------------------------------------
  // Test 8: Sends updatedAt in PATCH payload for stale update protection
  // -------------------------------------------------------------------------
  it('sends updatedAt in PATCH payload for stale update protection when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 101,
        status: 'RESOLVED',
        currentStatus: 'RESOLVED',
      }),
    });
    global.fetch = fetchMock;

    const sampleUpdatedAt = '2026-10-30T10:00:00.000Z';

    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="IT_STAFF"
        updatedAt={sampleUpdatedAt}
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
          body: JSON.stringify({
            status: 'RESOLVED',
            updatedAt: sampleUpdatedAt,
          }),
        })
      );
    });
  });

  // -------------------------------------------------------------------------
  // Test 9: Displays error alert when 409 STALE_UPDATE_CONFLICT is returned
  // -------------------------------------------------------------------------
  it('displays error alert when 409 STALE_UPDATE_CONFLICT is returned from server', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 409,
      ok: false,
      json: async () => ({
        error: 'Ticket has been modified by another user. Please refresh and try again.',
        code: 'STALE_UPDATE_CONFLICT',
      }),
    });
    global.fetch = fetchMock;

    render(
      <TicketWorkflow
        ticketId={101}
        currentStatus="IN_PROGRESS"
        userRole="IT_STAFF"
        updatedAt="2020-01-01T00:00:00.000Z"
      />
    );

    const select = screen.getByTestId('status-transition-select');
    fireEvent.change(select, { target: { value: 'RESOLVED' } });
    fireEvent.click(screen.getByTestId('apply-status-transition-btn'));

    await waitFor(() => {
      const errorAlert = screen.getByTestId('workflow-error-alert');
      expect(errorAlert).toBeDefined();
      expect(errorAlert.textContent).toMatch(/modified by another user/i);
    });
  });
});
