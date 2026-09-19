import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Ticket {
  id: number;
  ticketNo?: string;
  ticketNumber?: string;
  summary: string;
  category?: { name: string };
  relatedSystem?: { name: string };
  requestedPriority: string;
  itPriority: string;
  status: string;
  currentStatus?: string;
  assignedTo?: { id: number; name: string; email: string } | null;
  requester?: { id: number; name: string; email: string };
  createdAt: string;
}

export const StaffTicketQueue: React.FC = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTickets = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search.trim() && { search: search.trim() }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/staff/tickets?${query.toString()}`, {
        credentials: 'include',
      });

      if (res.status === 403) {
        setErrorMessage('Access forbidden: You do not have permission to view the IT staff queue.');
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load queue');
      }

      const data = await res.json();
      setTickets(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);
    } catch (err: any) {
      console.error('Failed to load queue:', err);
      setErrorMessage(err.message || 'Unable to load tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
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
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'LOW':
      default:
        return { bg: '#E0F2FE', text: '#0369A1' };
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7F6', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <header className="app-header">
        <div className="header-left">
          <div className="header-brand">
            <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              ⏱️ TokTickIT
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: 600,
                padding: '0.15rem 0.5rem',
                borderRadius: '0.25rem',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              IT Staff Portal
            </span>
          </div>

          <nav className="header-nav">
            <button
              onClick={() => navigate('/it/queue')}
              className="nav-btn active"
            >
              📥 Ticket Queue
            </button>
            {user?.role === 'ADMINISTRATOR' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="nav-btn"
              >
                👥 User Management
              </button>
            )}
          </nav>
        </div>

        {/* User Info & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: '#FFFFFF' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                {user.email} • <span style={{ textTransform: 'capitalize', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{user.role}</span>
              </span>
            </div>
            <button
              onClick={() => navigate('/change-password')}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.35rem 0.65rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔑 Change Password
            </button>
            <button
              onClick={() => logout()}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                padding: '0.35rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="page-container" style={{ flex: 1, padding: '2rem 1rem' }}>
        <div className="content-wrapper" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Header Row with Search */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#006B3C', fontWeight: 700 }}>IT Staff Ticket Queue</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
                Showing {tickets.length} of {totalCount} tickets across all organizational requesters
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by ticket number or summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.55rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  width: '280px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#006B3C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>
          </div>

          {/* Filter Bar */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Status Filter:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '0.45rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  color: '#1F2937',
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              >
                <option value="">All Statuses</option>
                <option value="NEW">New</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {statusFilter && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setSearch('');
                  setPage(1);
                }}
                style={{
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '1rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid #F8B4B4' }}>
              {errorMessage}
            </div>
          )}

          {/* Table Container */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E5E7EB', color: '#4B5563', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Ticket No.</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Created Date</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Summary</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Req. Priority</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>IT Priority</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                        Loading tickets...
                      </td>
                    </tr>
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                        No tickets found matching your query.
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t) => {
                      const ticketNumber = t.ticketNumber || t.ticketNo || `TKT-${t.id}`;
                      const currentStatus = t.status || t.currentStatus || 'NEW';
                      const statusBadge = getStatusBadgeStyle(currentStatus);
                      const reqPriorityBadge = getPriorityBadgeStyle(t.requestedPriority);
                      const itPriorityBadge = getPriorityBadgeStyle(t.itPriority);

                      return (
                        <tr
                          key={t.id}
                          onClick={() => navigate(`/it/tickets/${t.id}`)}
                          style={{
                            borderBottom: '1px solid #E5E7EB',
                            cursor: 'pointer',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#006B3C' }}>{ticketNumber}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#6B7280', fontSize: '0.82rem' }}>
                            {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 500, color: '#111827' }}>{t.summary}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#4B5563' }}>{t.category?.name || '-'}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: reqPriorityBadge.bg, color: reqPriorityBadge.text }}>
                              {t.requestedPriority}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: itPriorityBadge.bg, color: itPriorityBadge.text }}>
                              {t.itPriority}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}` }}>
                              {currentStatus}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#374151' }}>
                            {t.assignedTo ? (
                              <span style={{ fontWeight: 500 }}>{t.assignedTo.name}</span>
                            ) : (
                              <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Unassigned</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {tickets.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '4px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: page <= 1 ? '#E5E7EB' : '#FFFFFF',
                    color: page <= 1 ? '#9CA3AF' : '#374151',
                    fontSize: '0.85rem',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total {totalCount} tickets)
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: '4px',
                    border: '1px solid #D1D5DB',
                    backgroundColor: page >= totalPages ? '#E5E7EB' : '#FFFFFF',
                    color: page >= totalPages ? '#9CA3AF' : '#374151',
                    fontSize: '0.85rem',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
