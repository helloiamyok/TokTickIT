import React from 'react';
import { useRequester } from '../context/RequesterContext';

export const DevRequesterSwitcher: React.FC = () => {
  const { currentRequester, requesters, setCurrentRequester, isLoading } = useRequester();

  if (isLoading) {
    return <span className="text-xs text-gray-400">Loading dev session...</span>;
  }

  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-md text-sm">
      <span className="font-semibold text-amber-900 text-xs uppercase tracking-wide">
        🛠️ Dev Requester:
      </span>
      <select
        className="bg-white border border-amber-300 text-gray-800 text-sm rounded px-2 py-1 outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
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