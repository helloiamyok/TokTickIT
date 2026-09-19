import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUpperAndLower = /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword);
  const hasNumberAndSpecial = /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword);
  const isMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!hasMinLength || !hasUpperAndLower || !hasNumberAndSpecial) {
      return setError('Password does not meet the complexity requirements');
    }

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match');
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        if (user?.role === 'IT_STAFF') navigate('/it/queue');
        else if (user?.role === 'ADMINISTRATOR') navigate('/admin/users');
        else navigate('/tickets');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5F7F6', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar Header */}
      <header className="app-header" style={{ backgroundColor: '#006B3C', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '1.4rem' }}>⏱️</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            TokTickIT
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: '#FFFFFF',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: '0.25rem',
              marginLeft: '0.25rem',
            }}
          >
            Password Security
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E5E7EB',
            padding: '2.25rem 2rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Header Title */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FEF3C7',
                color: '#D97706',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '0.75rem',
              }}
            >
              🔑
            </div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 700, color: '#1B4D3E' }}>
              Change Your Password
            </h1>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#6B7280' }}>
              You must change your password to continue.
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
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
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
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.88rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>✓</span>
              <span>Password updated successfully! Unlocking application...</span>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  Current (temporary) password
                </label>
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#006B3C', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {showCurrentPassword ? 'Hide 👁️' : 'Show 👁️'}
                </button>
              </div>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                name="currentPassword"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current temporary password"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  New password
                </label>
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#006B3C', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
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
                placeholder="Create a strong password"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  Confirm new password
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ backgroundColor: 'transparent', border: 'none', color: '#006B3C', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
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
                placeholder="Re-enter your new password"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Checklist Box (Handout Page 8 Mockup) */}
            <div
              style={{
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: '#4B5563',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              <div style={{ fontWeight: 700, color: '#374151', marginBottom: '0.15rem' }}>Password must:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasMinLength ? '#006B3C' : '#6B7280', fontWeight: hasMinLength ? 600 : 400 }}>
                <span>{hasMinLength ? '✓' : '○'}</span>
                <span>Be at least 8 characters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasUpperAndLower ? '#006B3C' : '#6B7280', fontWeight: hasUpperAndLower ? 600 : 400 }}>
                <span>{hasUpperAndLower ? '✓' : '○'}</span>
                <span>Include upper and lower case letters</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasNumberAndSpecial ? '#006B3C' : '#6B7280', fontWeight: hasNumberAndSpecial ? 600 : 400 }}>
                <span>{hasNumberAndSpecial ? '✓' : '○'}</span>
                <span>Include a number and a special character</span>
              </div>
              {confirmPassword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isMatch ? '#006B3C' : '#DC2626', fontWeight: isMatch ? 600 : 400, marginTop: '0.2rem', paddingTop: '0.35rem', borderTop: '1px dashed #E5E7EB' }}>
                  <span>{isMatch ? '✓' : '✗'}</span>
                  <span>{isMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                marginTop: '0.4rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#006B3C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 107, 60, 0.2)',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#005630')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#006B3C')}
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
