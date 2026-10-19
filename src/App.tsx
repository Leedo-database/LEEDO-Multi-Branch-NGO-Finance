/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useLeedoStore } from './services/store';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { VoucherManagementView } from './components/VoucherManagementView';
import { FundRequestsView } from './components/FundRequestsView';
import { SubBranchesView } from './components/SubBranchesView';
import { ProjectBudgetsView } from './components/ProjectBudgetsView';
import { BranchPortalView } from './components/BranchPortalView';
import { AuditReportsView } from './components/AuditReportsView';
import { StaffProfileView } from './components/StaffProfileView';
import { VoucherModal } from './components/VoucherModal';
import { PrintableVoucherModal } from './components/PrintableVoucherModal';
import { LoginModal } from './components/LoginModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ChangeLogoModal } from './components/ChangeLogoModal';
import { StaffManagementView } from './components/StaffManagementView';
import { PayrollModal } from './components/PayrollModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TransactionVoucher } from './types';
import { LeedoLogo } from './components/LeedoLogo';

export default function App() {
  const store = useLeedoStore();
  
  // Set initial tab based on role
  const getInitialTab = () => {
    if (store.isBranchRep) return 'branch-portal';
    if (store.isCentralAccounts) return 'fund-requests';
    return 'dashboard';
  };

  const [currentTab, setCurrentTab] = useState<string>(getInitialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState<boolean>(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState<boolean>(false);
  const [selectedPrintVoucher, setSelectedPrintVoucher] = useState<TransactionVoucher | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
  const [isChangeLogoOpen, setIsChangeLogoOpen] = useState<boolean>(false);

  // Password change prompt - only if HR explicitly reset password and set mustChangePassword: true
  const isMandatoryPasswordChange = Boolean(
    store.isLoggedIn && store.currentUser.mustChangePassword
  );

  // Enforce role-based tab access whenever user or login state changes
  useEffect(() => {
    if (!store.isLoggedIn) return;

    if (store.isBranchRep) {
      const allowed = ['branch-portal', 'fund-requests', 'sub-branches', 'profile'];
      if (!allowed.includes(currentTab)) {
        setCurrentTab('branch-portal');
      }
    } else if (store.isCentralAccounts) {
      const allowed = ['fund-requests', 'vouchers', 'sub-branches', 'projects', 'reports', 'profile'];
      if (!allowed.includes(currentTab)) {
        setCurrentTab('fund-requests');
      }
    } else {
      const allowed = ['dashboard', 'staff-management', 'fund-requests', 'vouchers', 'projects', 'sub-branches', 'reports', 'profile'];
      if (!allowed.includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [store.isLoggedIn, store.currentUser.id, store.currentUser.role]);

  // If user is logged out, show the dedicated login screen with demo passwords
  if (!store.isLoggedIn) {
    return (
      <LoginModal
        isOpen={true}
        isStandalone={true}
        users={store.users}
        onLogin={(identifier, pass) => {
          const res = store.loginWithCredentials(identifier, pass);
          if (res.success) {
            const cleanId = identifier.trim().toLowerCase();
            const user = store.users.find(u => 
              u.staffId.toLowerCase() === cleanId || 
              u.email.toLowerCase() === cleanId ||
              (u.staffId === '1002' && (cleanId === 'hr.leedo2000@gmail.com' || cleanId === 'kanta@leedo.org' || cleanId === 'hr'))
            );
            if (user) {
              if (user.role === 'BRANCH_REP') {
                setCurrentTab('branch-portal');
              } else if (user.role === 'CENTRAL_ACCOUNTS') {
                setCurrentTab('fund-requests');
              } else {
                setCurrentTab('dashboard');
              }
            }
          }
          return res;
        }}
        language={store.language}
        onLanguageChange={store.setLanguage}
        customLogoUrl={store.customLogoUrl}
      />
    );
  }

  const currentBranch = store.branches.find(b => b.id === store.currentUser.branchId);

  // Count pending items for badges
  const pendingRequestsCount = store.fundRequests.filter(r => 
    r.status === 'PENDING_VERIFICATION' || r.status === 'VERIFIED_BY_ACCOUNTS'
  ).length;

  const pendingVouchersCount = store.vouchers.filter(v => v.status === 'SUBMITTED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row antialiased font-sans">
      {/* 1. Left Sidebar Navigation (Structured, Clean Menu Bar & Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        currentUser={store.currentUser}
        onLogout={store.logout}
        language={store.language}
        onLanguageChange={store.setLanguage}
        pendingRequestsCount={pendingRequestsCount}
        pendingVouchersCount={pendingVouchersCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        customLogoUrl={store.customLogoUrl}
      />

      {/* 2. Main Content Area with Top Header & Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header with Quick Options, Notifications & Staff Profile */}
        <TopHeader
          currentTab={currentTab}
          currentUser={store.currentUser}
          language={store.language}
          onLanguageChange={store.setLanguage}
          onOpenNewVoucher={() => setIsVoucherModalOpen(true)}
          onOpenNewFundRequest={() => setCurrentTab('fund-requests')}
          onOpenChangePassword={() => setIsChangePasswordModalOpen(true)}
          onLogout={store.logout}
          firebaseStatus={store.firebaseStatus}
          notifications={store.notifications}
          unreadCount={store.unreadNotificationsCount}
          onMarkNotificationRead={store.markNotificationAsRead}
          onMarkAllNotificationsRead={store.markAllNotificationsAsRead}
          onNavigateTab={setCurrentTab}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          customLogoUrl={store.customLogoUrl}
          onOpenChangeLogo={() => setIsChangeLogoOpen(true)}
        />

        {/* Viewport Content */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          {/* Executive Dashboard (Strictly for Management: Founder & ED Forhad, Director Admin & Finance Kanta) */}
          {currentTab === 'dashboard' && store.isManagement && (
            <DashboardView
              branches={store.visibleBranches}
              projects={store.visibleProjects}
              donors={store.donors}
              vouchers={store.visibleVouchers}
              onNavigateTab={setCurrentTab}
              onOpenNewVoucher={() => setIsVoucherModalOpen(true)}
            />
          )}

          {/* Automatic Fallback for Field/Accounts if on dashboard tab */}
          {currentTab === 'dashboard' && !store.isManagement && (
            store.isBranchRep ? (
              <BranchPortalView
                currentUser={store.currentUser}
                branches={store.branches}
                currentBranch={currentBranch}
                subBranches={store.subBranches}
                fundRequests={store.visibleFundRequests}
                branchProjects={store.visibleProjects}
                branchVouchers={store.branchExpensesOnly}
                pettyCashLogs={store.pettyCashLogs}
                onOpenNewVoucher={() => setIsVoucherModalOpen(true)}
                onRecordPettyCash={store.addPettyCashLog}
                onSelectPrintVoucher={setSelectedPrintVoucher}
                onNavigateTab={setCurrentTab}
                language={store.language}
              />
            ) : (
              <FundRequestsView
                fundRequests={store.visibleFundRequests}
                branches={store.branches}
                subBranches={store.subBranches}
                projects={store.projects}
                currentUser={store.currentUser}
                language={store.language}
                isBranchRep={store.isBranchRep}
                isCentralAccounts={store.isCentralAccounts}
                isManagement={store.isManagement}
                onAddFundRequest={store.addFundRequest}
                onVerifyByAccounts={store.verifyFundRequestByAccounts}
                onApproveByManagement={store.approveFundRequestByManagement}
                onReject={store.rejectFundRequest}
                onDisburse={store.disburseFundRequest}
                onEditFundRequest={store.editFundRequest}
                onDeleteFundRequest={store.deleteFundRequest}
              />
            )
          )}

          {/* Super Admin & Management Staff Directory, Access Control, Password Reset, Onboarding & Removal */}
          {currentTab === 'staff-management' && (store.isSuperAdmin || store.isManagement) && (
            <StaffManagementView
              users={store.users}
              branches={store.branches}
              currentUser={store.currentUser}
              isSuperAdmin={store.isSuperAdmin}
              onAddStaff={store.addStaff}
              onRemoveStaff={store.removeStaff}
              onToggleStaffStatus={store.toggleStaffStatus}
              onResetStaffPassword={store.resetStaffPassword}
              onUpdateStaff={store.updateStaff}
              onTransferStaff={store.transferStaff}
              onOpenChangeLogo={() => setIsChangeLogoOpen(true)}
              onOpenPayrollModal={() => setIsPayrollModalOpen(true)}
              language={store.language}
            />
          )}

          {/* Fund Requisitions: 2-Step Verification (Branch Requisition -> Accounts Verification -> Management Approval -> Disbursement) */}
          {currentTab === 'fund-requests' && (
            <FundRequestsView
              fundRequests={store.visibleFundRequests}
              branches={store.branches}
              subBranches={store.subBranches}
              projects={store.projects}
              currentUser={store.currentUser}
              language={store.language}
              isBranchRep={store.isBranchRep}
              isCentralAccounts={store.isCentralAccounts}
              isManagement={store.isManagement}
              onAddFundRequest={store.addFundRequest}
              onVerifyByAccounts={store.verifyFundRequestByAccounts}
              onApproveByManagement={store.approveFundRequestByManagement}
              onReject={store.rejectFundRequest}
              onDisburse={store.disburseFundRequest}
              onEditFundRequest={store.editFundRequest}
              onDeleteFundRequest={store.deleteFundRequest}
            />
          )}

          {/* Sub-Branches & Operational Units Architecture */}
          {currentTab === 'sub-branches' && (
            <SubBranchesView
              branches={store.branches}
              subBranches={store.subBranches}
              users={store.users}
              currentUser={store.currentUser}
              isBranchRep={store.isBranchRep}
              onAddSubBranch={store.addSubBranch}
              onResetOfficialBranches={store.resetToOfficialBranches}
              onNavigateTab={setCurrentTab}
            />
          )}

          {/* Vouchers & Central Ledger (Central Accounts and Management only) */}
          {currentTab === 'vouchers' && !store.isBranchRep && (
            <VoucherManagementView
              vouchers={store.visibleVouchers}
              branches={store.visibleBranches}
              projects={store.visibleProjects}
              currentUser={store.currentUser}
              onApproveVoucher={store.approveVoucher}
              onRejectVoucher={store.rejectVoucher}
              onOpenNewVoucher={() => setIsVoucherModalOpen(true)}
              onSelectPrintVoucher={setSelectedPrintVoucher}
              onOpenPayroll={() => setIsPayrollModalOpen(true)}
              onEditVoucher={store.editVoucher}
              onDeleteVoucher={store.deleteVoucher}
            />
          )}

          {/* Project Budgets & Mother Account Allocations (Central Accounts & Management only) */}
          {currentTab === 'projects' && !store.isBranchRep && (
            <ProjectBudgetsView
              projects={store.visibleProjects}
              branches={store.visibleBranches}
              donors={store.donors}
              currentUser={store.currentUser}
              onCreateProject={store.createProject}
              onReallocateBudget={store.reallocateProjectBudget}
              onCloseProject={store.closeProject}
              onAddBranch={store.addBranch}
              onEditProject={store.editProject}
              onDeleteProject={store.deleteProject}
            />
          )}

          {/* Isolated Branch Portal (Field Incharges: Expenses only, Petty cash updates, Cash Float) */}
          {currentTab === 'branch-portal' && (
            <BranchPortalView
              currentUser={store.currentUser}
              branches={store.branches}
              currentBranch={currentBranch}
              subBranches={store.subBranches}
              fundRequests={store.visibleFundRequests}
              branchProjects={store.visibleProjects}
              branchVouchers={store.branchExpensesOnly}
              pettyCashLogs={store.pettyCashLogs}
              onOpenNewVoucher={() => setIsVoucherModalOpen(true)}
              onRecordPettyCash={store.addPettyCashLog}
              onSelectPrintVoucher={setSelectedPrintVoucher}
              onNavigateTab={setCurrentTab}
              language={store.language}
            />
          )}

          {/* Audit Reports & Financial Statements (Central Accounts & Management only) */}
          {currentTab === 'reports' && !store.isBranchRep && (
            <AuditReportsView
              vouchers={store.visibleVouchers}
              branches={store.visibleBranches}
              projects={store.visibleProjects}
              auditLogs={store.auditLogs}
              onSelectPrintVoucher={setSelectedPrintVoucher}
              customLogoUrl={store.customLogoUrl}
            />
          )}

          {/* Staff Member Isolated Profile & Password Management (Shows ONLY logged in staff's details) */}
          {currentTab === 'profile' && (
            <StaffProfileView
              currentUser={store.currentUser}
              vouchers={store.vouchers}
              fundRequests={store.fundRequests}
              onChangePassword={store.changePassword}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onLogout={store.logout}
              onNavigateToStaffManagement={() => setCurrentTab('staff-management')}
            />
          )}
        </main>

        {/* Clean Enterprise Footer */}
        <footer className="no-print border-t border-slate-800/80 bg-slate-950/90 py-4 px-6 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <LeedoLogo size="sm" variant="horizontal" />
              <span className="text-slate-600">|</span>
              <span className="text-[11px]">Local Education and Economic Development Organization (Govt. Reg # DHA-09281)</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firestore DB: <span className="text-emerald-400">ai-studio-leedomultibranch</span>
              </span>
              <span>•</span>
              <span>Security & Audit Active</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 3. Mobile Bottom Navigation Bar (Fast 1-touch navigation for mobile screens) */}
      <MobileBottomNav
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        currentUser={store.currentUser}
        onOpenNewVoucher={() => setIsVoucherModalOpen(true)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        language={store.language}
        pendingRequestsCount={pendingRequestsCount}
        pendingVouchersCount={pendingVouchersCount}
      />

      {/* Modals */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSave={store.addVoucher}
        branches={store.visibleBranches}
        subBranches={store.subBranches}
        projects={store.visibleProjects}
        donors={store.donors}
        fundRequests={store.fundRequests}
        defaultBranchId={store.userBranchId}
        isBranchRep={store.isBranchRep}
        language={store.language}
      />

      <PrintableVoucherModal
        voucher={selectedPrintVoucher}
        isOpen={Boolean(selectedPrintVoucher)}
        onClose={() => setSelectedPrintVoucher(null)}
        customLogoUrl={store.customLogoUrl}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={store.users}
        onLogin={store.loginWithCredentials}
        language={store.language}
        customLogoUrl={store.customLogoUrl}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen || isMandatoryPasswordChange}
        onClose={() => setIsChangePasswordModalOpen(false)}
        currentUser={store.currentUser}
        onChangePassword={store.changePassword}
        isMandatory={isMandatoryPasswordChange}
        language={store.language}
      />

      <PayrollModal
        isOpen={isPayrollModalOpen}
        onClose={() => setIsPayrollModalOpen(false)}
        users={store.users}
        onDisburse={store.disbursePayroll}
        language={store.language}
      />

      <ChangeLogoModal
        isOpen={isChangeLogoOpen}
        onClose={() => setIsChangeLogoOpen(false)}
        currentLogoUrl={store.customLogoUrl}
        onSaveLogo={store.updateLogo}
        onResetLogo={store.resetLogo}
        language={store.language}
      />
    </div>
  );
}
