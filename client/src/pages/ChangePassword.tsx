import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ChangePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
    <div className="min-h-screen flex items-center justify-center bg-emerald-50/40 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md border border-emerald-100 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#1B4D3E]">Change Password Required</h2>
          <p className="text-sm text-gray-600 mt-1">
            You must update your temporary initial password before continuing.
          </p>
        </div>

        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}
        {success && <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">Password updated! Redirecting...</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]"
              placeholder="Min 8 chars, 1 upper, 1 lower, 1 special"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B4D3E]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-[#1B4D3E] hover:bg-[#143B30] text-white font-medium rounded-lg shadow"
          >
            Update Password & Continue
          </button>
        </form>
      </div>
    </div>
  );
};
