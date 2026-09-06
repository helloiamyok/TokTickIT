import React, { useState, useEffect } from 'react';

interface OptionItem {
  id: number;
  name: string;
}

interface CreateTicketProps {
  currentRequester: { id: number; name: string } | null;
  onSuccess?: (ticketNumber: string) => void;
  onCancel?: () => void;
}

export const CreateTicket: React.FC<CreateTicketProps> = ({ currentRequester, onSuccess, onCancel }) => {
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [relatedSystemId, setRelatedSystemId] = useState('');
  const [requestedPriority, setRequestedPriority] = useState('MEDIUM');

  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [systems, setSystems] = useState<OptionItem[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [successTicketNumber, setSuccessTicketNumber] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setErrorMessage('Failed to load categories'));

    fetch('/api/related-systems')
      .then(res => res.json())
      .then(data => setSystems(Array.isArray(data) ? data : []))
      .catch(() => setErrorMessage('Failed to load related systems'));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        setFileError('Invalid file type. Allowed formats: JPG, PNG, WEBP, PDF.');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }

      if (file.size > maxSize) {
        setFileError('File size exceeds 5 MB limit.');
        e.target.value = '';
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const errors: { [key: string]: string } = {};
    if (!summary.trim()) errors.summary = 'Ticket Summary is required.';
    if (summary.trim().length > 100) errors.summary = 'Summary cannot exceed 100 characters.';
    if (!description.trim()) errors.description = 'Description is required.';
    if (!categoryId) errors.categoryId = 'Please select a Category.';
    if (!relatedSystemId) errors.relatedSystemId = 'Please select a Related System.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (!currentRequester) {
      setErrorMessage('No Development Requester selected. Please select a persona first.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-requester-id': String(currentRequester.id),
        },
        body: JSON.stringify({
          requesterId: currentRequester.id,
          summary: summary.trim(),
          description: description.trim(),
          categoryId: Number(categoryId),
          relatedSystemId: Number(relatedSystemId),
          requestedPriority,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      const tktNum = data.ticketNo || data.ticketNumber;
      setSuccessTicketNumber(tktNum);
      if (onSuccess) onSuccess(tktNum);
    } catch (err: any) {
      setErrorMessage(err.message || 'Cannot connect to server. Form data is preserved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // กล่องแจ้งเตือนความสำเร็จ (Success Screen)
  if (successTicketNumber) {
    return (
      <div style={{ backgroundColor: '#F5F7F6', minHeight: '80vh', padding: '2rem 1rem' }}>
        <div style={{
          maxWidth: '650px',
          margin: '2rem auto',
          backgroundColor: '#FFFFFF',
          padding: '2.5rem',
          borderRadius: '8px',
          border: '1px solid #D1E7DD',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#EAF6EF',
            color: '#006B3C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 1.25rem'
          }}>✓</div>
          <h2 style={{ color: '#006B3C', margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 600 }}>Ticket Created Successfully</h2>
          <p style={{ color: '#4B5563', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Your support ticket has been recorded with the official identifier:</p>
          
          <div style={{
            backgroundColor: '#F5F7F6',
            border: '1px dashed #006B3C',
            borderRadius: '6px',
            padding: '1rem',
            fontSize: '1.6rem',
            fontWeight: 700,
            color: '#006B3C',
            letterSpacing: '1px',
            marginBottom: '2rem'
          }}>
            {successTicketNumber}
          </div>

          <button
            onClick={() => {
              setSuccessTicketNumber(null);
              setSummary('');
              setDescription('');
              setCategoryId('');
              setRelatedSystemId('');
              setSelectedFile(null);
            }}
            style={{
              backgroundColor: '#006B3C',
              color: '#FFFFFF',
              padding: '0.65rem 1.5rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Create Another Ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        
        {/* Breadcrumb Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>
            <span>My Tickets</span> <span style={{ margin: '0 0.4rem' }}>&gt;</span> <span style={{ color: '#1F2937', fontWeight: 600 }}>Create Ticket</span>
          </div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                padding: '0.45rem 0.9rem',
                fontSize: '0.85rem',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              ← Back to My Tickets
            </button>
          )}
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div style={{
            backgroundColor: '#FDE8E8',
            color: '#9B1C1C',
            padding: '0.85rem 1.25rem',
            borderRadius: '6px',
            marginBottom: '1.25rem',
            border: '1px solid #F8B4B4',
            fontSize: '0.9rem'
          }}>
            {errorMessage}
          </div>
        )}

        {/* Main Card Surface */}
        <div className="card-surface">
          <form onSubmit={handleSubmit}>
            {/* Grid แถวที่ 1: Ticket No (Read-only), Ticket Date (Read-only), Category, Related System */}
            <div className="form-grid-row-4">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Ticket No.
                </label>
                <input
                  type="text"
                  readOnly
                  value="Auto-generated on Submit"
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#F0F2F1',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#6B7280',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Ticket Date
                </label>
                <input
                  type="text"
                  readOnly
                  value={new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#F0F2F1',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#6B7280',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Category <span style={{ color: '#E02424' }}>*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: fieldErrors.categoryId ? '1px solid #E02424' : '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#1F2937',
                    outline: 'none'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {fieldErrors.categoryId && <div style={{ color: '#E02424', fontSize: '0.78rem', marginTop: '0.25rem' }}>{fieldErrors.categoryId}</div>}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Related System <span style={{ color: '#E02424' }}>*</span>
                </label>
                <select
                  value={relatedSystemId}
                  onChange={(e) => setRelatedSystemId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#FFFFFF',
                    border: fieldErrors.relatedSystemId ? '1px solid #E02424' : '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#1F2937',
                    outline: 'none'
                  }}
                >
                  <option value="">Select System</option>
                  {systems.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {fieldErrors.relatedSystemId && <div style={{ color: '#E02424', fontSize: '0.78rem', marginTop: '0.25rem' }}>{fieldErrors.relatedSystemId}</div>}
              </div>
            </div>

            {/* Grid แถวที่ 2: Requester (Read-only), Requested Priority, Current Status */}
            <div className="form-grid-row-3">
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Requester
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentRequester ? currentRequester.name : 'Not selected'}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#F0F2F1',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#374151',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Requested Priority
                </label>
                <select
                  value={requestedPriority}
                  onChange={(e) => setRequestedPriority(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FCD34D',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#92400E',
                    fontWeight: 500,
                    outline: 'none'
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                  Current Status
                </label>
                <div style={{
                  padding: '0.55rem 0.75rem',
                  backgroundColor: '#EAF6EF',
                  border: '1px solid #A7F3D0',
                  borderRadius: '6px',
                  color: '#006B3C',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  display: 'inline-block',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  New (Initial)
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Summary <span style={{ color: '#E02424' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="Brief summary of the issue..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#FFFFFF',
                  border: fieldErrors.summary ? '1px solid #E02424' : '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />
              {fieldErrors.summary && <div style={{ color: '#E02424', fontSize: '0.78rem', marginTop: '0.25rem' }}>{fieldErrors.summary}</div>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
                Description <span style={{ color: '#E02424' }}>*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Provide details about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: '#FFFFFF',
                  border: fieldErrors.description ? '1px solid #E02424' : '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.92rem',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              {fieldErrors.description && <div style={{ color: '#E02424', fontSize: '0.78rem', marginTop: '0.25rem' }}>{fieldErrors.description}</div>}
            </div>

            {/* Attachments Section */}
            <div style={{
              backgroundColor: '#F9FAFB',
              border: '1px dashed #D1D5DB',
              borderRadius: '6px',
              padding: '1.25rem',
              marginBottom: '1.75rem'
            }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.3rem' }}>
                📎 Supporting Attachments (Optional)
              </label>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', display: 'block', marginBottom: '0.75rem' }}>
                Allowed types: JPG, PNG, WEBP, PDF. Maximum 5 MB per file.
              </span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
                style={{ fontSize: '0.85rem' }}
              />
              {fileError && <div style={{ color: '#E02424', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 500 }}>{fileError}</div>}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #D1D5DB',
                    color: '#374151',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: isSubmitting ? '#9CA3AF' : '#006B3C',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};