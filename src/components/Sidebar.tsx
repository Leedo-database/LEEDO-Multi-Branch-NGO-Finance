import React from 'react';
import { User, UserRole, Language } from '../types';
import { LeedoLogo } from './LeedoLogo';
import { getTranslation } from '../services/i18n';
import { 
  PieChart, Send, FileText, FolderGit2, Layers, 
  Shield, LogOut, Globe, CheckCircle2, Users, ShieldCheck, X 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  pendingRequestsCount: number;
  pendingVouchersCount: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onLogout,
  language,
  onLanguageChange,
  pendingRequestsCount,
  pendingVouchersCount,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.staffId === '1002';
  const isManagement = currentUser.role === 'MANAGEMENT' || currentUser.role === 'SUPER_ADMIN' || isSuperAdmin;
  const isCentralAccounts = currentUser.role === 'CENTRAL_ACCOUNTS';
  const isBranchRep = currentUser.role === 'BRANCH_REP';

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN': return language === 'bn' ? 'সুপার এডমিন (Super Admin)' : 'Super Administrator';
      case 'MANAGEMENT': return t('roleManagement');
      case 'CENTRAL_ACCOUNTS': return t('roleAccounts');
      case 'BRANCH_REP': return `${currentUser.branchName || t('roleBranchRep')}`;
    }
  };

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  // Strict Role-Based Navigation Items:
  // Branch Rep: ONLY Branch Expenses, Fund Requisitions, Sub-Branches, Profile.
  // Central Accounts: Fund Requests, Vouchers/Ledger, Sub-Branches, Project Budgets, Audit Reports, Profile.
  // Management / Super Admin: Dashboard, Staff & Access Control, Fund Requests, Vouchers, Project Budgets, Sub-Branches, Audit Reports, Profile.
  const getNavItems = () => {
    if (isBranchRep) {
      return [
        { id: 'branch-portal', label: t('navBranchPortal'), icon: FileText, badge: null },
        { id: 'fund-requests', label: t('navFundRequests'), icon: Send, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
        { id: 'sub-branches', label: t('navSubBranches'), icon: Layers, badge: null },
        { id: 'profile', label: t('navProfile'), icon: Shield, badge: null },
      ];
    }

    if (isCentralAccounts) {
      return [
        { id: 'fund-requests', label: t('navFundRequests'), icon: Send, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
        { id: 'vouchers', label: t('navVouchers'), icon: FileText, badge: pendingVouchersCount > 0 ? pendingVouchersCount : null },
        { id: 'sub-branches', label: t('navSubBranches'), icon: Layers, badge: null },
        { id: 'projects', label: t('navProjects'), icon: FolderGit2, badge: null },
        { id: 'reports', label: t('navReports'), icon: PieChart, badge: null },
        { id: 'profile', label: t('navProfile'), icon: Shield, badge: null },
      ];
    }

    // Management & Super Admin (Murshida Akhter Kanta 1002, Forhad 1001)
    return [
      { id: 'dashboard', label: t('navDashboard'), icon: PieChart, badge: null },
      { id: 'staff-management', label: language === 'bn' ? 'কর্মী ও এক্সেস কন্ট্রোল' : 'Staff & Access Control', icon: Users, badge: null },
      { id: 'fund-requests', label: t('navFundRequests'), icon: Send, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null },
      { id: 'vouchers', label: t('navVouchers'), icon: FileText, badge: pendingVouchersCount > 0 ? pendingVouchersCount : null },
      { id: 'projects', label: t('navProjects'), icon: FolderGit2, badge: null },
      { id: 'sub-branches', label: t('navSubBranches'), icon: Layers, badge: null },
      { id: 'reports', label: t('navReports'), icon: FileText, badge: null },
      { id: 'profile', label: t('navProfile'), icon: Shield, badge: null },
    ];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-950 border-r border-slate-800 
          flex flex-col justify-between h-full select-none shadow-2xl transition-transform duration-300 ease-in-out
          md:static md:translate-x-0 md:w-64 md:h-screen md:sticky md:top-0 md:z-30 md:shadow-none
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LeedoLogo size="md" variant="horizontal" />
              </div>
              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight mt-1 pl-1">
              {t('appSubName')}
            </div>
          </div>

          {/* Current Logged-In User Profile Card (Strictly THIS user only, NO other IDs shown) */}
          <div className="p-3.5 mx-3 mt-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-xs flex items-center justify-center shadow-md shadow-red-950/50 border border-red-500/30 shrink-0">
                {currentUser.staffId}
              </div>
              <div className="truncate">
                <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-red-400 font-semibold truncate mt-0.5">
                  {currentUser.designation}
                </div>
                <div className="text-[10px] text-slate-400 truncate font-mono">
                  ID: {currentUser.staffId} • {getRoleLabel(currentUser.role)}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              {language === 'bn' ? 'প্রধান মেন্যু' : 'Main Navigation'}
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-950/60 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== null && (
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-white text-red-700' : 'bg-red-950 text-red-400 border border-red-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Controls: Language Switcher & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Language Toggle (English / বাংলা) */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">{language === 'bn' ? 'ভাষা / Language' : 'Language'}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px] font-bold">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'en' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                  language === 'bn' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onLogout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-800 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('actionSignOut')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
