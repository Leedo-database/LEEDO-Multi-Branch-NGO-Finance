/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { LeedoLogo } from './LeedoLogo';
import { Lock, UserCheck, Eye, EyeOff, Shield, ArrowRight, CheckCircle2, Building, KeyRound } from 'lucide-react';
import { User, Language } from '../types';

interface AuthScreenProps {
  users: User[];
  onLogin: (staffIdOrEmail: string, password: string) => { success: boolean; message: string };
  onQuickSelectUser?: (userId: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLogin,
  onQuickSelectUser,
  language,
  onLanguageChange,
}) => {
  const [staffIdOrEmail, setStaffIdOrEmail] = useState('');
  const [password, setPassword] = useState('leedo');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const res = onLogin(staffIdOrEmail, password);
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (user: User) => {
    setErrorMsg('');
    setStaffIdOrEmail(user.staffId);
    setPassword(user.password || 'leedo');
    const res = onLogin(user.staffId, user.password || 'leedo');
    if (!res.success) {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative selection:bg-red-500 selection:text-white">
      {/* Background ambient decorative glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Switcher */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <LeedoLogo size="md" variant="horizontal" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Language:</span>
          <div className="inline-flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => onLanguageChange('bn')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'bn' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'en' ? 'bg-red-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto py-8 z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Card: Login Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {language === 'bn' ? 'স্টাফ অ্যাকাউন্ট লগইন' : 'Staff Account Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Local Education and Economic Development Organization (Govt. Reg DHA-09281)
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <span className="font-bold text-rose-400">Error:</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {language === 'bn' ? 'স্টাফ আইডি (Staff ID) অথবা ইমেইল' : 'Staff ID or Email'} *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={language === 'bn' ? 'যেমন: 1002 (Kanta), 1004 (Habib), 1023 (Masud)' : 'e.g. 1002, 1004, 1023'}
                  value={staffIdOrEmail}
                  onChange={e => setStaffIdOrEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono shadow-inner"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {language === 'bn' ? 'আপনার নিয়োগপত্রের স্টাফ আইডি নম্বর লিখুন।' : 'Enter your numerical LEEDO staff employee ID.'}
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1.5">
                {language === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'} *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder={language === 'bn' ? 'পাসওয়ার্ড লিখুন' : 'Enter password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 font-mono shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                <span>{language === 'bn' ? 'সকল টেস্ট আইডির পাসওয়ার্ড:' : 'Demo default password:'} <span className="font-mono text-amber-400 font-bold">leedo</span></span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 transition-all text-sm mt-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'bn' ? 'লগইন সম্পন্ন করুন' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Security badge */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'একাউন্টিং অডিট ও এনক্রিপশন সক্রিয়' : 'ABAC & Audit Active'}</span>
            </span>
            <span className="font-mono">LEEDO ERP 2026</span>
          </div>
        </div>

        {/* Right Side: Demo Credentials & Passwords Cheat Sheet (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Banner */}
          <div className="bg-slate-900/80 border border-amber-900/50 p-5 rounded-2xl shadow-xl flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 flex-shrink-0">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  {language === 'bn' ? 'ডেমো অ্যাকাউন্ট ও পাসওয়ার্ড নির্দেশিকা' : 'Demo Credentials & Passwords Guide'}
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  TEST CREDENTIALS
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {language === 'bn'
                  ? 'সিস্টেমটি পরীক্ষা করার জন্য যেকোনো কর্মকর্তার কার্ডে ক্লিক করে সরাসরি "১-ক্লিক লগইন" করতে পারেন। সকল অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড: '
                  : 'Click any role below for instant 1-click test login. Default password for all staff: '}
                <span className="font-mono text-amber-400 font-black px-1.5 py-0.5 bg-amber-950/80 border border-amber-800/80 rounded">
                  leedo
                </span>
              </p>
            </div>
          </div>

          {/* Categorized Staff Cards */}
          <div className="space-y-3">
            
            {/* 1. Super Admin & Top Management */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'bn' ? '১. সুপার এডমিন ও শীর্ষ ব্যবস্থাপনা (Super Admin & ED)' : '1. Super Admin & Executive Management'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Murshida Akhter Kanta */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Murshida Akhter Kanta</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        SUPER ADMIN
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Director - Admin & Finance</div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 mt-2">
                      <span>ID: <span className="text-white font-bold">1002</span></span>
                      <span>Pass: <span className="text-amber-400 font-bold">leedo</span></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(users.find(u => u.staffId === '1002') || users[1])}
                    className="mt-3 w-full py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>১-ক্লিক লগইন (Super Admin)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Forhad Hossain */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Forhad Hossain</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/40">
                        EXECUTIVE DIRECTOR
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Founder & Executive Director</div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 mt-2">
                      <span>ID: <span className="text-white font-bold">1001</span></span>
                      <span>Pass: <span className="text-amber-400 font-bold">leedo</span></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(users.find(u => u.staffId === '1001') || users[0])}
                    className="mt-3 w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>১-ক্লিক লগইন (ED)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Central Accounts Team */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-400" />
                <span>{language === 'bn' ? '২. কেন্দ্রীয় হিসাব বিভাগ (Central Accounts & Verification)' : '2. Central Accounts & Verification'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Md. Habibur Rahman */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Md. Habibur Rahman</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">
                        ACCOUNTANT
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Central Accounts Officer</div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 mt-2">
                      <span>ID: <span className="text-white font-bold">1004</span></span>
                      <span>Pass: <span className="text-amber-400 font-bold">leedo</span></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(users.find(u => u.staffId === '1004') || users[2])}
                    className="mt-3 w-full py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>১-ক্লিক লগইন (হিসাবরক্ষক)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Sazzad Hosen */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Sazzad Hosen</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">
                        ASST ACCOUNTANT
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Assistant Accountant</div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 mt-2">
                      <span>ID: <span className="text-white font-bold">1079</span></span>
                      <span>Pass: <span className="text-amber-400 font-bold">leedo</span></span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(users.find(u => u.staffId === '1079') || users[3])}
                    className="mt-3 w-full py-1.5 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/60 text-blue-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>১-ক্লিক লগইন (সহ-হিসাবরক্ষক)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Branch Representatives & Field Incharges */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? '৩. ফিল্ড শাখা ইনচার্জ ও প্রতিনিধি (Branch Expense & Requisitions)' : '3. Field Branch Representatives'}</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Md. Masud - Kamalapur */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Md. Masud</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                        KAMALAPUR
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Social Mobilizer Incharge (ID: 1023)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Units: SUS & Kamalapur Night Shelter</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(users.find(u => u.staffId === '1023') || users[4])}
                    className="mt-3 w-full py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>১-ক্লিক লগইন (কমলাপুর শাখা)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Saidur Rahman Sajan - Kadamtali */}
                <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">Saidur Rahman Sajan</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                        KADAMTALI
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Social Mobilizer Incharge (ID: 1028)</div>
                    <div className="text-[10px] text-slate-500 mt-1">Units: Sadarghat & Shambazar SUS</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(users.find(u => u.staffId === '1028') || users[5])}
                    className="mt-3 w-full py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>১-ক্লিক লগইন (কদমতলী শাখা)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto text-center text-xs text-slate-500 border-t border-slate-900 pt-4 z-10">
        <p>© 2026 LEEDO - Local Education and Economic Development Organization. Govt. Reg # DHA-09281.</p>
      </footer>
    </div>
  );
};
