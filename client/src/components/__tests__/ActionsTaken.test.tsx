import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActionsTakenSection } from '../ActionsTakenSection';

describe('ActionsTakenSection Component', () => {
  const sampleActions = [
    {
      id: 'act-1',
      ticketId: 'tkt-1',
      actionDateTime: '2026-10-30T10:00:00Z',
      actionDescription: 'Checked router settings',
      result: 'Rebooted router and connection restored',
      performedBy: { id: 'u1', name: 'IT Support' },
      followUpRequired: false,
      followUpNote: null,
      attachmentNotes: 'log.txt',
    },
  ];

  it('renders actions list correctly for Requester without Add button', () => {
    render(
      <ActionsTakenSection
        ticketId="tkt-1"
        actions={sampleActions}
        currentUserRole="REQUESTER"
        onActionCreated={vi.fn()}
      />
    );

    expect(screen.getByText('Checked router settings')).toBeDefined();
    expect(screen.queryByText(/Add Action/i)).toBeNull();
  });

  it('displays Add Action button for IT Staff', () => {
    render(
      <ActionsTakenSection
        ticketId="tkt-1"
        actions={sampleActions}
        currentUserRole="IT_STAFF"
        onActionCreated={vi.fn()}
      />
    );

    expect(screen.getByText(/Add Action/i)).toBeDefined();
  });

  it('validates that Follow-up Note is required when Follow-Up Required is checked', async () => {
    render(
      <ActionsTakenSection
        ticketId="tkt-1"
        actions={[]}
        currentUserRole="IT_STAFF"
        onActionCreated={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/Add Action/i));
    fireEvent.click(screen.getByLabelText(/Follow-Up Required/i));
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(screen.getByText(/Follow-up Note is required/i)).toBeDefined();
    });
  });
});
