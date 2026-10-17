import React, { useState } from 'react';
import { User, Language } from '../types';
import { LeedoLogo } from './LeedoLogo';
import { Eye, EyeOff, Lock, UserCheck, X, ArrowRight, Shield } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  users?: User[];
  onLogin: (staffIdOrEmail: string, password: string) => { success: boolean; message: string };
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  isStandalone?: boolean;
  customLogoUrl?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  language = 'bn',
  onLanguageChange,
  isStandalone = false,
  customLogoUrl = '',
}) => {
  if (!isOpen) return null;

  const [staffIdOrEmail, setStaffIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!staffIdOrEmail.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে স্টাফ আইডি (EID) বা ইমেইল লিখুন।' : 'Please enter your Employee ID (EID) or Email.');
      return;
    }
    if (!password) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে পাসওয়ার্ড লিখুন।' : 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const res = onLogin(staffIdOrEmail.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 overflow-y-auto ${
      isStandalone ? 'bg-slate-950 min-h-screen' : 'bg-black/85 backdrop-blur-md'
    }`}>
      {/* Centering wrapper with min-h-full so top is never cut off on small screens */}
      <div className="min-h-full w-full flex items-start sm:items-center justify-center p-3 sm:p-6 py-6 sm:py-10">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-md sm:max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto relative">
          
          {/* Close button for non-standalone mode */}
          {onClose && !isStandalone && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-20 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Language Toggle in Top Header */}
          {onLanguageChange && (
            <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-md text-[11px] font-bold">
              <button
                type="button"
                onClick={() => onLanguageChange('bn')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'bn' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  language === 'en' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          )}

          {/* Official NGO Header */}
          <div className="p-6 sm:p-8 bg-slate-950 border-b border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-40 bg-red-600/10 blur-3xl pointer-events-none" />
            
            {/* Logo: Respects custom logo if uploaded by HR */}
            <div className="flex flex-col items-center mb-3">
              <div className="sm:hidden">
                <LeedoLogo size="md" variant="horizontal" customLogoUrl={customLogoUrl} />
              </div>
              <div className="hidden sm:block">
                <LeedoLogo size="lg" variant="stacked" customLogoUrl={customLogoUrl} />
              </div>
            </div>

            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {language === 'bn' ? 'লিডো অ্যাকাউন্টিং ও ফিন্যান্সিয়াল সিস্টেম' : 'LEEDO Accounting & Financial System'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-sm">
              Local Education and Economic Development Organization (Govt. Reg # DHA-09281)
            </p>
          </div>

          {/* Login Form Body */}
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {language === 'bn' ? 'কর্মীর প্রবেশদ্বার (Staff Login)' : 'Staff Login'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {language === 'bn' ? 'আপনার স্টাফ আইডি (EID) ও পাসওয়ার্ড লিখুন' : 'Enter your Employee ID (EID) & password'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 leading-relaxed animate-in fade-in">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Employee ID (EID) */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {language === 'bn' ? 'স্টাফ আইডি / Employee ID (EID)' : 'Employee ID (EID) or Email'} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder={language === 'bn' ? 'আপনার আইডি নম্বর দিন (যেমন: 1002, 1004, 1023)' : 'Enter your ID (e.g. 1002, 1004, 1023)'}
                    value={staffIdOrEmail}
                    onChange={e => setStaffIdOrEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono font-bold tracking-wide transition-colors"
                  />
                  <div className="absolute right-3.5 top-3.5 text-slate-500">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Account Password'} *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder={language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Enter your password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 pr-11 py-3 text-sm text-white focus:outline-none focus:border-red-500 font-mono tracking-wide transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all text-sm tracking-wide cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{language === 'bn' ? 'সিস্টেমে প্রবেশ করুন' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Subtle Security & HR Assistance Notice */}
            <div className="pt-2 border-t border-slate-800/60 text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {language === 'bn' 
                    ? 'সুরক্ষিত এনজিও ফিন্যান্সিয়াল ক্লাউড সিস্টেম' 
                    : 'Encrypted Multi-Branch NGO Financial Cloud'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {language === 'bn'
                  ? 'পাসওয়ার্ড ভুলে গেলে বা নতুন অ্যাকাউন্ট অনুমোদনের জন্য এইচআর (মুর্শিদা আক্তার কান্তা)-এর সাথে যোগাযোগ করুন।'
                  : 'Contact Super Admin / HR (Murshida Akhter Kanta) for password reset or assistance.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
