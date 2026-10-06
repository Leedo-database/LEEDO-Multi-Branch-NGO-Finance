import React, { useState } from 'react';
import { User, Language } from '../types';
import { LeedoLogo } from './LeedoLogo';
import { Eye, EyeOff, Lock, UserCheck, X, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';
import { getTranslation } from '../services/i18n';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  users?: User[];
  onLogin: (staffIdOrEmail: string, password: string) => { success: boolean; message: string };
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  isStandalone?: boolean;
}

const DEMO_ACCOUNTS = [
  {
    staffId: '1002',
    name: 'Murshida Akhter Kanta',
    roleLabel: 'সুপার এডমিন (Super Admin)',
    designation: 'Director - Admin & Finance',
    tag: 'সর্বোচ্চ ক্ষমতা: পাসওয়ার্ড রিসেট, কর্মী যোগ ও বাদ দেওয়া',
    border: 'border-purple-600/60 bg-purple-950/40 text-purple-200',
    btnBg: 'bg-purple-600 hover:bg-purple-500 text-white',
    password: 'leedo',
  },
  {
    staffId: '1001',
    name: 'Forhad Hossain',
    roleLabel: 'নির্বাহী পরিচালক (Management)',
    designation: 'Founder & Executive Director',
    tag: 'চূড়ান্ত বাজেট অনুমোদন ও অডিট ওভারসাইট',
    border: 'border-red-600/60 bg-red-950/40 text-red-200',
    btnBg: 'bg-red-600 hover:bg-red-500 text-white',
    password: 'leedo',
  },
  {
    staffId: '1004',
    name: 'Md. Habibur Rahman',
    roleLabel: 'কেন্দ্রীয় অ্যাকাউন্টস (Central Accounts)',
    designation: 'Head Accountant',
    tag: 'ভাউচার যাচাই, বিল অডিট ও তহবিল ছাড়',
    border: 'border-blue-600/60 bg-blue-950/40 text-blue-200',
    btnBg: 'bg-blue-600 hover:bg-blue-500 text-white',
    password: 'leedo',
  },
  {
    staffId: '1079',
    name: 'Sazzad Hosen',
    roleLabel: 'সহকারী হিসাবরক্ষক (Accounts Dept)',
    designation: 'Assistant Accountant',
    tag: 'বিল ও ভাউচার পরীক্ষণ ও এন্ট্রি',
    border: 'border-cyan-600/60 bg-cyan-950/40 text-cyan-200',
    btnBg: 'bg-cyan-600 hover:bg-cyan-500 text-white',
    password: 'leedo',
  },
  {
    staffId: '1023',
    name: 'Md. Masud',
    roleLabel: 'শাখা ইনচার্জ (Branch Rep)',
    designation: 'Kamalapur Branch Incharge',
    tag: 'খরচ এন্ট্রি, দোকানের বিল আপলোড ও রিকুইজিশন',
    border: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-200',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    password: 'leedo',
  },
  {
    staffId: '1028',
    name: 'Saidur Rahman Sajan',
    roleLabel: 'মাঠ কর্মকর্তা (Branch Rep)',
    designation: 'Kadamtali Branch Mobilizer',
    tag: 'কদমতলী সেন্টার খরচ ও পেটি ক্যাশ ব্যবস্থাপনা',
    border: 'border-emerald-600/60 bg-emerald-950/40 text-emerald-200',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    password: 'leedo',
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  language = 'bn',
  onLanguageChange,
  isStandalone = false,
}) => {
  if (!isOpen) return null;

  const [staffIdOrEmail, setStaffIdOrEmail] = useState('');
  const [password, setPassword] = useState('leedo');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = onLogin(staffIdOrEmail, password);
    if (res.success) {
      if (onClose) onClose();
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (demoStaffId: string, demoPass: string) => {
    setStaffIdOrEmail(demoStaffId);
    setPassword(demoPass);
    setErrorMsg('');
    const res = onLogin(demoStaffId, demoPass);
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
      {/* Centering wrapper with min-h-full and items-start so top is never cut off */}
      <div className="min-h-full w-full flex items-start sm:items-center justify-center p-2.5 sm:p-6 py-4 sm:py-8">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto relative">
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

          {/* Top Official Header */}
          <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-40 bg-red-600/10 blur-3xl pointer-events-none" />
            
            {/* Logo: Compact horizontal on mobile, stacked on tablet/desktop */}
            <div className="flex flex-col items-center">
              <div className="sm:hidden mb-1">
                <LeedoLogo size="md" variant="horizontal" />
              </div>
              <div className="hidden sm:block">
                <LeedoLogo size="lg" variant="stacked" />
              </div>
            </div>

            <h2 className="text-base sm:text-xl font-black text-white mt-2 sm:mt-3 tracking-tight">
              {language === 'bn' ? 'লিডো মাল্টি-ব্রাঞ্চ অ্যাকাউন্টিং সিস্টেমে লগইন' : 'LEEDO Multi-Branch Accounting System'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 max-w-md px-2">
              Local Education and Economic Development Organization (Govt. Reg # DHA-09281)
            </p>
          </div>

        {/* Two-Column Grid: Left is Credentials Form, Right is Demo Passwords & Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left Column: Direct Login Form (5 cols) */}
          <div className="lg:col-span-5 p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-500" />
                <span>{language === 'bn' ? 'স্টাফ একাউন্ট লগইন' : 'Staff Login'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' ? 'আপনার স্টাফ আইডি ও পাসওয়ার্ড দিয়ে প্রবেশ করুন' : 'Enter your numerical ID & password'}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'স্টাফ আইডি (Staff ID) অথবা ইমেইল' : 'Staff ID or Email'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: 1002 (সুপার এডমিন), 1004, 1023' : 'e.g. 1002, 1001, 1004'}
                  value={staffIdOrEmail}
                  onChange={e => setStaffIdOrEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono font-bold"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">
                    {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Account Password'} *
                  </label>
                  <span className="text-[11px] text-emerald-400 font-mono">
                    {language === 'bn' ? 'ডেমো পাসওয়ার্ড: leedo' : 'Demo Password: leedo'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="পাসওয়ার্ড লিখুন"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all text-xs tracking-wide cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{language === 'bn' ? 'সিস্টেমে প্রবেশ করুন' : 'Sign In Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>পাসওয়ার্ড সংক্রান্ত তথ্য:</span>
              </div>
              <p>
                সকল ডেমো অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড হলো: <strong className="text-white font-mono bg-slate-800 px-1 py-0.5 rounded">leedo</strong>। 
                পাসওয়ার্ড ভুলে গেলে সুপার এডমিন মুর্শিদা আক্তার কান্তা (ID: 1002) তাৎক্ষণিক রিসেট করতে পারবেন।
              </p>
            </div>
          </div>

          {/* Right Column: Demo Password & One-Click Role Switcher (7 cols) */}
          <div className="lg:col-span-7 p-6 bg-slate-950/60 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'bn' ? 'ডেমো অ্যাকাউন্ট ও রোল সমূহ (১-ক্লিক লগইন)' : 'Demo Credentials & 1-Click Access'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'bn' 
                    ? 'যেকোনো রোলের কার্যকারিতা পরীক্ষা করতে নিচের কার্ডে ক্লিক করুন' 
                    : 'Click any role below to test their respective dashboard and approval powers'}
                </p>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-lg">
                Password: leedo
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {DEMO_ACCOUNTS.map(demo => (
                <div
                  key={demo.staffId}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${demo.border}`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-black/40 px-2 py-0.5 rounded">
                        ID: {demo.staffId}
                      </span>
                      <span className="text-[10px] font-mono text-slate-300">
                        Pass: <strong className="text-white">leedo</strong>
                      </span>
                    </div>

                    <div className="font-bold text-white mt-1.5 text-sm">{demo.name}</div>
                    <div className="text-[11px] font-semibold text-slate-300">{demo.roleLabel}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{demo.tag}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin(demo.staffId, demo.password)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition-all shadow cursor-pointer flex items-center justify-center gap-1.5 ${demo.btnBg}`}
                  >
                    <span>{demo.staffId === '1002' ? 'Super Admin লগইন' : 'লগইন করুন'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
