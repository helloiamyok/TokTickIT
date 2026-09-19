import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserSummary {
  id: number | string;
  name: string;
  email?: string;
  role: string;
}

interface CommentItem {
  id: number;
  content: string;
  isInternal: boolean;
  createdAt: string;
  author: UserSummary;
}

interface TicketDetailData {
  id: number;
  ticketNo?: string;
  ticketNumber?: string;
  summary: string;
  description: string;
  category?: { name: string };
  relatedSystem?: { name: string } | null;
  requestedPriority: string;
  itPriority: string;
  status?: string;
  currentStatus?: string;
  requesterResolutionIndicated?: boolean;
  requester?: { id: number | string; name: string; email?: string };
  assignedTo?: { id: number | string; name: string; email?: string } | null;
  createdAt?: string;
}

export const StaffTicketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [ticket, setTicket] = useState<TicketDetailData | null>(null);
  const [activeTab, setActiveTab] = useState<'public' | 'internal'>('public');
  const [publicComments, setPublicComments] = useState<CommentItem[]>([]);
  const [internalNotes, setInternalNotes] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadTicketData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await fetch(`/api/staff/tickets/${id}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        // Fallback to /api/tickets/:id
        const fallbackRes = await fetch(`/api/tickets/${id}`, { credentials: 'include' });
        if (!fallbackRes.ok) throw new Error('Failed to load ticket details');
        const fallbackData = await fallbackRes.json();
        setTicket(fallbackData);
      } else {
        const data = await res.json();
        setTicket(data);
      }

      // Load comments and internal notes
      const [resComments, resNotes] = await Promise.all([
        fetch(`/api/tickets/${id}/comments`, { credentials: 'include' }),
        fetch(`/api/staff/tickets/${id}/internal-notes`, { credentials: 'include' }),
      ]);

      if (resComments.ok) {
        const commentsData = await resComments.json();
        setPublicComments(commentsData.data || []);
      }
      if (resNotes.ok) {
        const notesData = await resNotes.json();
        setInternalNotes(notesData.data || []);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error loading details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadTicketData();
    }
  }, [id]);

  const handlePriorityChange = async (newPriority: string) => {
    try {
      setErrorMsg('');
      const res = await fetch(`/api/staff/tickets/${id}/priority`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ itPriority: newPriority }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update priority');
      }
      setTicket((prev) => (prev ? { ...prev, itPriority: newPriority } : null));
      setSuccessMsg('IT Priority updated successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setErrorMsg('');
      const res = await fetch(`/api/staff/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      setTicket((prev) =>
        prev ? { ...prev, status: newStatus, currentStatus: newStatus } : null
      );
      setSuccessMsg(`Ticket status moved to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleClaimTicket = async () => {
    if (!user) return;
    try {
      setErrorMsg('');
      const res = await fetch(`/api/staff/tickets/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assignedToId: user.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to assign ticket');
      }
      const updated = await res.json();
      setTicket((prev) => (prev ? { ...prev, assignedTo: updated.assignedTo || { id: user.id, name: user.name } } : null));
      setSuccessMsg('Ticket successfully claimed!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmittingComment(true);
      setErrorMsg('');
      const endpoint =
        activeTab === 'public'
          ? `/api/tickets/${id}/comments`
          : `/api/staff/tickets/${id}/internal-notes`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to post comment');
      }

      const created = await res.json();
      if (activeTab === 'public') {
        setPublicComments((prev) => [...prev, created]);
      } else {
        setInternalNotes((prev) => [...prev, created]);
      }
      setNewComment('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getStatusBadgeStyle = (st: string) => {
    switch (st) {
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
        return { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' };
    }
  };

  const ticketNumber = ticket?.ticketNumber || ticket?.ticketNo || `TKT-${ticket?.id}`;
  const currentStatus = ticket?.status || ticket?.currentStatus || 'NEW';
  const statusBadge = getStatusBadgeStyle(currentStatus);

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
              className="nav-btn"
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

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Top Bar with Back Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <button
                onClick={() => navigate('/it/queue')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  color: '#006B3C',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  marginBottom: '0.5rem',
                }}
              >
                &larr; Back to Ticket Queue
              </button>
              {ticket && (
                <h1 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, color: '#111827' }}>
                  <span style={{ color: '#006B3C', marginRight: '0.5rem' }}>{ticketNumber}:</span>
                  {ticket.summary}
                </h1>
              )}
            </div>

            {ticket && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
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
                  {currentStatus}
                </span>

                {(!ticket.assignedTo || Number(ticket.assignedTo.id) !== user?.id) && (
                  <button
                    onClick={handleClaimTicket}
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
                    Claim Ticket
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div style={{ backgroundColor: '#FDE8E8', border: '1px solid #F8B4B4', color: '#9B1C1C', padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: '#DEF7EC', border: '1px solid #BCF0DA', color: '#03543F', padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              {successMsg}
            </div>
          )}

          {loading ? (
            <div style={{ backgroundColor: '#FFFFFF', padding: '4rem 2rem', borderRadius: '10px', textAlign: 'center', color: '#6B7280', border: '1px solid #E5E7EB' }}>
              Loading ticket details...
            </div>
          ) : !ticket ? (
            <div style={{ backgroundColor: '#FFFFFF', padding: '4rem 2rem', borderRadius: '10px', textAlign: 'center', color: '#EF4444', border: '1px solid #E5E7EB' }}>
              Ticket not found.
            </div>
          ) : (
            <>
              {/* Requester Resolution Indicator Alert (BR-05) */}
              {ticket.requesterResolutionIndicated && (
                <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', padding: '0.85rem 1.25rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065F46', fontSize: '0.9rem', fontWeight: 500 }}>
                  <span>✓</span>
                  <span><strong>Requester Resolution Indicated:</strong> The requester noted that this issue appears to be resolved. Please verify and formally update status.</span>
                </div>
              )}

              {/* Meta Grid Card */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Requester</label>
                    <div style={{ marginTop: '0.35rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                      {ticket.requester?.name || 'Unknown'}
                    </div>
                    {ticket.requester?.email && (
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>{ticket.requester.email}</div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Category</label>
                    <div style={{ marginTop: '0.35rem', color: '#1F2937', fontWeight: 500, fontSize: '0.95rem' }}>
                      {ticket.category?.name || '-'}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Requested Priority</label>
                    <div style={{ marginTop: '0.35rem', fontWeight: 700, color: '#D97706', fontSize: '0.95rem' }}>
                      {ticket.requestedPriority}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>IT Priority (BR-12)</label>
                    <select
                      value={ticket.itPriority}
                      onChange={(e) => handlePriorityChange(e.target.value)}
                      style={{
                        marginTop: '0.35rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.45rem 0.75rem',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        backgroundColor: '#F9FAFB',
                        color: '#111827',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Status (BR-11)</label>
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      style={{
                        marginTop: '0.35rem',
                        display: 'block',
                        width: '100%',
                        padding: '0.45rem 0.75rem',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        backgroundColor: '#F9FAFB',
                        color: '#111827',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="NEW">New</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                      <option value="REOPENED">Reopened</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ticket Owner</label>
                    <div style={{ marginTop: '0.35rem', fontWeight: 600, color: '#111827', fontSize: '0.95rem' }}>
                      {ticket.assignedTo?.name ? (
                        <span>{ticket.assignedTo.name}</span>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontStyle: 'italic', fontWeight: 400 }}>Unassigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Card */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Description
                </h2>
                <p style={{ margin: 0, color: '#1F2937', fontSize: '0.95rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {ticket.description}
                </p>
              </div>

              {/* Tabs for Public Comments & Internal Notes */}
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                {/* Tab Header */}
                <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', backgroundColor: '#F8FAF9' }}>
                  <button
                    type="button"
                    onClick={() => setActiveTab('public')}
                    style={{
                      padding: '0.85rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'public' ? '#FFFFFF' : 'transparent',
                      color: activeTab === 'public' ? '#006B3C' : '#6B7280',
                      borderBottom: activeTab === 'public' ? '3px solid #006B3C' : '3px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>💬 Public Comments</span>
                    <span style={{ backgroundColor: activeTab === 'public' ? '#EAF6EF' : '#E5E7EB', color: activeTab === 'public' ? '#006B3C' : '#4B5563', padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                      {publicComments.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('internal')}
                    style={{
                      padding: '0.85rem 1.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      border: 'none',
                      backgroundColor: activeTab === 'internal' ? '#FFFBEB' : 'transparent',
                      color: activeTab === 'internal' ? '#B45309' : '#6B7280',
                      borderBottom: activeTab === 'internal' ? '3px solid #D97706' : '3px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <span>🔒 Internal Notes (Staff & Admin Only)</span>
                    <span style={{ backgroundColor: activeTab === 'internal' ? '#FEF3C7' : '#E5E7EB', color: activeTab === 'internal' ? '#92400E' : '#4B5563', padding: '0.1rem 0.45rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                      {internalNotes.length}
                    </span>
                  </button>
                </div>

                {/* Tab Content */}
                <div style={{ padding: '1.5rem', backgroundColor: activeTab === 'internal' ? '#FFFDF7' : '#FFFFFF' }}>
                  {/* Stream list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {(activeTab === 'public' ? publicComments : internalNotes).length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#9CA3AF', fontStyle: 'italic', fontSize: '0.9rem' }}>
                        {activeTab === 'public'
                          ? 'No public comments yet. Post a comment to communicate with the requester.'
                          : 'No internal notes yet. Internal notes are private to IT Staff and Administrators.'}
                      </div>
                    ) : (
                      (activeTab === 'public' ? publicComments : internalNotes).map((entry) => (
                        <div
                          key={entry.id}
                          style={{
                            padding: '1rem 1.25rem',
                            borderRadius: '8px',
                            border: entry.isInternal ? '1px solid #FDE68A' : '1px solid #E5E7EB',
                            backgroundColor: entry.isInternal ? '#FEF9C3' : '#F9FAFB',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.9rem' }}>
                                {entry.author?.name || 'Staff User'}
                              </span>
                              <span
                                style={{
                                  fontSize: '0.72rem',
                                  padding: '0.1rem 0.4rem',
                                  borderRadius: '4px',
                                  fontWeight: 600,
                                  backgroundColor: entry.author?.role === 'REQUESTER' ? '#E5E7EB' : '#EAF6EF',
                                  color: entry.author?.role === 'REQUESTER' ? '#374151' : '#006B3C',
                                }}
                              >
                                {entry.author?.role || 'IT_STAFF'}
                              </span>
                              {entry.isInternal && (
                                <span style={{ fontSize: '0.72rem', backgroundColor: '#FDE68A', color: '#92400E', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                                  INTERNAL
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                              {new Date(entry.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p style={{ margin: 0, color: '#1F2937', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                            {entry.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <textarea
                      rows={3}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={
                        activeTab === 'public'
                          ? 'Add a public comment visible to requester...'
                          : 'Add a private internal note (visible to IT Staff & Admin only)...'
                      }
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '6px',
                        border: activeTab === 'public' ? '1px solid #D1D5DB' : '1px solid #FCD34D',
                        fontSize: '0.9rem',
                        color: '#111827',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        style={{
                          backgroundColor: activeTab === 'public' ? '#006B3C' : '#B45309',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '0.55rem 1.25rem',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: submittingComment || !newComment.trim() ? 'not-allowed' : 'pointer',
                          opacity: submittingComment || !newComment.trim() ? 0.6 : 1,
                        }}
                      >
                        {submittingComment
                          ? 'Posting...'
                          : activeTab === 'public'
                          ? 'Post Public Comment'
                          : 'Add Internal Note'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
