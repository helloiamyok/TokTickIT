// 

import { useState } from 'react'

type Category = { id: number; name: string }
type SystemResult = { categories: Category[] }

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

export async function checkSystem(fetcher: typeof fetch = fetch): Promise<SystemResult> {
  const healthResponse = await fetcher(`${apiBase}/health`)
  if (!healthResponse.ok) throw new Error('Health check failed')

  const health = (await healthResponse.json()) as { status?: string }
  if (health.status !== 'ok') throw new Error('Health check failed')

  const categoriesResponse = await fetcher(`${apiBase}/categories`)
  if (!categoriesResponse.ok) throw new Error('Categories fetch failed')

  const data = (await categoriesResponse.json()) as { categories: Category[] }
  return { categories: data.categories }
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
      <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center' }}>
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
              width: '100%',
            }}
          >
            {loading ? 'Checking system…' : 'Check System'}
          </button>
        </div>

        {loading && <p style={{ marginTop: '16px', textAlign: 'center', color: '#6c757d' }}>⌛ Loading system status…</p>}

        {status === 'online' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ padding: '10px', backgroundColor: '#d1e7dd', color: '#0f5132', borderRadius: '6px', textAlign: 'center', marginBottom: '16px' }}>
              <strong>● System Status: Online</strong>
            </div>

            <h5 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#212529' }}>Available Service Categories:</h5>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {categories.map((item) => (
                <li
                  key={item.id}
                  style={{
                    padding: '10px 14px',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{item.name}</span>
                  <span style={{ color: '#6c757d', fontSize: '12px' }}>ID: #{item.id}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === 'offline' && (
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f8d7da', color: '#842029', borderRadius: '6px', fontSize: '14px' }}>
            <strong>System Status: Offline</strong>
            <p style={{ margin: '6px 0 0 0' }}>Unable to connect to TokTickIT API. Check that the backend is running, then try again.</p>
          </div>
        )}
      </div>
    </div>
  )
}