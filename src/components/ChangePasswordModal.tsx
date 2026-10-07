import React, { useState } from 'react';
import { User, Language } from '../types';
import { Lock, Check, X, ShieldAlert, KeyRound, AlertTriangle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onChangePassword: (newPass: string) => { success: boolean; message: string };
  isMandatory?: boolean;
  language?: Language;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangePassword,
  isMandatory = false,
  language = 'bn',
}) => {
  if (!isOpen) return null;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 4) {
      setMessage({ 
        text: language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters long.', 
        isError: true 
      });
      return;
    }

    if (newPassword === currentUser.staffId) {
      setMessage({ 
        text: language === 'bn' 
          ? 'নতুন পাসওয়ার্ড আপনার স্টাফ আইডি হতে পারবে না। ভিন্ন একটি গোপন পাসওয়ার্ড দিন।' 
          : 'New password cannot be your Staff ID. Please enter a different secure password.', 
        isError: true 
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ 
        text: language === 'bn' ? 'দুইটি পাসওয়ার্ড মিলছে না। পুনরায় সঠিকভাবে লিখুন।' : 'Passwords do not match. Please re-enter.', 
        isError: true 
      });
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
        <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-4 sm:p-6 space-y-4 my-auto relative shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isMandatory ? 'bg-amber-950/90 border border-amber-600 text-amber-400' : 'bg-red-950/80 border border-red-800 text-red-400'
              }`}>
                {isMandatory ? <KeyRound className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                  <span>{language === 'bn' ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Account Password'}</span>
                  {isMandatory && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded">
                      {language === 'bn' ? 'বাধ্যতামূলক' : 'Required'}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400">
                  {currentUser.name} (Staff ID: <span className="font-mono font-bold text-red-400">{currentUser.staffId}</span>)
                </p>
              </div>
            </div>
            {!isMandatory && (
              <button 
                type="button"
                onClick={onClose} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Mandatory Warning Banner if triggered right after login or HR reset */}
          {isMandatory && (
            <div className="p-3.5 bg-amber-950/40 border border-amber-700/60 rounded-xl text-xs space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{language === 'bn' ? 'লগইন নিরাপত্তা সতর্কবার্তা' : 'First-Time Login Security Notice'}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {language === 'bn'
                  ? `আপনার বর্তমান পাসওয়ার্ডটি ডিফল্ট স্টাফ আইডি (${currentUser.staffId}) বা এইচআর রিসেট করা অবস্থায় রয়েছে। সংস্থার হিসাবের তথ্যের সুরক্ষার্থে অনুগ্রহ করে এখনই আপনার নিজস্ব নতুন একটি গোপন পাসওয়ার্ড সেট করুন।`
                  : `Your account is using default Staff ID (${currentUser.staffId}) or was reset by HR. For accounting security, please establish your personal private password now.`}
              </p>
            </div>
          )}

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
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'নতুন পাসওয়ার্ড (New Password)' : 'New Password'} *
              </label>
              <input
                type="password"
                required
                minLength={4}
                placeholder={language === 'bn' ? 'কমপক্ষে ৪ অক্ষরের নতুন গোপন পাসওয়ার্ড দিন' : 'Enter at least 4 characters'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-red-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                {language === 'bn' ? 'পাসওয়ার্ড আপনার স্টাফ আইডির সাথে হুবহু মিলতে পারবে না।' : 'Cannot be identical to your numerical Staff ID.'}
              </span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন (Confirm Password)' : 'Confirm New Password'} *
              </label>
              <input
                type="password"
                required
                minLength={4}
                placeholder={language === 'bn' ? 'নতুন পাসওয়ার্ড পুনরায় লিখুন' : 'Re-enter new password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {!isMandatory && (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
              )}
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-950/60 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'bn' ? 'পাসওয়ার্ড সংরক্ষণ করুন' : 'Save & Secure Account'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
