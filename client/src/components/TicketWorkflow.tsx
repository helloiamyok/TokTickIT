import React, { useState, useEffect } from 'react';
import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
  STATUS_BADGE_STYLES,
} from '../constants/ticketWorkflow';

export interface TicketWorkflowProps {
  ticketId: number;
  currentStatus: string;
  userRole?: string;
  updatedAt?: string;
  requesterResolutionIndicated?: boolean;
  onStatusUpdated?: (newStatus: string) => void;
  onIndicateResolved?: () => void;
}

export const TicketWorkflow: React.FC<TicketWorkflowProps> = ({
  ticketId,
  currentStatus: propStatus,
  userRole = 'REQUESTER',
  updatedAt,
  requesterResolutionIndicated: propResolutionIndicated = false,
  onStatusUpdated,
  onIndicateResolved,
}) => {
  // Optimistic overrides for snappy local feedback
  const [optimisticStatus, setOptimisticStatus] = useState<string | null>(null);
  const [optimisticIndicated, setOptimisticIndicated] = useState<boolean | null>(null);
  const [selectedNextStatus, setSelectedNextStatus] = useState('');
  const [advisoryNote, setAdvisoryNote] = useState('');
  const [showAdvisoryInput, setShowAdvisoryInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Synchronize deterministically whenever parent passes new props (single source of truth)
  useEffect(() => {
    setOptimisticStatus(null);
    setSelectedNextStatus('');
    setErrorMsg(null);
  }, [propStatus]);

  useEffect(() => {
    setOptimisticIndicated(null);
  }, [propResolutionIndicated]);

  // Derived state: authoritative prop takes precedence, optimistic fallback used during in-flight mutations
  const currentStatus = optimisticStatus || propStatus || 'NEW';
  const resolutionIndicated =
    optimisticIndicated !== null ? optimisticIndicated : Boolean(propResolutionIndicated);

  const isStaffOrAdmin = userRole === 'IT_STAFF' || userRole === 'ADMINISTRATOR' || userRole === 'ADMIN';
  const isRequester = !isStaffOrAdmin;

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  const statusBadge = STATUS_BADGE_STYLES[currentStatus] || {
    bg: '#EAF6EF',
    text: '#006B3C',
    border: '#A7F3D0',
  };

  // Staff/Admin updates status
  const handleTransitionSubmit = async (nextStatus: string) => {
    if (!nextStatus || nextStatus === currentStatus) return;

    try {
      setIsUpdating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload: Record<string, any> = { status: nextStatus };
      if (updatedAt) {
        payload.updatedAt = updatedAt;
      }

      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409) {
        throw new Error(data.error || 'Ticket has been modified by another user. Please refresh and try again.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update ticket status');
      }

      const updated = data.currentStatus || data.status || nextStatus;
      setOptimisticStatus(updated);
      setSelectedNextStatus('');
      setSuccessMsg(`Ticket status successfully moved to ${STATUS_LABELS[updated] || updated}`);
      onStatusUpdated?.(updated);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Requester submits advisory resolution note (Resolution Gate)
  const handleAdvisorySubmit = async () => {
    try {
      setIsUpdating(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload: Record<string, any> = {
        requesterResolvedNote: advisoryNote.trim() || 'Problem reported as resolved by requester',
      };
      if (updatedAt) {
        payload.updatedAt = updatedAt;
      }

      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.status === 409) {
        throw new Error(data.error || 'Ticket has been modified by another user. Please refresh and try again.');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send advisory note');
      }

      setOptimisticIndicated(true);
      setShowAdvisoryInput(false);
      setAdvisoryNote('');
      setSuccessMsg('Thank you! Your resolution note has been sent for IT staff review.');
      onIndicateResolved?.();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error submitting advisory note');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      data-testid="ticket-workflow-control"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '1.25rem',
        margin: '1rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Lifecycle Status:
          </span>
          <span
            data-testid="status-badge"
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontSize: '0.85rem',
              fontWeight: 700,
              backgroundColor: statusBadge.bg,
              color: statusBadge.text,
              border: `1px solid ${statusBadge.border}`,
            }}
          >
            {STATUS_LABELS[currentStatus] || currentStatus}
          </span>
        </div>

        {/* Requester Advisory Resolution Indicator (Resolution Gate BR-04) */}
        {resolutionIndicated && (
          <span
            data-testid="advisory-indicated-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.85rem',
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderRadius: '20px',
              border: '1px solid #A7F3D0',
            }}
          >
            <span>✓</span> Problem Indicated as Resolved
          </span>
        )}
      </div>

      {/* Feedback Messages */}
      {errorMsg && (
        <div
          data-testid="workflow-error-alert"
          style={{
            marginTop: '0.75rem',
            backgroundColor: '#FDE8E8',
            border: '1px solid #F8B4B4',
            color: '#9B1C1C',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
          }}
        >
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div
          data-testid="workflow-success-alert"
          style={{
            marginTop: '0.75rem',
            backgroundColor: '#DEF7EC',
            border: '1px solid #BCF0DA',
            color: '#03543F',
            padding: '0.65rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
          }}
        >
          {successMsg}
        </div>
      )}

      {/* IT Staff & Administrator Controls */}
      {isStaffOrAdmin && (
        <div data-testid="staff-workflow-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
          <label
            htmlFor="status-transition-select"
            style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}
          >
            Transition Ticket Status (Transition Matrix):
          </label>

          {allowedNext.length === 0 ? (
            <div style={{ color: '#6B7280', fontSize: '0.85rem', fontStyle: 'italic' }}>
              This ticket has reached terminal state ({STATUS_LABELS[currentStatus] || currentStatus}). No further transitions allowed.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                id="status-transition-select"
                data-testid="status-transition-select"
                value={selectedNextStatus}
                onChange={(e) => setSelectedNextStatus(e.target.value)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  backgroundColor: '#F9FAFB',
                  color: '#111827',
                  minWidth: '220px',
                }}
              >
                <option value="">-- Select Next Status --</option>
                {allowedNext.map((st) => (
                  <option key={st} value={st}>
                    Move to: {STATUS_LABELS[st] || st}
                  </option>
                ))}
              </select>

              <button
                data-testid="apply-status-transition-btn"
                onClick={() => handleTransitionSubmit(selectedNextStatus)}
                disabled={!selectedNextStatus || isUpdating}
                style={{
                  padding: '0.45rem 1.15rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedNextStatus ? '#006B3C' : '#9CA3AF',
                  color: '#FFFFFF',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: selectedNextStatus && !isUpdating ? 'pointer' : 'not-allowed',
                }}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Requester Controls (Resolution Gate Enforcement) */}
      {isRequester && currentStatus !== 'CLOSED' && currentStatus !== 'CANCELLED' && !resolutionIndicated && (
        <div data-testid="requester-workflow-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F3F4F6' }}>
          {!showAdvisoryInput ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#4B5563' }}>
                Has your issue been resolved by IT Staff? You can indicate it to help our team close this ticket.
              </span>
              <button
                data-testid="indicate-resolved-btn"
                onClick={() => setShowAdvisoryInput(true)}
                style={{
                  backgroundColor: '#006B3C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark as Problem Solved (Advisory)
              </button>
            </div>
          ) : (
            <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', marginBottom: '0.35rem' }}>
                Provide Optional Advisory Feedback:
              </div>
              <textarea
                data-testid="advisory-note-input"
                value={advisoryNote}
                onChange={(e) => setAdvisoryNote(e.target.value)}
                placeholder="Describe how the problem was resolved or any note for IT staff..."
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                  marginBottom: '0.5rem',
                }}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  data-testid="submit-advisory-btn"
                  onClick={handleAdvisorySubmit}
                  disabled={isUpdating}
                  style={{
                    backgroundColor: '#006B3C',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '0.4rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isUpdating ? 'Submitting...' : 'Confirm Advisory'}
                </button>
                <button
                  onClick={() => setShowAdvisoryInput(false)}
                  disabled={isUpdating}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #D1D5DB',
                    color: '#4B5563',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
