import { useState } from 'react'
import { RequesterProvider, useRequester } from './context/RequesterContext'
import { DevRequesterSwitcher } from './components/DevRequesterSwitcher'
import { CreateTicket } from './components/CreateTicket'
import { MyTickets } from './components/MyTickets'
import { TicketDetail } from './components/TicketDetail'

interface Category {
  id: number
  name: string
}

function MainContent() {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'system' | 'detail'>('list')
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null)
  const [status, setStatus] = useState<string>('Unknown')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // ดึง active persona มาแสดงผลในหน้านี้
  const { currentRequester } = useRequester()

  // ฟังก์ชันเปิดหน้ารายละเอียดตั๋ว (Issue 6)
  const handleSelectTicket = (ticketId: number) => {
    setSelectedTicketId(ticketId)
    setActiveTab('detail')
  }

  const handleCheckSystem = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. ตรวจสอบสถานะ Health Endpoint ผ่าน /api/health
      const healthRes = await fetch('/api/health')
      if (!healthRes.ok) throw new Error('Health check failed')

      // 2. ดึงข้อมูล Categories ผ่าน /api/categories
      const catRes = await fetch('/api/categories')
      if (!catRes.ok) throw new Error('Categories fetch failed')
      const catData: Category[] = await catRes.json()

      setStatus('Online')
      setCategories(catData)
    } catch {
      setStatus('Offline')
      setError('Unable to connect to TokTickIT API')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7F6',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Navbar with Dev Persona Switcher & Tab Navigation */}
      <header
        style={{
          backgroundColor: '#006B3C',
          borderBottom: '1px solid #005630',
          padding: '0.65rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              Sprint 2
            </span>
          </div>

          {/* Tab Navigation */}
          <nav style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setActiveTab('list')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'list' || activeTab === 'detail' ? '#0B7A46' : 'transparent',
                color: '#FFFFFF',
                transition: 'all 0.15s ease',
              }}
            >
              📋 My Tickets
            </button>
            <button
              onClick={() => setActiveTab('create')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'create' ? '#0B7A46' : 'transparent',
                color: '#FFFFFF',
                transition: 'all 0.15s ease',
              }}
            >
              ➕ Create Ticket
            </button>
            <button
              onClick={() => setActiveTab('system')}
              style={{
                padding: '0.45rem 0.95rem',
                borderRadius: '6px',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === 'system' ? '#0B7A46' : 'transparent',
                color: '#FFFFFF',
                transition: 'all 0.15s ease',
              }}
            >
              🔍 System Status
            </button>
          </nav>
        </div>

        <DevRequesterSwitcher />
      </header>

      {/* Main View Area */}
      {activeTab === 'list' ? (
        <MyTickets
          currentRequester={currentRequester}
          onSelectTicket={handleSelectTicket}
          onCreateNew={() => setActiveTab('create')}
        />
      ) : activeTab === 'create' ? (
        <CreateTicket
          currentRequester={currentRequester}
          onCancel={() => setActiveTab('list')}
          onSuccess={() => setActiveTab('list')}
        />
      ) : activeTab === 'detail' && selectedTicketId ? (
        <TicketDetail
          ticketId={selectedTicketId}
          currentRequester={currentRequester}
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

            {/* Persona Card */}
            {currentRequester && (
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
                {currentRequester.name} ({currentRequester.email})
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
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#0066ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.75rem',
                padding: '0.9rem 1.25rem',
                fontSize: '1.05rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 102, 255, 0.2)',
                display: 'block',
              }}
            >
              {loading ? 'Checking...' : 'Check System'}
            </button>

            {loading && (
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

            {!loading && !error && categories.length > 0 && (
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
                      <span style={{ color: '#0066ff', fontSize: '0.8rem' }}>▸</span> {cat.name}
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

function App() {
  return (
    <RequesterProvider>
      <MainContent />
    </RequesterProvider>
  )
}

export default App