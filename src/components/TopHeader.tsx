import React, { useState } from 'react';
import { User, Language, AppNotification } from '../types';
import { getTranslation } from '../services/i18n';
import { LeedoLogo } from './LeedoLogo';
import { 
  Plus, Bell, Globe, Cloud, KeyRound, LogOut, 
  Send, FileText, ChevronDown, Check, CheckCircle2, Shield, Menu 
} from 'lucide-react';

interface TopHeaderProps {
  currentTab: string;
  currentUser: User;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenNewVoucher: () => void;
  onOpenNewFundRequest: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  firebaseStatus: 'CONNECTING' | 'CONNECTED' | 'OFFLINE';
  notifications: AppNotification[];
  unreadCount: number;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigateTab: (tab: string) => void;
  onToggleMobileMenu?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  currentUser,
  language,
  onLanguageChange,
  onOpenNewVoucher,
  onOpenNewFundRequest,
  onOpenChangePassword,
  onLogout,
  firebaseStatus,
  notifications,
  unreadCount,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigateTab,
  onToggleMobileMenu,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const isBranchRep = currentUser.role === 'BRANCH_REP';

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return t('navDashboard');
      case 'fund-requests': return t('navFundRequests');
      case 'vouchers': return t('navVouchers');
      case 'branch-portal': return t('navBranchPortal');
      case 'projects': return t('navProjects');
      case 'sub-branches': return t('navSubBranches');
      case 'reports': return t('navReports');
      case 'profile': return t('navProfile');
      case 'staff-management': return language === 'bn' ? 'কর্মী ও এক্সেস কন্ট্রোল' : 'Staff & Access Control';
      default: return 'LEEDO NGO Finance';
    }
  };

  return (
    <header className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
      {/* Left: Mobile Hamburger & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="md:hidden shrink-0">
            <LeedoLogo size="sm" variant="icon-only" />
          </div>
          <div className="min-w-0 truncate">
            <h1 className="text-sm sm:text-lg font-bold text-white flex items-center flex-wrap gap-1.5 leading-tight truncate">
              <span className="truncate">{getPageTitle(currentTab)}</span>
              {isBranchRep && currentUser.branchName && (
                <span className="text-[10px] sm:text-xs font-semibold text-red-400 bg-red-950/50 px-1.5 sm:px-2 py-0.5 rounded border border-red-800/40 truncate max-w-[130px] sm:max-w-none">
                  {currentUser.branchName}
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Quick Actions & Header Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Action: Record Expense / New Voucher */}
        <button
          onClick={onOpenNewVoucher}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] sm:text-xs font-bold rounded-xl shadow-md shadow-red-950/50 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">{isBranchRep ? t('actionRecordExpense') : t('actionNewVoucher')}</span>
          <span className="inline xs:hidden sm:hidden">{isBranchRep ? 'খরচ' : 'ভাউচার'}</span>
        </button>

        {/* Quick Action: New Fund Request (Available for Branch Reps) */}
        {isBranchRep && (
          <button
            onClick={onOpenNewFundRequest}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-800/40 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('actionNewFundRequest')}</span>
          </button>
        )}

        {/* Firebase Cloud Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Cloud className="w-3 h-3 text-emerald-400" />
          <span className="font-mono text-slate-400">refined-axle-rlcf1</span>
        </div>

        {/* Notification Bell with Unread Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative cursor-pointer"
            title={t('notifications')}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              className="absolute right-0 mt-2 w-72 sm:w-96 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl py-3 z-50 overflow-hidden"
              onMouseLeave={() => setShowNotifications(false)}
            >
              <div className="px-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-red-400" />
                  {t('notifications')}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllNotificationsRead}
                    className="text-[10px] font-semibold text-red-400 hover:underline cursor-pointer"
                  >
                    {t('markAllRead')}
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    {t('noNotifications')}
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.linkTab) onNavigateTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3 text-xs cursor-pointer transition-colors hover:bg-slate-800/80 ${
                        !n.read ? 'bg-red-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-white leading-snug">
                          {language === 'bn' ? (n.titleBn || n.title) : n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        {language === 'bn' ? (n.messageBn || n.message) : n.message}
                      </p>
                      <div className="text-[10px] text-slate-500 mt-1.5 font-mono">
                        {n.timestamp}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current Logged-In User Chip (Strictly THIS user, NO other staff IDs shown) */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-left transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-red-950 border border-red-700 text-red-400 font-black text-xs flex items-center justify-center shrink-0">
              {currentUser.staffId.slice(-2)}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-bold text-white leading-none truncate max-w-[120px]">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none">
                ID: {currentUser.staffId}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Account Menu */}
          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl py-3 z-50 space-y-2"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              {/* Profile Overview */}
              <div className="px-4 pb-2 border-b border-slate-800">
                <div className="text-xs font-bold text-white">{currentUser.name}</div>
                <div className="text-[11px] text-red-400 font-semibold">{currentUser.designation}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">Staff ID: {currentUser.staffId}</div>
                {currentUser.branchName && (
                  <div className="text-[10px] text-slate-400 mt-1">Branch: {currentUser.branchName}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-2 space-y-1">
                <button
                  onClick={() => {
                    onOpenChangePassword();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('actionChangePassword')}</span>
                </button>

                <button
                  onClick={() => {
                    onLogout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('actionSignOut')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
