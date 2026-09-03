import React from 'react';
import { useRequester } from '../context/RequesterContext';

export const DevRequesterSwitcher: React.FC = () => {
  const { currentRequester, requesters, setCurrentRequester, isLoading } = useRequester();

  if (isLoading) {
    return (
      <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>
        Loading personas...
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '0.35rem 0.75rem',
        borderRadius: '8px',
      }}
    >
      <span
        style={{
          fontWeight: 700,
          color: '#ffffff',
          fontSize: '0.75rem',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}
      >
        🛠️ Dev Requester:
      </span>
      <select
        id="dev-requester-select"
        value={currentRequester?.id || ''}
        onChange={(e) => {
          const selected = requesters.find((r) => r.id === Number(e.target.value));
          if (selected) setCurrentRequester(selected);
        }}
        style={{
          backgroundColor: '#ffffff',
          color: '#111827',
          border: '1px solid #D1D5DB',
          fontSize: '0.85rem',
          fontWeight: 600,
          borderRadius: '6px',
          padding: '0.3rem 0.6rem',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {requesters.map((user) => (
          <option key={user.id} value={user.id} disabled={!user.isActive}>
            {user.name} ({user.email}) {!user.isActive ? '— [Inactive]' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};