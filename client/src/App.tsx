import { useState } from 'react'

interface Category {
  id: number
  name: string
}

function App() {
  const [status, setStatus] = useState<string>('Unknown')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckSystem = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. ตรวจสอบสถานะ Health Endpoint ผ่าน /api/health
      const healthRes = await fetch('http://localhost:3000/api/health')
      if (!healthRes.ok) throw new Error('Health check failed')

      // 2. ดึงข้อมูล Categories ผ่าน /api/categories
      const catRes = await fetch('http://localhost:3000/api/categories')
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f1f5f9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1.5rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '2.5rem',
        borderRadius: '1.25rem',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}>
        <p style={{
          letterSpacing: '0.12em',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          margin: '0 0 0.5rem 0'
        }}>
          IT SERVICE DESK
        </p>

        <h1 style={{
          fontSize: '2.25rem',
          fontWeight: 800,
          color: '#0f172a',
          margin: '0 0 0.5rem 0',
          letterSpacing: '-0.025em'
        }}>
          TokTickIT
        </h1>

        <p style={{
          color: '#475569',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          margin: '0 0 1.75rem 0'
        }}>
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
            display: 'block'
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
          <div style={{
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
            gap: '0.5rem'
          }}>
            <span>●</span>
            <span>System Status: {status}</span>
          </div>
        )}

        {error && (
          <p style={{
            marginTop: '0.75rem',
            color: '#dc2626',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            {error}
          </p>
        )}

        {!loading && !error && categories.length > 0 && (
          <div style={{ marginTop: '1.75rem', textAlign: 'left' }}>
            <h3 style={{
              fontSize: '0.85rem',
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.75rem',
              fontWeight: 700
            }}>
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
                    gap: '0.5rem'
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
  )
}

export default App