import { useState } from 'react'

type Category = { id: number; name: string }
type SystemResult = { categories: Category[] }

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export async function checkSystem(fetcher: typeof fetch = fetch): Promise<SystemResult> {
  const healthResponse = await fetcher(`${apiBase}/health`)
  if (!healthResponse.ok) throw new Error('Health check failed')

  const health = (await healthResponse.json()) as { status?: string }
  if (health.status !== 'ok') throw new Error('Health check failed')

  return { categories: [] }
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [status, setStatus] = useState<'idle' | 'online' | 'offline'>('idle')

  async function handleCheckSystem() {
    setLoading(true)
    setStatus('idle')
    setCategories([])
    try {
      const result = await checkSystem()
      setCategories(result.categories)
      setStatus('online')
    } catch {
      setStatus('offline')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '450px' }}>
        <p style={{ color: '#6c757d', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '8px' }}>IT SERVICE DESK</p>
        <h1 style={{ fontSize: '28px', margin: '0 0 10px 0', color: '#212529' }}>TokTickIT</h1>
        <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '24px' }}>A simple check for the services that keep work moving.</p>
        
        <button 
          onClick={handleCheckSystem} 
          disabled={loading}
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            fontSize: '16px',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500,
            width: '100%'
          }}
        >
          {loading ? 'Checking system…' : 'Check System'}
        </button>

        {loading && <p style={{ marginTop: '16px', color: '#6c757d' }}>⌛ Loading system status…</p>}

        {status === 'online' && (
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#d1e7dd', color: '#0f5132', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>● System Status: Online</p>
          </div>
        )}

        {status === 'offline' && (
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '6px', textAlign: 'left', fontSize: '14px' }}>
            <p style={{ margin: '0 0 6px 0', fontWeight: 'bold' }}>System Status: Offline</p>
            <p style={{ margin: 0 }}>Unable to connect to TokTickIT API. Check that the backend is running, then try again.</p>
          </div>
        )}
      </div>
    </div>
  )
}