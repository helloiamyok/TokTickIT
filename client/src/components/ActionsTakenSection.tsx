import React, { useState, useEffect } from 'react';

export interface ActionItem {
  id: string | number;
  ticketId: string | number;
  actionDateTime: string;
  actionDescription: string;
  result: string;
  performedBy?: {
    id?: string | number;
    name?: string;
    role?: string;
  };
  performedById?: string | number;
  followUpRequired: boolean;
  followUpNote?: string | null;
  attachmentNotes?: string | null;
}

export interface ActionsTakenSectionProps {
  ticketId: string | number;
  actions?: ActionItem[];
  currentUserRole?: string;
  onActionCreated?: () => void;
}

export const ActionsTakenSection: React.FC<ActionsTakenSectionProps> = ({
  ticketId,
  actions: propActions,
  currentUserRole = 'REQUESTER',
  onActionCreated,
}) => {
  const [actionsList, setActionsList] = useState<ActionItem[]>(propActions || []);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [actionDescription, setActionDescription] = useState('');
  const [result, setResult] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [attachmentNotes, setAttachmentNotes] = useState('');
  const [actionDateTime, setActionDateTime] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update actionsList whenever propActions changes
  useEffect(() => {
    if (propActions !== undefined) {
      setActionsList(propActions);
    }
  }, [propActions]);

  // Fetch actions if not provided via props
  const fetchActions = async () => {
    if (propActions !== undefined) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/tickets/${ticketId}/actions`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setActionsList(data);
      }
    } catch (err) {
      console.error('Failed to fetch actions taken:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propActions === undefined && ticketId) {
      fetchActions();
    }
  }, [ticketId]);

  const canAddAction =
    currentUserRole === 'IT_STAFF' ||
    currentUserRole === 'ADMINISTRATOR' ||
    currentUserRole === 'ADMIN';

  const resetForm = () => {
    setActionDescription('');
    setResult('');
    setFollowUpRequired(false);
    setFollowUpNote('');
    setAttachmentNotes('');
    setActionDateTime('');
    setFormError(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validation (Check Follow-up note if followUpRequired is checked)
    if (followUpRequired && (!followUpNote || !followUpNote.trim())) {
      setFormError('Follow-up Note is required when Follow-Up Required is checked.');
      return;
    }

    if (!actionDescription.trim() || !result.trim()) {
      setFormError('Action Description and Result are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        actionDescription: actionDescription.trim(),
        result: result.trim(),
        followUpRequired,
        followUpNote: followUpRequired ? followUpNote.trim() : null,
        attachmentNotes: attachmentNotes.trim() ? attachmentNotes.trim() : null,
        actionDateTime: actionDateTime || new Date().toISOString(),
      };

      const res = await fetch(`/api/tickets/${ticketId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to save action taken');
      }

      const savedAction = await res.json();

      // Update state
      setActionsList((prev) => [...prev, savedAction]);
      resetForm();
      if (onActionCreated) {
        onActionCreated();
      } else {
        fetchActions();
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="actions-taken-section"
      style={{
        marginTop: '24px',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E2E8F0',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 600,
              color: '#1B4D3E',
            }}
          >
            📋 Actions Taken
          </h3>
          <span
            style={{
              fontSize: '0.8rem',
              backgroundColor: '#EAF6EF',
              color: '#1B4D3E',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 500,
            }}
          >
            {actionsList.length}
          </span>
        </div>

        {canAddAction && !showForm && (
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setFormError(null);
            }}
            style={{
              backgroundColor: '#1B4D3E',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#14382D')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1B4D3E')}
          >
            + Add Action
          </button>
        )}
      </div>

      {/* Form / Modal for Adding Action Taken */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: '#F8FAF9',
            border: '1px solid #A3D9C9',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <h4
            style={{
              margin: '0 0 12px 0',
              fontSize: '1rem',
              color: '#1B4D3E',
              fontWeight: 600,
            }}
          >
            Record New Action Taken
          </h4>

          {formError && (
            <div
              style={{
                backgroundColor: '#FDE8E8',
                color: '#9B1C1C',
                border: '1px solid #F8B4B4',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '12px',
                fontSize: '0.875rem',
              }}
            >
              ⚠️ {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            <div>
              <label
                htmlFor="actionDescription"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#2D3748',
                  marginBottom: '4px',
                }}
              >
                Action Description <span style={{ color: '#E53E3E' }}>*</span>
              </label>
              <textarea
                id="actionDescription"
                rows={2}
                value={actionDescription}
                onChange={(e) => setActionDescription(e.target.value)}
                placeholder="Detail the technical action performed..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E0',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label
                htmlFor="result"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#2D3748',
                  marginBottom: '4px',
                }}
              >
                Result <span style={{ color: '#E53E3E' }}>*</span>
              </label>
              <textarea
                id="result"
                rows={2}
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Outcome of the action (e.g. connection restored)..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E0',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 0',
              }}
            >
              <input
                type="checkbox"
                id="followUpRequired"
                checked={followUpRequired}
                onChange={(e) => setFollowUpRequired(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label
                htmlFor="followUpRequired"
                style={{
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: '#2D3748',
                  cursor: 'pointer',
                }}
              >
                Follow-Up Required
              </label>
            </div>

            {followUpRequired && (
              <div>
                <label
                  htmlFor="followUpNote"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    color: '#B7791F',
                    marginBottom: '4px',
                  }}
                >
                  Follow-up Note <span style={{ color: '#E53E3E' }}>*</span>
                </label>
                <input
                  type="text"
                  id="followUpNote"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  placeholder="Specify required follow-up task or schedule..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #ECC94B',
                    backgroundColor: '#FFFFF0',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="attachmentNotes"
                style={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  color: '#2D3748',
                  marginBottom: '4px',
                }}
              >
                Attachment Notes (Optional)
              </label>
              <input
                type="text"
                id="attachmentNotes"
                value={attachmentNotes}
                onChange={(e) => setAttachmentNotes(e.target.value)}
                placeholder="e.g. photo_connector.jpg, speedtest_log.txt"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E0',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              style={{
                backgroundColor: '#EDF2F7',
                color: '#4A5568',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save Action'}
            </button>
          </div>
        </form>
      )}

      {/* List / Table of Actions */}
      {loading ? (
        <div style={{ color: '#718096', fontSize: '0.9rem', padding: '12px 0' }}>
          Loading actions taken...
        </div>
      ) : actionsList.length === 0 ? (
        <div
          style={{
            padding: '24px',
            textAlign: 'center',
            color: '#718096',
            backgroundColor: '#F8FAF9',
            borderRadius: '6px',
            border: '1px dashed #CBD5E0',
            fontSize: '0.9rem',
          }}
        >
          No actions taken recorded yet.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '2px solid #E2E8F0' }}>
                <th style={{ padding: '10px 12px', color: '#4A5568', fontWeight: 600 }}>Date/Time</th>
                <th style={{ padding: '10px 12px', color: '#4A5568', fontWeight: 600 }}>Performed By</th>
                <th style={{ padding: '10px 12px', color: '#4A5568', fontWeight: 600 }}>Action Description</th>
                <th style={{ padding: '10px 12px', color: '#4A5568', fontWeight: 600 }}>Result</th>
                <th style={{ padding: '10px 12px', color: '#4A5568', fontWeight: 600 }}>Follow-up</th>
                <th style={{ padding: '10px 12px', color: '#4A5568', fontWeight: 600 }}>Attachments / Notes</th>
              </tr>
            </thead>
            <tbody>
              {actionsList.map((action, idx) => {
                const dateStr = action.actionDateTime
                  ? new Date(action.actionDateTime).toLocaleString()
                  : '-';
                const performer = action.performedBy?.name || 'IT Staff';

                return (
                  <tr
                    key={action.id || idx}
                    style={{
                      borderBottom: '1px solid #E2E8F0',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFB',
                    }}
                  >
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: '#4A5568' }}>
                      {dateStr}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 500, color: '#1B4D3E' }}>
                      {performer}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#2D3748', maxWidth: '280px' }}>
                      {action.actionDescription}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#2D3748', maxWidth: '260px' }}>
                      {action.result && action.result.toLowerCase().includes('complete') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ display: 'inline-block', backgroundColor: '#DEF7EC', color: '#03543F', border: '1px solid #BCF0DA', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                            ✓ Complete
                          </span>
                          <span style={{ fontSize: '0.85rem' }}>{action.result}</span>
                        </div>
                      ) : action.result && action.result.toLowerCase().includes('cancel') ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ display: 'inline-block', backgroundColor: '#FDE8E8', color: '#9B1C1C', border: '1px solid #F8B4B4', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, width: 'fit-content' }}>
                            ✕ Cancel
                          </span>
                          <span style={{ fontSize: '0.85rem' }}>{action.result}</span>
                        </div>
                      ) : (
                        action.result
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {action.followUpRequired ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              backgroundColor: '#FEEBC8',
                              color: '#C05621',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              width: 'fit-content',
                            }}
                          >
                            ⚠️ Required
                          </span>
                          {action.followUpNote && (
                            <span
                              style={{
                                fontSize: '0.8rem',
                                color: '#744210',
                                fontStyle: 'italic',
                              }}
                            >
                              {action.followUpNote}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span
                          style={{
                            display: 'inline-block',
                            backgroundColor: '#E2E8F0',
                            color: '#4A5568',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                          }}
                        >
                          None
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: '#718096', fontSize: '0.8rem' }}>
                      {action.attachmentNotes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActionsTakenSection;
