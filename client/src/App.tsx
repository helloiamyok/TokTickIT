import { useState, useEffect, type FormEvent } from 'react'
import { RequesterProvider, useRequester } from './context/RequesterContext'
import { DevRequesterSwitcher } from './components/DevRequesterSwitcher'

interface Category {
  id: number
  name: string
}

interface RelatedSystem {
  id: number
  name: string
}

interface CreatedTicket {
  id: number
  ticketNo: string
  summary: string
  description: string
  currentStatus: string
  requestedPriority: string
  createdAt: string
  category?: { name: string }
  relatedSystem?: { name: string }
  requester?: { name: string; email: string }
}

interface FormErrors {
  requester?: string
  title?: string
  categoryId?: string
  relatedSystemId?: string
  description?: string
  general?: string
}

function TicketCreationForm() {
  const { currentRequester } = useRequester()

  // Master data
  const [categories, setCategories] = useState<Category[]>([])
  const [relatedSystems, setRelatedSystems] = useState<RelatedSystem[]>([])
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true)

  // Form inputs
  const [title, setTitle] = useState<string>('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [relatedSystemId, setRelatedSystemId] = useState<string>('')
  const [priority, setPriority] = useState<string>('MEDIUM')
  const [description, setDescription] = useState<string>('')

  // 4 States: idle | error | loading | success
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [createdTicket, setCreatedTicket] = useState<CreatedTicket | null>(null)

  // Fetch Master Data on Mount
  useEffect(() => {
    const fetchMasterData = async () => {
      setIsDataLoading(true)
      try {
        const [catRes, sysRes] = await Promise.all([
          fetch('http://localhost:3000/api/categories').catch(() => null),
          fetch('http://localhost:3000/api/related-systems').catch(() => null),
        ])

        if (catRes && catRes.ok) {
          const catData = await catRes.json()
          if (Array.isArray(catData)) setCategories(catData)
        }
        if (sysRes && sysRes.ok) {
          const sysData = await sysRes.json()
          if (Array.isArray(sysData)) setRelatedSystems(sysData)
        }
      } catch (err) {
        console.error('Error fetching master data:', err)
      } finally {
        setIsDataLoading(false)
      }
    }

    fetchMasterData()
  }, [])

  // Validate form
  const validate = (): boolean => {
    const errors: FormErrors = {}

    if (!currentRequester) {
      errors.requester = 'Please select an active Requester from the switcher.'
    }
    if (!title.trim()) {
      errors.title = 'Title / Summary is required.'
    }
    if (!categoryId) {
      errors.categoryId = 'Please select a Category.'
    }
    if (!relatedSystemId) {
      errors.relatedSystemId = 'Please select a Related System.'
    }
    if (!description.trim()) {
      errors.description = 'Description is required.'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Form Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    // Check validation (Error State if invalid)
    if (!validate()) {
      return
    }

    setFormErrors({})
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:3000/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requesterId: currentRequester?.id,
          title: title.trim(),
          summary: title.trim(),
          categoryId: Number(categoryId),
          relatedSystemId: Number(relatedSystemId),
          requestedPriority: priority,
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Server responded with status ${response.status}`)
      }

      const ticketData: CreatedTicket = await response.json()
      setCreatedTicket(ticketData)

      // Reset form fields
      setTitle('')
      setCategoryId('')
      setRelatedSystemId('')
      setPriority('MEDIUM')
      setDescription('')
      setFormErrors({})
    } catch (err: any) {
      setFormErrors({
        general: err.message || 'Failed to submit ticket. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCreatedTicket(null)
    setFormErrors({})
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5F7F6',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#1F2937',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Navigation Bar - Zen Green Theme (#006B3C) */}
      <header
        style={{
          backgroundColor: '#006B3C',
          color: '#ffffff',
          padding: '0.85rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0, 107, 60, 0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              color: '#006B3C',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.1rem',
            }}
          >
            T
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              TokTickIT
            </span>
            <span
              style={{
                marginLeft: '0.6rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 600,
                padding: '0.2rem 0.55rem',
                borderRadius: '9999px',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              Zen Green
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <DevRequesterSwitcher />
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          padding: '2rem 1rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '680px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
            padding: '2.5rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Header section */}
          <div style={{ marginBottom: '1.75rem', borderBottom: '1px solid #F3F4F6', paddingBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#006B3C', fontSize: '1.2rem' }}>🌿</span>
              <h1
                style={{
                  fontSize: '1.65rem',
                  fontWeight: 800,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Create Support Ticket
              </h1>
            </div>
            <p style={{ color: '#6B7280', fontSize: '0.925rem', margin: '0.35rem 0 0 0' }}>
              Submit an IT service request. Fill in all required information below.
            </p>
          </div>

          {/* 5. SUCCESS STATE ALERT BANNER */}
          {createdTicket && (
            <div
              id="success-banner"
              style={{
                backgroundColor: '#EAF6EF',
                border: '2px solid #006B3C',
                borderRadius: '12px',
                padding: '1.25rem 1.5rem',
                marginBottom: '1.75rem',
                color: '#006B3C',
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>🎉</span> Ticket Created Successfully!
                </h3>
                <span
                  style={{
                    backgroundColor: '#006B3C',
                    color: '#ffffff',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  ID: #{createdTicket.id}
                </span>
              </div>
              <div style={{ fontSize: '0.9rem', color: '#166534', lineHeight: 1.6, marginTop: '0.5rem' }}>
                <div><strong>Ticket Number:</strong> {createdTicket.ticketNo}</div>
                <div><strong>Summary:</strong> {createdTicket.summary}</div>
                <div><strong>Status:</strong> {createdTicket.currentStatus} | <strong>Priority:</strong> {createdTicket.requestedPriority}</div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#006B3C',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Create Another Ticket
                </button>
              </div>
            </div>
          )}

          {/* 3. ERROR STATE ALERT BANNER */}
          {(Object.keys(formErrors).length > 0 || formErrors.general) && (
            <div
              id="error-banner"
              style={{
                backgroundColor: '#FEE2E2',
                border: '1px solid #DC2626',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.75rem',
                color: '#991B1B',
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <span>⚠️</span>
                <span>Please correct the errors below before submitting:</span>
              </div>
              <ul style={{ margin: '0.25rem 0 0 1.5rem', padding: 0 }}>
                {formErrors.requester && <li>{formErrors.requester}</li>}
                {formErrors.title && <li>{formErrors.title}</li>}
                {formErrors.categoryId && <li>{formErrors.categoryId}</li>}
                {formErrors.relatedSystemId && <li>{formErrors.relatedSystemId}</li>}
                {formErrors.description && <li>{formErrors.description}</li>}
                {formErrors.general && <li>{formErrors.general}</li>}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Requester Display Box (Idle / Context) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.4rem',
                }}
              >
                Requester <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: currentRequester ? '#F8FAF9' : '#FEF2F2',
                  border: formErrors.requester
                    ? '1.5px solid #DC2626'
                    : currentRequester
                    ? '1px solid #D1D5DB'
                    : '1px dashed #F87171',
                  borderRadius: '8px',
                }}
              >
                {currentRequester ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#EAF6EF',
                        color: '#006B3C',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                      }}
                    >
                      {currentRequester.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#111827', fontSize: '0.925rem' }}>
                        {currentRequester.name}
                      </div>
                      <div style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                        {currentRequester.email}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#DC2626', fontSize: '0.875rem', fontWeight: 500 }}>
                    ⚠️ No Requester selected. Please select one in the top right switcher.
                  </div>
                )}
                {currentRequester && (
                  <span
                    style={{
                      backgroundColor: '#EAF6EF',
                      color: '#006B3C',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    Active Persona
                  </span>
                )}
              </div>
              {formErrors.requester && (
                <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                  {formErrors.requester}
                </p>
              )}
            </div>

            {/* Title / Summary Field */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="ticket-title"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.4rem',
                }}
              >
                Title / Summary <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                id="ticket-title"
                type="text"
                placeholder="e.g., Cannot connect to Campus Wi-Fi"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  if (formErrors.title) {
                    setFormErrors((prev) => ({ ...prev, title: undefined }))
                  }
                }}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: formErrors.title ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  if (!formErrors.title) {
                    e.currentTarget.style.borderColor = '#006B3C'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)'
                  }
                }}
                onBlur={(e) => {
                  if (!formErrors.title) {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              />
              {formErrors.title && (
                <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                  {formErrors.title}
                </p>
              )}
            </div>

            {/* 2-Column Row for Category & Related System */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              {/* Category */}
              <div>
                <label
                  htmlFor="ticket-category"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.4rem',
                  }}
                >
                  Category <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="ticket-category"
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value)
                    if (formErrors.categoryId) {
                      setFormErrors((prev) => ({ ...prev, categoryId: undefined }))
                    }
                  }}
                  disabled={isSubmitting || isDataLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: formErrors.categoryId ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: categoryId ? '#111827' : '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    if (!formErrors.categoryId) {
                      e.currentTarget.style.borderColor = '#006B3C'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)'
                    }
                  }}
                  onBlur={(e) => {
                    if (!formErrors.categoryId) {
                      e.currentTarget.style.borderColor = '#D1D5DB'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{ color: '#111827' }}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {formErrors.categoryId && (
                  <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                    {formErrors.categoryId}
                  </p>
                )}
              </div>

              {/* Related System */}
              <div>
                <label
                  htmlFor="ticket-related-system"
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '0.4rem',
                  }}
                >
                  Related System <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <select
                  id="ticket-related-system"
                  value={relatedSystemId}
                  onChange={(e) => {
                    setRelatedSystemId(e.target.value)
                    if (formErrors.relatedSystemId) {
                      setFormErrors((prev) => ({ ...prev, relatedSystemId: undefined }))
                    }
                  }}
                  disabled={isSubmitting || isDataLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    border: formErrors.relatedSystemId ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                    outline: 'none',
                    boxSizing: 'border-box',
                    backgroundColor: '#ffffff',
                    color: relatedSystemId ? '#111827' : '#9CA3AF',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    if (!formErrors.relatedSystemId) {
                      e.currentTarget.style.borderColor = '#006B3C'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)'
                    }
                  }}
                  onBlur={(e) => {
                    if (!formErrors.relatedSystemId) {
                      e.currentTarget.style.borderColor = '#D1D5DB'
                      e.currentTarget.style.boxShadow = 'none'
                    }
                  }}
                >
                  <option value="">-- Select Related System --</option>
                  {relatedSystems.map((sys) => (
                    <option key={sys.id} value={sys.id} style={{ color: '#111827' }}>
                      {sys.name}
                    </option>
                  ))}
                </select>
                {formErrors.relatedSystemId && (
                  <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                    {formErrors.relatedSystemId}
                  </p>
                )}
              </div>
            </div>

            {/* Requested Priority */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="ticket-priority"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.4rem',
                }}
              >
                Requested Priority
              </label>
              <select
                id="ticket-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  cursor: 'pointer',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#006B3C'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="LOW">Low - General query or non-urgent request</option>
                <option value="MEDIUM">Medium - Standard issue affecting normal work</option>
                <option value="HIGH">High - Urgent issue blocking critical operations</option>
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label
                htmlFor="ticket-description"
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.4rem',
                }}
              >
                Description <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <textarea
                id="ticket-description"
                rows={4}
                placeholder="Provide details about the issue, error messages, and steps to reproduce..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  if (formErrors.description) {
                    setFormErrors((prev) => ({ ...prev, description: undefined }))
                  }
                }}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  border: formErrors.description ? '1.5px solid #DC2626' : '1px solid #D1D5DB',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  lineHeight: '1.5',
                  resize: 'vertical',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                  if (!formErrors.description) {
                    e.currentTarget.style.borderColor = '#006B3C'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)'
                  }
                }}
                onBlur={(e) => {
                  if (!formErrors.description) {
                    e.currentTarget.style.borderColor = '#D1D5DB'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              />
              {formErrors.description && (
                <p style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.35rem', margin: '0.35rem 0 0 0' }}>
                  {formErrors.description}
                </p>
              )}
            </div>

            {/* 4. LOADING STATE & SUBMIT BUTTON (Zen Green #006B3C) */}
            <button
              id="submit-ticket-btn"
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: isSubmitting ? '#9CA3AF' : '#006B3C',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.9rem 1.5rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(0, 107, 60, 0.25)',
                transition: 'background-color 0.2s, transform 0.1s',
              }}
              onMouseOver={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#0B7A46'
              }}
              onMouseOut={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#006B3C'
              }}
            >
              {isSubmitting ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  <span>Submitting Ticket...</span>
                </>
              ) : (
                <>
                  <span>Create Ticket</span>
                  <span style={{ fontSize: '1.1rem' }}>→</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Global CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

function App() {
  return (
    <RequesterProvider>
      <TicketCreationForm />
    </RequesterProvider>
  )
}

export default App