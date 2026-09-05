import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  ticketNumber?: string;
  ticketNo?: string;
  summary: string;
  status?: string;
  currentStatus?: string;
  requestedPriority: string;
  createdAt: string;
  category?: { name: string };
  relatedSystem?: { name: string };
}

interface MyTicketsProps {
  currentRequester: { id: number; name: string } | null;
  onSelectTicket?: (ticketId: number) => void;
  onCreateNew?: () => void;
}

export const MyTickets: React.FC<MyTicketsProps> = ({
  currentRequester,
  onSelectTicket,
  onCreateNew,
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const fetchTickets = async () => {
    if (!currentRequester) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        requesterId: String(currentRequester.id),
        search: search.trim(),
        status: statusFilter,
        priority: priorityFilter,
        categoryId: categoryFilter,
        sortBy: 'createdAt',
        order: sortOrder,
        page: String(page),
        limit: '5',
      });

      const res = await fetch(`/api/tickets?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');

      const result = await res.json();
      setTickets(result.data || []);
      setTotalPages(result.pagination?.totalPages || 1);
      setTotalItems(result.pagination?.totalItems || 0);
    } catch (err: any) {
      setError(err.message || 'Error loading tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [currentRequester, statusFilter, priorityFilter, categoryFilter, sortOrder, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'NEW':
        return { bg: '#EAF6EF', text: '#006B3C', border: '#A7F3D0' };
      case 'IN_PROGRESS':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' };
      case 'RESOLVED':
      case 'CLOSED':
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' };
      default:
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' };
    }
  };

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { bg: '#FDE8E8', text: '#9B1C1C' };
      case 'HIGH':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#92400E' };
      default:
        return { bg: '#E0F2FE', text: '#0369A1' };
    }
  };

  const isFiltering =
    search.trim() !== '' ||
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    categoryFilter !== 'ALL';

  return (
    <div className="page-container">
      <div className="content-wrapper">
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', color: '#006B3C' }}>My Tickets</h1>
            <p style={{ margin: '0.25rem 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
              Showing tickets submitted by <strong style={{ color: '#1F2937' }}>{currentRequester ? currentRequester.name : 'Unknown'}</strong>
            </p>
          </div>
          {onCreateNew && (
            <button
              onClick={onCreateNew}
              style={{
                backgroundColor: '#006B3C',
                color: '#fff',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
              }}
            >
              + Create Ticket
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSearchSubmit} className="filter-bar-grid">
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Search</label>
              <input
                type="text"
                placeholder="Ticket No or Summary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.88rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="NEW">New</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="PENDING">Pending</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>Sort Date</label>
              <select
                value={sortOrder}
                onChange={(e) => { setSortOrder(e.target.value as 'asc' | 'desc'); setPage(1); }}
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.88rem' }}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            <div>
              <button
                type="submit"
                style={{ width: '100%', padding: '0.55rem', backgroundColor: '#006B3C', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                Filter / Search
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '1rem', borderRadius: '6px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {/* Content Container */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>Loading tickets...</div>
          ) : tickets.length === 0 ? (
            isFiltering ? (
              // 1. No-results State
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
                <h3 style={{ color: '#1F2937', margin: '0 0 0.5rem 0' }}>No Tickets Match Your Filter</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  Try adjusting your search keyword, category, or status filter.
                </p>
                <button
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('ALL');
                    setPriorityFilter('ALL');
                    setCategoryFilter('ALL');
                    setPage(1);
                  }}
                  style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              // 2. Empty State
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎫</div>
                <h3 style={{ color: '#1F2937', margin: '0 0 0.5rem 0' }}>No Tickets Found</h3>
                <p style={{ color: '#6B7280', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                  You haven't submitted any IT support tickets yet. Need help? Create your first ticket now.
                </p>
                {onCreateNew && (
                  <button
                    onClick={onCreateNew}
                    style={{ backgroundColor: '#006B3C', color: '#fff', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    + Create Your First Ticket
                  </button>
                )}
              </div>
            )
          ) : (
            <>
              {/* Desktop / Tablet Data Table */}
              <div className="desktop-table-view">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', color: '#4B5563' }}>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Ticket No.</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Summary</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Priority</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Created Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => {
                      const ticketNo = t.ticketNumber || t.ticketNo || `TKT-${t.id}`;
                      const currentStatus = t.status || t.currentStatus || 'NEW';
                      const statusBadge = getStatusBadgeStyle(currentStatus);
                      const priorityBadge = getPriorityBadgeStyle(t.requestedPriority);
                      return (
                        <tr
                          key={t.id}
                          onClick={() => onSelectTicket && onSelectTicket(t.id)}
                          style={{ borderBottom: '1px solid #E5E7EB', cursor: onSelectTicket ? 'pointer' : 'default' }}
                        >
                          <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#006B3C' }}>{ticketNo}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#1F2937', fontWeight: 500 }}>{t.summary}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#4B5563' }}>{t.category?.name || '-'}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: priorityBadge.bg, color: priorityBadge.text }}>
                              {t.requestedPriority}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{ padding: '0.25rem 0.65rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}` }}>
                              {currentStatus}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#6B7280', fontSize: '0.85rem' }}>
                            {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View (<768px) */}
              <div className="mobile-card-view">
                {tickets.map((t) => {
                  const ticketNo = t.ticketNumber || t.ticketNo || `TKT-${t.id}`;
                  const currentStatus = t.status || t.currentStatus || 'NEW';
                  const statusBadge = getStatusBadgeStyle(currentStatus);
                  const priorityBadge = getPriorityBadgeStyle(t.requestedPriority);
                  return (
                    <div
                      key={t.id}
                      className="ticket-card-item"
                      onClick={() => onSelectTicket && onSelectTicket(t.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontWeight: 700, color: '#006B3C', fontSize: '0.95rem' }}>{ticketNo}</span>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}` }}>
                            {currentStatus}
                          </span>
                          <span style={{ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 600, backgroundColor: priorityBadge.bg, color: priorityBadge.text }}>
                            {t.requestedPriority}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 600, color: '#1F2937', fontSize: '0.92rem', marginBottom: '0.35rem' }}>
                        {t.summary}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#6B7280' }}>
                        <span>📂 {t.category?.name || '-'}</span>
                        <span>📅 {new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Pagination */}
          {tickets.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1.25rem', borderTop: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total {totalItems} tickets)
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  style={{ padding: '0.35rem 0.8rem', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: page <= 1 ? '#E5E7EB' : '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  style={{ padding: '0.35rem 0.8rem', borderRadius: '4px', border: '1px solid #D1D5DB', backgroundColor: page >= totalPages ? '#E5E7EB' : '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};