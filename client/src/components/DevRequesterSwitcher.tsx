import React from 'react';
import { useRequester } from '../context/RequesterContext';

export const DevRequesterSwitcher: React.FC = () => {
  const { currentRequester, requesters, setCurrentRequester, isLoading } = useRequester();

  if (isLoading) {
    return <span className="text-xs text-gray-400">Loading dev session...</span>;
  }

  return (
    <div className="dev-switcher">
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
        🛠️ Dev Requester:
      </span>
      <select
        className="dev-switcher-select"
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