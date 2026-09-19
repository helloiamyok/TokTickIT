import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserRecord {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt?: string;
}

export const UserManagement: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal / Drawer state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('REQUESTER');
  const [isActive, setIsActive] = useState(true);
  const [initialPassword, setInitialPassword] = useState('');
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        ...(search.trim() && { search: search.trim() }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res = await fetch(`/api/admin/users?${query.toString()}`, {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to load users');
      }
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setRole('REQUESTER');
    setIsActive(true);
    setInitialPassword('');
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserRecord) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setIsActive(u.isActive);
    setInitialPassword('');
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Edit flow
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, role, isActive }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update user');

        // If new initial password supplied
        if (initialPassword.trim()) {
          const resetRes = await fetch(`/api/admin/users/${editingUser.id}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ newInitialPassword: initialPassword.trim() }),
          });
          const resetData = await resetRes.json();
          if (!resetRes.ok) throw new Error(resetData.error || 'Failed to set initial password');
        }

        setSuccessMsg(`User "${name}" updated successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        // Create flow
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name, email, role, isActive, initialPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to create user');
        setSuccessMsg(`User "${name}" created successfully.`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
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
              Administrator Portal
            </span>
          </div>

          <nav className="header-nav">
            <button
              onClick={() => navigate('/it/queue')}
              className="nav-btn"
            >
              📥 IT Queue
            </button>
            <button
              onClick={() => navigate('/admin/users')}
              className="nav-btn active"
            >
              👥 User Management
            </button>
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
      <main style={{ flex: 1, padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Row with Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.65rem', color: '#006B3C', fontWeight: 700 }}>User Management</h1>
              <p style={{ margin: '0.25rem 0 0', color: '#6B7280', fontSize: '0.9rem' }}>
                Manage user credentials, single-role assignments, and account activation states
              </p>
            </div>
            <button
              onClick={openCreateModal}
              style={{
                backgroundColor: '#006B3C',
                color: '#FFFFFF',
                border: 'none',
                padding: '0.6rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              + Create User
            </button>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div style={{ backgroundColor: '#FDE8E8', border: '1px solid #F8B4B4', color: '#9B1C1C', padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              <strong>Error:</strong> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={{ backgroundColor: '#DEF7EC', border: '1px solid #BCF0DA', color: '#03543F', padding: '0.85rem 1.25rem', borderRadius: '8px', fontSize: '0.9rem' }}>
              ✓ {successMsg}
            </div>
          )}

          {/* Filter Bar */}
          <div style={{ backgroundColor: '#FFFFFF', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #E5E7EB', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#006B3C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Search
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>Role:</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
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
                <option value="">All Roles</option>
                <option value="REQUESTER">Requester</option>
                <option value="IT_STAFF">IT Staff</option>
                <option value="ADMINISTRATOR">Administrator</option>
              </select>
            </div>

            {(search || roleFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                }}
                style={{
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  color: '#4B5563',
                }}
              >
                Reset
              </button>
            )}
          </div>

          {/* User Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAF9', borderBottom: '1px solid #E5E7EB', color: '#4B5563', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Email</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Role</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#6B7280' }}>
                        No users found matching your query.
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: '1px solid #E5E7EB', transition: 'background-color 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#111827' }}>
                          {u.name}
                          {user?.id === u.id && (
                            <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', backgroundColor: '#EAF6EF', color: '#006B3C', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                              You
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#4B5563' }}>{u.email}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.15rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor:
                                u.role === 'ADMINISTRATOR'
                                  ? '#EDE9FE'
                                  : u.role === 'IT_STAFF'
                                  ? '#EAF6EF'
                                  : '#F3F4F6',
                              color:
                                u.role === 'ADMINISTRATOR'
                                  ? '#5B21B6'
                                  : u.role === 'IT_STAFF'
                                  ? '#006B3C'
                                  : '#374151',
                            }}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            style={{
                              padding: '0.15rem 0.55rem',
                              borderRadius: '10px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              backgroundColor: u.isActive ? '#DEF7EC' : '#FDE8E8',
                              color: u.isActive ? '#03543F' : '#9B1C1C',
                            }}
                          >
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => openEditModal(u)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#006B3C',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                            }}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Create / Edit User Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '10px',
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              boxSizing: 'border-box',
            }}
          >
            <h2 style={{ margin: '0 0 1.25rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User'}
            </h2>

            {modalError && (
              <div style={{ backgroundColor: '#FDE8E8', border: '1px solid #F8B4B4', color: '#9B1C1C', padding: '0.65rem 1rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="REQUESTER">Requester</option>
                  <option value="IT_STAFF">IT Staff</option>
                  <option value="ADMINISTRATOR">Administrator</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                  Active Account
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  {editingUser ? 'Set New Initial Password (Optional)' : 'Initial Password *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  placeholder={editingUser ? 'Leave blank to keep current password' : 'At least 6 characters'}
                  value={initialPassword}
                  onChange={(e) => setInitialPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box',
                    outline: 'none',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem', display: 'block' }}>
                  User will be required to change password upon first login (mustChangePassword).
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #E5E7EB' }}>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.55rem 1.1rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    backgroundColor: '#FFFFFF',
                    color: '#374151',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '0.55rem 1.25rem',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    backgroundColor: '#006B3C',
                    color: '#FFFFFF',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
