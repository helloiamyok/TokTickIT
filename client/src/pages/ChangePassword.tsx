import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ChangePassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, refreshUser, logout, setUser } = useAuth();
  const navigate = useNavigate();

  // Password validation rules matching mockup & requirements
  const hasMinLength = newPassword.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const hasMax128 = newPassword.length <= 128;
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLength) {
      return setError('Password must be at least 8 characters long.');
    }

    if (!hasLetterAndNumber) {
      return setError('Password must contain at least one letter and one number.');
    }

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.');
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccess(true);
      if (data.user) {
        setUser(data.user);
      }
      await refreshUser();
      const targetRole = data.user?.role || user?.role;
      if (targetRole === 'IT_STAFF') {
        navigate('/it/queue');
      } else if (targetRole === 'ADMINISTRATOR') {
        navigate('/admin/users');
      } else {
        navigate('/tickets');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch {}
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '440px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
        }}
      >
        {/* Top Green Brand Banner */}
        <div
          style={{
            backgroundColor: '#006B3C',
            color: '#FFFFFF',
            padding: '1.1rem 1.75rem',
            fontSize: '1.3rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          TokTickIT
        </div>

        {/* Card Body */}
        <div style={{ padding: '2rem 1.75rem' }}>
          {/* Header Title & Subtitle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1
              style={{
                margin: '0 0 0.4rem 0',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: '#111827',
              }}
            >
              Choose a new password
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '0.86rem',
                color: '#6B7280',
                lineHeight: 1.45,
              }}
            >
              Your administrator issued an initial password. Choose a new one to continue.
            </p>
          </div>

          {/* Feedback Banners */}
          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: '#FDE8E8',
                border: '1px solid #F8B4B4',
                color: '#9B1C1C',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              style={{
                backgroundColor: '#DEF7EC',
                border: '1px solid #BCF0DA',
                color: '#03543F',
                padding: '0.65rem 0.85rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>✓</span>
              <span>Password updated successfully! Unlocking application...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* New Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  New password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#006B3C',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showNewPassword ? 'Hide 👁️' : 'Show 👁️'}
                </button>
              </div>
              <input
                type={showNewPassword ? 'text' : 'password'}
                name="newPassword"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters, with a letter and a number"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#006B3C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {/* Requirement Checklist (Exact layout from mockup) */}
              <div
                style={{
                  marginTop: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                  fontSize: '0.82rem',
                }}
              >
                {/* Rule 1: At least 8 characters */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: hasMinLength ? '#006B3C' : '#4B5563',
                    fontWeight: hasMinLength ? 600 : 400,
                  }}
                >
                  {hasMinLength ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: '#006B3C',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '13px',
                        height: '13px',
                        borderRadius: '50%',
                        border: '1.5px solid #9CA3AF',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                  <span>At least 8 characters</span>
                </div>

                {/* Rule 2: Contains a letter and a number */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: hasLetterAndNumber ? '#006B3C' : '#4B5563',
                    fontWeight: hasLetterAndNumber ? 600 : 400,
                  }}
                >
                  {hasLetterAndNumber ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: '#006B3C',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '13px',
                        height: '13px',
                        borderRadius: '50%',
                        border: '1.5px solid #9CA3AF',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                  <span>Contains a letter and a number</span>
                </div>

                {/* Rule 3: At most 128 characters */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    color: hasMax128 ? '#006B3C' : '#4B5563',
                    fontWeight: hasMax128 ? 600 : 400,
                  }}
                >
                  {hasMax128 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        backgroundColor: '#006B3C',
                        color: '#FFFFFF',
                        fontSize: '9px',
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                  ) : (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '13px',
                        height: '13px',
                        borderRadius: '50%',
                        border: '1.5px solid #9CA3AF',
                        boxSizing: 'border-box',
                      }}
                    />
                  )}
                  <span>At most 128 characters</span>
                </div>
              </div>
            </div>

            {/* Confirm New Password Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label
                  style={{
                    fontSize: '0.88rem',
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Confirm new password <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#006B3C',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? 'Hide 👁️' : 'Show 👁️'}
                </button>
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#006B3C';
                  e.target.style.boxShadow = '0 0 0 3px rgba(0, 107, 60, 0.15)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {confirmPassword && (
                <div
                  style={{
                    marginTop: '0.35rem',
                    fontSize: '0.78rem',
                    color: isMatch ? '#006B3C' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}
                >
                  <span>{isMatch ? '✓' : '✗'}</span>
                  <span>{isMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.35rem',
                width: '100%',
                padding: '0.72rem 1rem',
                backgroundColor: '#006B3C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#005630';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#006B3C';
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save new password'}
            </button>

            {/* Sign Out Link / Button */}
            <div style={{ textAlign: 'center', marginTop: '0.2rem' }}>
              <button
                type="button"
                onClick={handleSignOut}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#4B5563',
                  fontSize: '0.85rem',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#111827')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#4B5563')}
              >
                Sign out instead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
