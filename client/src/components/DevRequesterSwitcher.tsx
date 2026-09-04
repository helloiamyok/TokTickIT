import React from 'react';
import { useRequester } from '../context/RequesterContext';

export const DevRequesterSwitcher: React.FC = () => {
  const { currentRequester, requesters, setCurrentRequester, isLoading } = useRequester();

  if (isLoading) {
    return <span className="text-xs text-gray-400">Loading dev session...</span>;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '0.35rem 0.75rem',
        borderRadius: '6px',
        color: '#FFFFFF',
      }}
    >
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        🛠️ Dev Requester:
      </span>
      <select
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #D1D5DB',
          color: '#1F2937',
          fontSize: '0.85rem',
          borderRadius: '4px',
          padding: '0.25rem 0.5rem',
          fontWeight: 500,
          cursor: 'pointer',
          outline: 'none',
        }}
        value={currentRequester?.id || ''}
        onChange={(e) => {
          const selected = requesters.find((r) => r.id === Number(e.target.value));
          if (selected) setCurrentRequester(selected);
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