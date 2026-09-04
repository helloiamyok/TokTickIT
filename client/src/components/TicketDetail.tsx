import React, { useState, useEffect } from 'react'

interface Attachment {
  id: number
  fileName: string
  fileSize: number
  fileType: string
  filePath: string
  createdAt: string
  isDeleted: boolean
}

interface TicketDetailData {
  id: number
  ticketNumber?: string
  ticketNo?: string
  summary: string
  description: string
  status?: string
  currentStatus?: string
  requestedPriority: string
  createdAt: string
  updatedAt: string
  requesterId: number
  requester?: { name: string; email: string }
  category?: { name: string }
  relatedSystem?: { name: string }
  attachments: Attachment[]
}

interface TicketDetailProps {
  ticketId: number
  currentRequester: { id: number; name: string } | null
  onBack: () => void
}

export const TicketDetail: React.FC<TicketDetailProps> = ({
  ticketId,
  currentRequester,
  onBack,
}) => {
  const [ticket, setTicket] = useState<TicketDetailData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)

  // Upload States
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Soft-Delete Modal States
  const [deletingAttachmentId, setDeletingAttachmentId] = useState<number | null>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const fetchTicketDetail = async () => {
    setIsLoading(true)
    setErrorMessage(null)
    setIsForbidden(false)

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        headers: {
          'x-requester-id': String(currentRequester?.id || ''),
        },
      })

      if (res.status === 403) {
        setIsForbidden(true)
        return
      }

      if (!res.ok) {
        throw new Error('Failed to load ticket details')
      }

      const data = await res.json()
      setTicket(data)
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTicketDetail()
  }, [ticketId, currentRequester])

  // Handle File Upload (BR-05, BR-06)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null)
    const file = e.target.files?.[0]
    if (!file) return

    // BR-05: Allowed formats
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Allowed formats: JPG, PNG, WEBP, PDF.')
      e.target.value = ''
      return
    }

    // BR-05: Max 5 MB
    const maxSizeBytes = 5 * 1024 * 1024
    if (file.size > maxSizeBytes) {
      setUploadError('File size exceeds the 5 MB limit.')
      e.target.value = ''
      return
    }

    // BR-06: Max 5 active attachments
    const activeAttachments = ticket?.attachments?.filter((a) => !a.isDeleted) || []
    if (activeAttachments.length >= 5) {
      setUploadError('Maximum limit of 5 attachments reached for this ticket.')
      e.target.value = ''
      return
    }

    setIsUploading(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': String(currentRequester?.id || ''),
        },
        body: JSON.stringify({
          requesterId: currentRequester?.id,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          filePath: `/uploads/${file.name}`,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to upload attachment')
      }

      e.target.value = ''
      await fetchTicketDetail()
    } catch (err: any) {
      setUploadError(err.message)
    } finally {
      setIsUploading(false)
    }
  }

  // Handle Soft-Delete with Mandatory Justification (FR-08, BR-07)
  const confirmSoftDelete = async () => {
    if (!deleteReason.trim()) {
      setDeleteError('Reason is required to remove an attachment.')
      return
    }

    setIsDeleting(true)
    setDeleteError(null)

    try {
      const res = await fetch(`/api/attachments/${deletingAttachmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': String(currentRequester?.id || ''),
        },
        body: JSON.stringify({
          requesterId: currentRequester?.id,
          deletedReason: deleteReason.trim(),
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to remove attachment')
      }

      setDeletingAttachmentId(null)
      setDeleteReason('')
      await fetchTicketDetail()
    } catch (err: any) {
      setDeleteError(err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const getStatusBadgeStyle = (statusName: string) => {
    switch (statusName) {
      case 'NEW':
        return { bg: '#EAF6EF', text: '#006B3C', border: '#A7F3D0' }
      case 'IN_PROGRESS':
        return { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' }
      case 'RESOLVED':
      case 'CLOSED':
        return { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' }
      default:
        return { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' }
    }
  }

  const getPriorityBadgeStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { bg: '#FDE8E8', text: '#9B1C1C' }
      case 'HIGH':
        return { bg: '#FEE2E2', text: '#B91C1C' }
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#92400E' }
      default:
        return { bg: '#E0F2FE', text: '#0369A1' }
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280', fontFamily: 'system-ui, sans-serif' }}>
        Loading ticket information...
      </div>
    )
  }

  // Cross-requester Isolation State (403 Forbidden)
  if (isForbidden) {
    return (
      <div style={{ backgroundColor: '#F5F7F6', minHeight: '100vh', padding: '3rem 2rem', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', padding: '2.5rem', borderRadius: '8px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⛔</div>
          <h2 style={{ color: '#9B1C1C', margin: '0 0 0.5rem 0' }}>403 - Forbidden Access</h2>
          <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            You do not have permission to view or manage this ticket. It belongs to another requester account (Isolation Policy).
          </p>
          <button
            onClick={onBack}
            style={{ backgroundColor: '#006B3C', color: '#fff', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
          >
            ← Back to My Tickets
          </button>
        </div>
      </div>
    )
  }

  if (errorMessage || !ticket) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#9B1C1C', fontFamily: 'system-ui, sans-serif' }}>
        <h3>Error loading ticket</h3>
        <p>{errorMessage}</p>
        <button onClick={onBack} style={{ padding: '0.5rem 1rem', cursor: 'pointer', marginTop: '1rem' }}>
          Back to list
        </button>
      </div>
    )
  }

  const activeAttachments = ticket.attachments?.filter((a) => !a.isDeleted) || []
  const ticketNo = ticket.ticketNumber || ticket.ticketNo || `TKT-${ticket.id}`
  const currentStatus = ticket.status || ticket.currentStatus || 'NEW'
  const statusBadge = getStatusBadgeStyle(currentStatus)
  const priorityBadge = getPriorityBadgeStyle(ticket.requestedPriority)

  return (
    <div style={{ backgroundColor: '#F5F7F6', minHeight: '100vh', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Navigation Bar */}
        <button
          onClick={onBack}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#006B3C',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            padding: 0,
          }}
        >
          ← Back to My Tickets
        </button>

        {/* Ticket Header Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #E5E7EB', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#006B3C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Ticket Details
              </span>
              <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', color: '#111827' }}>
                {ticketNo}: {ticket.summary}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: statusBadge.bg, color: statusBadge.text, border: `1px solid ${statusBadge.border}` }}>
                {currentStatus}
              </span>
              <span style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, backgroundColor: priorityBadge.bg, color: priorityBadge.text }}>
                {ticket.requestedPriority}
              </span>
            </div>
          </div>

          {/* Key-Value Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Requester</div>
              <div style={{ fontSize: '0.95rem', color: '#1F2937', fontWeight: 500, marginTop: '0.2rem' }}>
                {ticket.requester?.name || 'N/A'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Category</div>
              <div style={{ fontSize: '0.95rem', color: '#1F2937', fontWeight: 500, marginTop: '0.2rem' }}>
                {ticket.category?.name || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Related System</div>
              <div style={{ fontSize: '0.95rem', color: '#1F2937', fontWeight: 500, marginTop: '0.2rem' }}>
                {ticket.relatedSystem?.name || '-'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase' }}>Created Date</div>
              <div style={{ fontSize: '0.95rem', color: '#1F2937', fontWeight: 500, marginTop: '0.2rem' }}>
                {new Date(ticket.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
              Description
            </div>
            <div style={{ backgroundColor: '#F9FAFB', padding: '1rem', borderRadius: '6px', fontSize: '0.92rem', color: '#374151', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
              {ticket.description}
            </div>
          </div>
        </div>

        {/* Attachment Management Card */}
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Attachments</h2>
              <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
                Active files: {activeAttachments.length} / 5 (Max 5MB each. Formats: JPG, PNG, WEBP, PDF)
              </span>
            </div>

            {/* Upload Button */}
            <div>
              <label
                style={{
                  backgroundColor: activeAttachments.length >= 5 || isUploading ? '#E5E7EB' : '#006B3C',
                  color: activeAttachments.length >= 5 || isUploading ? '#9CA3AF' : '#fff',
                  padding: '0.55rem 1rem',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: activeAttachments.length >= 5 || isUploading ? 'not-allowed' : 'pointer',
                  display: 'inline-block',
                }}
              >
                {isUploading ? 'Uploading...' : '+ Add Attachment'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  disabled={activeAttachments.length >= 5 || isUploading}
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          {uploadError && (
            <div style={{ backgroundColor: '#FDE8E8', color: '#9B1C1C', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '1rem' }}>
              {uploadError}
            </div>
          )}

          {activeAttachments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', border: '2px dashed #E5E7EB', borderRadius: '6px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📎</div>
              <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>No attachments uploaded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {activeAttachments.map((att) => (
                <div
                  key={att.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.4rem' }}>
                      {att.fileType.includes('pdf') ? '📄' : '🖼️'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1F2937' }}>{att.fileName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                        {formatFileSize(att.fileSize)} • Uploaded {new Date(att.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setDeletingAttachmentId(att.id)
                      setDeleteReason('')
                      setDeleteError(null)
                    }}
                    style={{
                      backgroundColor: '#FEE2E2',
                      color: '#B91C1C',
                      border: '1px solid #FCA5A5',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mandatory Reason Soft-Delete Modal */}
      {deletingAttachmentId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '1.75rem', borderRadius: '8px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#9B1C1C', fontSize: '1.2rem' }}>Remove Attachment</h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.88rem', color: '#4B5563' }}>
              Please provide a mandatory justification for deleting this attachment (Audit Policy).
            </p>

            <textarea
              placeholder="Enter reason for removal (e.g. Uploaded wrong document, Outdated screenshot)..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '0.65rem', border: '1px solid #D1D5DB', borderRadius: '6px', fontSize: '0.88rem', boxSizing: 'border-box', marginBottom: '0.75rem' }}
            />

            {deleteError && (
              <div style={{ color: '#9B1C1C', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                {deleteError}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                disabled={isDeleting}
                onClick={() => setDeletingAttachmentId(null)}
                style={{ padding: '0.5rem 1rem', border: '1px solid #D1D5DB', backgroundColor: '#fff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmSoftDelete}
                style={{ padding: '0.5rem 1rem', border: 'none', backgroundColor: '#DC2626', color: '#fff', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
              >
                {isDeleting ? 'Deleting...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}