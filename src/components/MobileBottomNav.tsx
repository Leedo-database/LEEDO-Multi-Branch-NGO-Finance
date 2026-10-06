import React from 'react';
import { User, Language } from '../types';
import { 
  PieChart, Send, FileText, FolderGit2, Layers, 
  Shield, Users, Menu, Plus 
} from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  onOpenNewVoucher: () => void;
  onOpenMobileMenu: () => void;
  language: Language;
  pendingRequestsCount: number;
  pendingVouchersCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onTabChange,
  currentUser,
  onOpenNewVoucher,
  onOpenMobileMenu,
  language,
  pendingRequestsCount,
  pendingVouchersCount,
}) => {
  const isBranchRep = currentUser.role === 'BRANCH_REP';
  const isCentralAccounts = currentUser.role === 'CENTRAL_ACCOUNTS';
  const isManagement = currentUser.role === 'MANAGEMENT' || currentUser.role === 'SUPER_ADMIN' || currentUser.staffId === '1002';

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | null;
    isMenuToggle?: boolean;
  }

  const getItems = (): NavItem[] => {
    if (isBranchRep) {
      return [
        {
          id: 'branch-portal',
          label: language === 'bn' ? 'শাখা' : 'Branch',
          icon: FileText,
        },
        {
          id: 'fund-requests',
          label: language === 'bn' ? 'রিকুইজিশন' : 'Requests',
          icon: Send,
          badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
        },
        {
          id: 'sub-branches',
          label: language === 'bn' ? 'সাব-ব্রাঞ্চ' : 'Units',
          icon: Layers,
        },
        {
          id: 'more',
          label: language === 'bn' ? 'মেন্যু' : 'Menu',
          icon: Menu,
          isMenuToggle: true,
        },
      ];
    }

    if (isCentralAccounts) {
      return [
        {
          id: 'fund-requests',
          label: language === 'bn' ? 'রিকুইজিশন' : 'Requests',
          icon: Send,
          badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
        },
        {
          id: 'vouchers',
          label: language === 'bn' ? 'ভাউচার' : 'Vouchers',
          icon: FileText,
          badge: pendingVouchersCount > 0 ? pendingVouchersCount : null,
        },
        {
          id: 'projects',
          label: language === 'bn' ? 'প্রজেক্ট' : 'Projects',
          icon: FolderGit2,
        },
        {
          id: 'more',
          label: language === 'bn' ? 'মেন্যু' : 'Menu',
          icon: Menu,
          isMenuToggle: true,
        },
      ];
    }

    // Management & Super Admin
    return [
      {
        id: 'dashboard',
        label: language === 'bn' ? 'ড্যাশবোর্ড' : 'Home',
        icon: PieChart,
      },
      {
        id: 'fund-requests',
        label: language === 'bn' ? 'রিকুইজিশন' : 'Requests',
        icon: Send,
        badge: pendingRequestsCount > 0 ? pendingRequestsCount : null,
      },
      {
        id: 'vouchers',
        label: language === 'bn' ? 'ভাউচার' : 'Vouchers',
        icon: FileText,
        badge: pendingVouchersCount > 0 ? pendingVouchersCount : null,
      },
      {
        id: 'more',
        label: language === 'bn' ? 'মেন্যু' : 'Menu',
        icon: Menu,
        isMenuToggle: true,
      },
    ];
  };

  const navItems = getItems();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-3 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
      {/* First 2 items */}
      {navItems.slice(0, 2).map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative min-w-[54px] ${
              isActive ? 'text-red-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-500 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {item.badge !== undefined && item.badge !== null && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight truncate">{item.label}</span>
          </button>
        );
      })}

      {/* Floating Center (+) Action Button */}
      <div className="-mt-5 flex items-center justify-center">
        <button
          type="button"
          onClick={onOpenNewVoucher}
          className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-950/80 border-2 border-slate-950 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          title={isBranchRep ? (language === 'bn' ? 'খরচ এন্ট্রি' : 'Record Expense') : (language === 'bn' ? 'নতুন ভাউচার' : 'New Voucher')}
          aria-label="New Voucher or Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Remaining 2 items */}
      {navItems.slice(2).map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (item.isMenuToggle) {
                onOpenMobileMenu();
              } else {
                onTabChange(item.id);
              }
            }}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative min-w-[54px] ${
              isActive ? 'text-red-500 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-red-500 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              {item.badge !== undefined && item.badge !== null && (
                <span className="absolute -top-1.5 -right-2 px-1 min-w-[15px] h-[15px] rounded-full bg-red-600 text-white font-black text-[9px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 leading-tight truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
