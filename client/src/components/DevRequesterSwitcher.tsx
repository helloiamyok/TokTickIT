import type { FC } from 'react';
import { useRequester } from '../context/RequesterContext';

export const DevRequesterSwitcher: FC = () => {
  const { currentRequester, requesters, setCurrentRequester, isLoading } = useRequester();

  if (isLoading) {
    return <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Loading dev session...</span>;
  }

  const requesterList = Array.isArray(requesters) ? requesters : [];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: '#fffbeb',
        border: '1px solid #fde68a',
        padding: '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.875rem',
      }}
    >
      <span
        style={{
          fontWeight: 600,
          color: '#78350f',
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.025em',
        }}
      >
        🛠️ Dev Requester:
      </span>
      <select
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fcd34d',
          color: '#1f2937',
          fontSize: '0.875rem',
          borderRadius: '0.25rem',
          padding: '0.25rem 0.5rem',
          outline: 'none',
          cursor: 'pointer',
        }}
        value={currentRequester?.id || ''}
        onChange={(e) => {
          if (!e.target.value) {
            setCurrentRequester(null);
          } else {
            const selected = requesterList.find((r) => r.id === Number(e.target.value));
            if (selected) setCurrentRequester(selected);
          }
        }}
      >
        <option value="">-- No Requester Selected --</option>
        {requesterList.map((user) => (
          <option key={user.id} value={user.id} disabled={user.isActive === false}>
            {user.name} ({user.email}) {user.isActive === false ? '— [Inactive]' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};