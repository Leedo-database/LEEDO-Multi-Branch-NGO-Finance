import React, { useState } from 'react';
import { User } from '../types';
import { Lock, Check, X, ShieldAlert } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onChangePassword: (newPass: string) => { success: boolean; message: string };
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangePassword,
}) => {
  if (!isOpen) return null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match. Please re-enter.', isError: true });
      return;
    }

    const res = onChangePassword(newPassword);
    if (res.success) {
      setMessage({ text: res.message, isError: false });
      setTimeout(() => {
        onClose();
        setNewPassword('');
        setConfirmPassword('');
        setMessage(null);
      }, 1500);
    } else {
      setMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-3 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4">
        <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-4 sm:p-6 space-y-4 my-auto relative">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Change Account Password</h3>
              <p className="text-xs text-slate-400">
                Staff: {currentUser.name} (ID: {currentUser.staffId})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-xs border ${
            message.isError 
              ? 'bg-rose-950/80 border-rose-800 text-rose-200' 
              : 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={4}
              placeholder="Enter at least 4 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={4}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <p className="text-[11px] text-slate-500">
            Note: Your new password will be stored in your browser session for this staff account.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg"
            >
              Update Password
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
