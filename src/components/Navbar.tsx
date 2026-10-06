import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { LeedoLogo } from './LeedoLogo';
import { 
  Plus, UserCheck, ShieldCheck, ChevronDown, RefreshCw, KeyRound, 
  LogIn, Layers, Send, FileText, FolderGit2, PieChart, Shield, Cloud 
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  onOpenNewVoucher: () => void;
  onResetData: () => void;
  onOpenChangePassword: () => void;
  onOpenLogin: () => void;
  firebaseStatus: 'CONNECTING' | 'CONNECTED' | 'OFFLINE';
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  allUsers,
  onSwitchUser,
  onOpenNewVoucher,
  onResetData,
  onOpenChangePassword,
  onOpenLogin,
  firebaseStatus,
}) => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isManagement = currentUser.role === 'MANAGEMENT';
  const isCentralAccounts = currentUser.role === 'CENTRAL_ACCOUNTS';
  const isBranchRep = currentUser.role === 'BRANCH_REP';

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'MANAGEMENT': return 'Management (ED / Director)';
      case 'CENTRAL_ACCOUNTS': return 'Accounts Department';
      case 'BRANCH_REP': return 'Branch Field Incharge';
    }
  };

  // Strict Role-Based Tabs:
  // - Branch Rep: NO Dashboard, NO Accounts Dept tabs. ONLY Branch Expenses, Fund Requisitions, Sub-Branches, Profile.
  // - Central Accounts: NO Executive Dashboard. Sees Fund Requests, Vouchers/Ledger, Sub-Branches, Project Budgets, Audit Reports, Profile.
  // - Management: Full Executive Dashboard, Fund Requests, Vouchers, Project Budgets, Sub-Branches, Audit Reports, Profile.
  const getNavLinks = () => {
    if (isBranchRep) {
      return [
        { id: 'branch-portal', label: 'My Branch Expenses (খরচ)', icon: FileText },
        { id: 'fund-requests', label: 'Fund Requisitions (রিকুইজিশন)', icon: Send },
        { id: 'sub-branches', label: 'Sub-Branches (উপ-শাখা)', icon: Layers },
        { id: 'profile', label: 'My Profile (প্রোফাইল)', icon: Shield },
      ];
    }

    if (isCentralAccounts) {
      return [
        { id: 'fund-requests', label: 'Fund Requests (রিকুইজিশন)', icon: Send },
        { id: 'vouchers', label: 'Vouchers & Ledger (ভাউচার)', icon: FileText },
        { id: 'sub-branches', label: 'Branches & Units (শাখা ও ইউনিট)', icon: Layers },
        { id: 'projects', label: 'Project Budgets (বাজেট বণ্টন)', icon: FolderGit2 },
        { id: 'reports', label: 'Financial Statements (অডিট)', icon: PieChart },
        { id: 'profile', label: 'My Profile (প্রোফাইল)', icon: Shield },
      ];
    }

    // Management
    return [
      { id: 'dashboard', label: 'Executive Dashboard (ড্যাশবোর্ড)', icon: PieChart },
      { id: 'fund-requests', label: 'Fund Requests (রিকুইজিশন)', icon: Send },
      { id: 'vouchers', label: 'All Vouchers (ভাউচার)', icon: FileText },
      { id: 'projects', label: 'Project Budgets (বাজেট)', icon: FolderGit2 },
      { id: 'sub-branches', label: 'Branches & Units (শাখা)', icon: Layers },
      { id: 'reports', label: 'Audit Reports (অডিট)', icon: FileText },
      { id: 'profile', label: 'Executive Profile', icon: Shield },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Brand Wordmark with Official LEEDO Logo & Cloud Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange(isBranchRep ? 'branch-portal' : (isCentralAccounts ? 'fund-requests' : 'dashboard'))}
              className="flex items-center gap-2.5 text-left focus:outline-none group"
            >
              <LeedoLogo size="md" variant="horizontal" />
            </button>

            {/* Cloud Firestore Live Status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-[10px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Cloud className="w-3 h-3 text-emerald-400" />
              <span className="font-medium">Firebase Connected</span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (Strict RBAC isolation) */}
          <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-300">
            {navLinks.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`transition-colors whitespace-nowrap px-2.5 py-1.5 rounded-lg ${
                  currentTab === tab.id 
                    ? 'text-red-400 font-bold bg-red-950/40 border border-red-800/40' 
                    : 'hover:text-white hover:bg-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-3">
            {/* New Voucher Button (Expense recording or Income) */}
            <button
              onClick={onOpenNewVoucher}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isBranchRep ? 'Record Expense (খরচ)' : 'New Voucher'}</span>
            </button>

            {/* Active User Profile with Staff ID & Password Controls */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/90 hover:bg-slate-800 text-left transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-red-950 border border-red-700 flex items-center justify-center text-xs font-black text-red-400">
                  {currentUser.staffId.slice(-2)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white leading-none">{currentUser.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-800 text-red-400 px-1 py-0.2 rounded">
                      ID: {currentUser.staffId}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                    {currentUser.role === 'BRANCH_REP' ? currentUser.branchName : getRoleLabel(currentUser.role)}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 divide-y divide-slate-800"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  {/* Current Active Account Card */}
                  <div className="px-4 py-3 bg-slate-950/60">
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">Staff ID: {currentUser.staffId} · {currentUser.email}</div>
                    <div className="text-[10px] text-red-400 mt-0.5">{currentUser.designation}</div>
                    {currentUser.assignedUnits && (
                      <div className="text-[10px] text-slate-400 mt-1 bg-slate-900 p-1.5 rounded border border-slate-800">
                        <span className="font-semibold text-slate-300">Units:</span> {currentUser.assignedUnits.join(', ')}
                      </div>
                    )}

                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        onClick={() => { onOpenChangePassword(); setUserDropdownOpen(false); }}
                        className="flex-1 flex items-center justify-center gap-1 py-1 px-2 text-[11px] font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
                      >
                        <KeyRound className="w-3 h-3 text-amber-400" />
                        <span>Change Password</span>
                      </button>
                      <button
                        onClick={() => { onOpenLogin(); setUserDropdownOpen(false); }}
                        className="flex items-center justify-center gap-1 py-1 px-2.5 text-[11px] font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
                        title="Login to another Staff ID"
                      >
                        <LogIn className="w-3 h-3 text-sky-400" />
                        <span>Switch ID</span>
                      </button>
                    </div>
                  </div>

                  {/* Switch to Any LEEDO Staff Member (For testing & role simulation) */}
                  <div className="py-1">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Active User (1001 to 1079):
                    </div>
                    <div className="max-h-56 overflow-y-auto pr-1">
                      {allUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => { onSwitchUser(u.id); setUserDropdownOpen(false); }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-800 ${
                            currentUser.id === u.id ? 'bg-red-950/40 text-red-300 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-mono text-[11px] font-bold text-red-400 mr-1.5">{u.staffId}</span>
                            <span>{u.name}</span>
                            <div className="text-[10px] text-slate-500 truncate">
                              {u.branchName || u.designation.split('(')[0]}
                            </div>
                          </div>
                          {currentUser.id === u.id && <UserCheck className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 px-2">
                    <button
                      onClick={() => { onResetData(); setUserDropdownOpen(false); }}
                      className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Reset Demo Data</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden overflow-x-auto py-2.5 space-x-2 border-t border-slate-800 text-xs">
          {navLinks.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap px-2.5 py-1 rounded-lg ${
                currentTab === tab.id ? 'text-red-400 font-bold bg-red-950/50' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
