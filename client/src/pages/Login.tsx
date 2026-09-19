import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await login({ email, password });
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else if (user.role === 'IT_STAFF') {
        navigate('/it/queue');
      } else if (user.role === 'ADMINISTRATOR') {
        navigate('/admin/users');
      } else {
        navigate('/tickets');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
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
            Service Desk Portal
          </span>
        </div>
      </header>

      {/* Main Login Area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div
          style={{
            maxWidth: '440px',
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
                backgroundColor: '#EAF6EF',
                color: '#006B3C',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '0.75rem',
              }}
            >
              🔐
            </div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#1B4D3E' }}>
              Sign in to your account
            </h1>
            <p style={{ margin: '0.35rem 0 0', fontSize: '0.88rem', color: '#6B7280' }}>
              Enter your corporate credentials to access TokTickIT
            </p>
          </div>

          {/* Error Banner */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.35rem',
                }}
              >
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. janderson@tiktockit.com"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
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
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    color: '#374151',
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
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
                  {showPassword ? 'Hide 👁️' : 'Show 👁️'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid #D1D5DB',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
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
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#006B3C',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(0, 107, 60, 0.2)',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#005630';
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) e.currentTarget.style.backgroundColor = '#006B3C';
              }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Fill Demo Section */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.65rem' }}>
              ⚡ Quick Demo Login:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('john.smith@tiktockit.com', 'Password123!')}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#EDE9FE',
                  color: '#5B21B6',
                  border: '1px solid #DDD6FE',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                👑 Administrator
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('michael.brown@tiktockit.com', 'Password123!')}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#EAF6EF',
                  color: '#006B3C',
                  border: '1px solid #A7F3D0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                🛠️ IT Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('jennifer.anderson@tiktockit.com', 'Password123!')}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#F3F4F6',
                  color: '#374151',
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                👤 Requester
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('emily.davis@tiktockit.com', 'InitialPassword123!')}
                style={{
                  padding: '0.4rem 0.5rem',
                  fontSize: '0.75rem',
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '1px solid #FDE68A',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textAlign: 'left',
                }}
              >
                🔑 1st Login Change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
