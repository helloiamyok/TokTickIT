import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface StaffMetrics {
  new: number;
  open: number;
  inProgress: number;
  waitingForRequester: number;
  myAssigned: number;
}

interface RecentTicket {
  id: number;
  ticketNo?: string;
  title: string;
  summary?: string;
  status: string;
  currentStatus?: string;
  updatedAt: string;
  assignedTo?: { name: string } | null;
}

export interface StaffDashboardProps {
  onNavigateQueue?: (filterStatus?: string) => void;
  onSelectTicket?: (ticketId: number) => void;
  initialMetrics?: StaffMetrics;
  initialRecentTickets?: RecentTicket[];
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  onNavigateQueue,
  onSelectTicket,
  initialMetrics,
  initialRecentTickets,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<StaffMetrics>(
    initialMetrics || {
      new: 0,
      open: 0,
      inProgress: 0,
      waitingForRequester: 0,
      myAssigned: 0,
    }
  );
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>(
    initialRecentTickets || []
  );
  const [loading, setLoading] = useState<boolean>(!initialMetrics);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard/staff', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 403) {
          throw new Error('Access forbidden: IT Staff permissions required.');
        }
        throw new Error('Failed to load staff dashboard statistics.');
      }

      const data = await res.json();
      setMetrics(data.metrics || {
        new: 0,
        open: 0,
        inProgress: 0,
        waitingForRequester: 0,
        myAssigned: 0,
      });
      setRecentTickets(data.recentTickets || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialMetrics) {
      fetchDashboardData();
    }
  }, [initialMetrics]);

  const handleDrillDown = (statusFilter?: string) => {
    if (onNavigateQueue) {
      onNavigateQueue(statusFilter);
    } else {
      const query = statusFilter ? `?status=${statusFilter}` : '';
      navigate(`/it/queue${query}`);
    }
  };

  const handleTicketClick = (ticketId: number) => {
    if (onSelectTicket) {
      onSelectTicket(ticketId);
    } else {
      navigate(`/it/tickets/${ticketId}`);
    }
  };

  const getStatusBadgeStyle = (statusName: string) => {
    switch (statusName) {
      case 'NEW':
        return { bg: '#EAF6EF', text: '#006B3C', border: '#A7F3D0' };
      case 'OPEN':
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
      case 'IN_PROGRESS':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'WAITING_FOR_REQUESTER':
        return { bg: '#FFF7ED', text: '#C2410C', border: '#FFEDD5' };
      case 'RESOLVED':
        return { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' };
      case 'CLOSED':
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
      default:
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#006B3C', fontWeight: 600 }}>
        Loading IT Staff Dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '2rem auto', backgroundColor: '#FDE8E8', border: '1px solid #F8B4B4', borderRadius: '8px', color: '#9B1C1C' }}>
        <h3 style={{ margin: '0 0 0.5rem 0' }}>Dashboard Error</h3>
        <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
        <button
          onClick={fetchDashboardData}
          style={{ backgroundColor: '#006B3C', color: '#FFFFFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          Try Again
        </button>
      </div>
    );
  }

  const metricCards = [
    {
      id: 'new',
      label: 'New Tickets',
      count: metrics.new,
      filter: 'NEW',
      bg: '#F0FDF4',
      accent: '#006B3C',
      testId: 'metric-card-new',
      countTestId: 'metric-count-new',
    },
    {
      id: 'open',
      label: 'Open',
      count: metrics.open,
      filter: 'OPEN',
      bg: '#FFFBEB',
      accent: '#D97706',
      testId: 'metric-card-open',
      countTestId: 'metric-count-open',
    },
    {
      id: 'in-progress',
      label: 'In Progress',
      count: metrics.inProgress,
      filter: 'IN_PROGRESS',
      bg: '#EFF6FF',
      accent: '#2563EB',
      testId: 'metric-card-in-progress',
      countTestId: 'metric-count-in-progress',
    },
    {
      id: 'waiting',
      label: 'Waiting for Requester',
      count: metrics.waitingForRequester,
      filter: 'WAITING_FOR_REQUESTER',
      bg: '#FFF7ED',
      accent: '#EA580C',
      testId: 'metric-card-waiting',
      countTestId: 'metric-count-waiting',
    },
    {
      id: 'my-assigned',
      label: 'My Assigned Tickets',
      count: metrics.myAssigned,
      filter: 'MY_ASSIGNED',
      bg: '#F5F3FF',
      accent: '#7C3AED',
      testId: 'metric-card-my-assigned',
      countTestId: 'metric-count-my-assigned',
    },
  ];

  return (
    <div
      data-testid="staff-dashboard"
      style={{
        backgroundColor: '#F5F7F6',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header Title Banner */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>
              IT Staff Operations Dashboard
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: '#4B5563', fontSize: '0.9rem' }}>
              Overview of queue workload, active status distribution, and rapid ticket management.
            </p>
          </div>
          {user && (
            <div style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.85rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#006B3C', fontWeight: 700 }}>Staff Member:</span> {user.name} ({user.role})
            </div>
          )}
        </div>

        {/* Top 5 Metrics Cards (Drill-down Enabled) */}
        <div
          data-testid="metrics-container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {metricCards.map((card) => (
            <div
              key={card.id}
              data-testid={card.testId}
              onClick={() => handleDrillDown(card.filter)}
              role="button"
              tabIndex={0}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E5E7EB',
                borderTop: `4px solid ${card.accent}`,
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4B5563', marginBottom: '0.5rem' }}>
                {card.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span
                  data-testid={card.countTestId}
                  style={{ fontSize: '2rem', fontWeight: 800, color: card.accent }}
                >
                  {card.count}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#6B7280', textDecoration: 'underline' }}>
                  Filter Queue →
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom 2-Column Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          
          {/* Left Column: My Recent Tickets */}
          <div
            data-testid="recent-tickets-section"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
                📋 Recent Queue Activity
              </h2>
              <button
                onClick={() => handleDrillDown()}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#006B3C',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                View Full Queue →
              </button>
            </div>

            {recentTickets.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.9rem' }}>
                No recent tickets recorded in the system.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentTickets.map((t) => {
                  const status = t.status || t.currentStatus || 'NEW';
                  const badge = getStatusBadgeStyle(status);
                  const displayTitle = t.title || t.summary || `Ticket #${t.id}`;
                  const displayNo = t.ticketNo || `TKT-${t.id}`;

                  return (
                    <div
                      key={t.id}
                      data-testid={`recent-ticket-${t.id}`}
                      onClick={() => handleTicketClick(t.id)}
                      role="button"
                      tabIndex={0}
                      style={{
                        padding: '0.85rem 1rem',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#F9FAFB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#006B3C' }}>
                            {displayNo}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            • Updated {new Date(t.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1F2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {displayTitle}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {t.assignedTo?.name && (
                          <span style={{ fontSize: '0.78rem', color: '#4B5563', backgroundColor: '#F3F4F6', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                            👤 {t.assignedTo.name}
                          </span>
                        )}
                        <span
                          style={{
                            padding: '0.25rem 0.65rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Quick Actions */}
          <div
            data-testid="quick-actions-section"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              border: '1px solid #E5E7EB',
              padding: '1.5rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#111827' }}>
              ⚡ Quick Actions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                data-testid="quick-action-queue"
                onClick={() => handleDrillDown()}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#006B3C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>📂 My Queue & Unassigned</span>
                <span>→</span>
              </button>

              <button
                data-testid="quick-action-search"
                onClick={() => handleDrillDown()}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>🔍 Search & Filter Tickets</span>
                <span>→</span>
              </button>

              <button
                data-testid="quick-action-create"
                onClick={() => navigate('/tickets')}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  backgroundColor: '#F3F4F6',
                  color: '#1F2937',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span>➕ Create Ticket on Behalf</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
