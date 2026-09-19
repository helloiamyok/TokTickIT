import React, { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './pages/Login'
import { ChangePassword } from './pages/ChangePassword'
import { StaffTicketQueue } from './pages/StaffTicketQueue'
import { StaffTicketDetail } from './pages/StaffTicketDetail'
import { UserManagement } from './pages/UserManagement'
import { CreateTicket } from './components/CreateTicket'
import { MyTickets } from './components/MyTickets'
import { TicketDetail } from './components/TicketDetail'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'

interface Category {
  id: number
  name: string
}

function RequesterPortal() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'system' | 'detail'>('list')
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [status, setStatus] = useState<string>('Unknown')
  const [categories, setCategories] = useState<Category[]>([])
  const [systemLoading, setSystemLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSelectTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setActiveTab('detail')
  }

  const handleCheckSystem = async () => {
    setSystemLoading(true)
    setError(null)
    try {
      const healthRes = await fetch('/api/health')
      if (!healthRes.ok) throw new Error('Health check failed')

      const catRes = await fetch('/api/categories')
      if (!catRes.ok) throw new Error('Categories fetch failed')
      const catData: Category[] = await catRes.json()

      setStatus('Online')
      setCategories(catData)
    } catch {
      setStatus('Offline')
      setError('Unable to connect to TokTickIT API')
    } finally {
      setSystemLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7F6',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
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
              Sprint 3
            </span>
          </div>

          {/* Tab Navigation */}
          <nav className="header-nav">
            <button
              onClick={() => setActiveTab('list')}
              className={`nav-btn ${activeTab === 'list' || activeTab === 'detail' ? 'active' : ''}`}
            >
              📋 My Tickets
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`nav-btn ${activeTab === 'create' ? 'active' : ''}`}
            >
              ➕ Create Ticket
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`nav-btn ${activeTab === 'system' ? 'active' : ''}`}
            >
              🔍 System Status
            </button>
            {(user?.role === 'IT_STAFF' || user?.role === 'ADMINISTRATOR') && (
              <button
                onClick={() => navigate('/it/queue')}
                className="nav-btn"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontWeight: 700 }}
              >
                📥 IT Queue
              </button>
            )}
            {user?.role === 'ADMINISTRATOR' && (
              <button
                onClick={() => navigate('/admin/users')}
                className="nav-btn"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)', fontWeight: 700 }}
              >
                👥 User Management
              </button>
            )}
          </nav>
        </div>

        {/* Authenticated User Status & Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', color: '#FFFFFF' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user.name}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                {user.email} • <span style={{ textTransform: 'capitalize', fontWeight: 700, backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{user.role.toLowerCase()}</span>
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

      {/* Main View Area */}
      {activeTab === 'list' ? (
        <MyTickets
          currentRequester={user}
          onSelectTicket={handleSelectTicket}
          onCreateNew={() => setActiveTab('create')}
        />
      ) : activeTab === 'create' ? (
        <CreateTicket
          currentRequester={user}
          onCancel={() => setActiveTab('list')}
          onSuccess={() => setActiveTab('list')}
        />
      ) : activeTab === 'detail' && selectedTicketId ? (
        <TicketDetail
          ticketId={selectedTicketId}
          currentRequester={user}
          onBack={() => setActiveTab('list')}
        />
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: '2.5rem',
              borderRadius: '1.25rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
              width: '100%',
              maxWidth: '440px',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                letterSpacing: '0.12em',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                margin: '0 0 0.5rem 0',
              }}
            >
              TokTickIT IT Service Desk
            </p>

            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                color: '#0f172a',
                margin: '0 0 0.5rem 0',
                letterSpacing: '-0.025em',
              }}
            >
              TokTickIT
            </h1>

            {/* Authenticated User Banner */}
            {user && (
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  padding: '0.6rem 0.8rem',
                  marginBottom: '1.25rem',
                  fontSize: '0.85rem',
                  color: '#334155',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, color: '#0f172a' }}>Logged in as: </span>
                {user.name} ({user.email})
              </div>
            )}

            <p
              style={{
                color: '#475569',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                margin: '0 0 1.75rem 0',
              }}
            >
              A simple check for the services that keep work moving.
            </p>

            <button
              onClick={handleCheckSystem}
              disabled={systemLoading}
              style={{
                width: '100%',
                backgroundColor: '#006B3C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.9rem 1.25rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                cursor: systemLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'block',
              }}
            >
              {systemLoading ? 'Checking...' : 'Check System'}
            </button>

            {systemLoading && (
              <p style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                Loading categories...
              </p>
            )}

            {status !== 'Unknown' && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '0.9rem 1rem',
                  borderRadius: '0.75rem',
                  fontSize: '1rem',
                  fontWeight: 700,
                  backgroundColor: status === 'Online' ? '#dcfce7' : '#fee2e2',
                  color: status === 'Online' ? '#166534' : '#991b1b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <span>●</span>
                <span>System Status: {status}</span>
              </div>
            )}

            {error && (
              <p
                style={{
                  marginTop: '0.75rem',
                  color: '#dc2626',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              >
                {error}
              </p>
            )}

            {!systemLoading && !error && categories.length > 0 && (
              <div style={{ marginTop: '1.75rem', textAlign: 'left' }}>
                <h3
                  style={{
                    fontSize: '0.85rem',
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  Available Categories:
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {categories.map((cat) => (
                    <li
                      key={cat.id}
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        padding: '0.65rem 0.85rem',
                        marginBottom: '0.5rem',
                        fontSize: '0.925rem',
                        color: '#1e293b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ color: '#006B3C', fontSize: '0.8rem' }}>▸</span> {cat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7F6' }}>
        <p style={{ color: '#006B3C', fontWeight: 600 }}>Loading TokTickIT session...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          !user ? (
            <Login />
          ) : user.mustChangePassword ? (
            <Navigate to="/change-password" replace />
          ) : user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR' ? (
            <Navigate to="/it/queue" replace />
          ) : (
            <Navigate to="/tickets" replace />
          )
        }
      />

      <Route
        path="/change-password"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : (
            <ChangePassword />
          )
        }
      />

      {/* IT Staff & Admin Queue Route */}
      <Route
        path="/it/queue"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.mustChangePassword ? (
            <Navigate to="/change-password" replace />
          ) : user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR' ? (
            <StaffTicketQueue />
          ) : (
            <Navigate to="/tickets" replace />
          )
        }
      />

      {/* IT Staff Ticket Detail Route */}
      <Route
        path="/it/tickets/:id"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.mustChangePassword ? (
            <Navigate to="/change-password" replace />
          ) : user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR' ? (
            <StaffTicketDetail />
          ) : (
            <Navigate to="/tickets" replace />
          )
        }
      />

      {/* Administrator User Management Route */}
      <Route
        path="/admin/users"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.mustChangePassword ? (
            <Navigate to="/change-password" replace />
          ) : user.role === 'ADMINISTRATOR' ? (
            <UserManagement />
          ) : (
            <Navigate to="/it/queue" replace />
          )
        }
      />

      {/* Requester Portal Route */}
      <Route
        path="/tickets"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.mustChangePassword ? (
            <Navigate to="/change-password" replace />
          ) : (
            <RequesterPortal />
          )
        }
      />

      {/* Root Path */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.mustChangePassword ? (
            <Navigate to="/change-password" replace />
          ) : user.role === 'IT_STAFF' || user.role === 'ADMINISTRATOR' ? (
            <Navigate to="/it/queue" replace />
          ) : (
            <Navigate to="/tickets" replace />
          )
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App