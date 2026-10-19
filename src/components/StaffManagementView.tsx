import React, { useState } from 'react';
import { User, Branch, Language, UserRole } from '../types';
import { 
  Users, UserPlus, KeyRound, ShieldAlert, ShieldCheck, 
  Trash2, UserX, UserCheck2, Search, CheckCircle2, 
  AlertTriangle, Phone, Mail, Building, Building2, X, Edit3, ArrowRightLeft, Camera 
} from 'lucide-react';

interface StaffManagementViewProps {
  users: User[];
  branches: Branch[];
  currentUser: User;
  isSuperAdmin: boolean;
  onAddStaff: (data: Omit<User, 'id'>) => { success: boolean; message: string; user?: User };
  onRemoveStaff: (staffId: string) => { success: boolean; message: string };
  onToggleStaffStatus: (staffId: string) => { success: boolean; message: string; newStatus: string };
  onResetStaffPassword: (staffId: string, customPass?: string) => { success: boolean; message: string; password: string };
  onUpdateStaff?: (staffId: string, data: Partial<User>) => { success: boolean; message: string };
  onTransferStaff?: (
    staffId: string, 
    targetBranchId: string, 
    newRole?: UserRole, 
    newDesignation?: string, 
    newAssignedUnits?: string[],
    newAssignedBranchIds?: string[],
    newAssignedBranchNames?: string[]
  ) => { success: boolean; message: string };
  onOpenChangeLogo?: () => void;
  onOpenPayrollModal?: () => void;
  language?: Language;
}

export const StaffManagementView: React.FC<StaffManagementViewProps> = ({
  users,
  branches,
  currentUser,
  isSuperAdmin,
  onAddStaff,
  onRemoveStaff,
  onToggleStaffStatus,
  onResetStaffPassword,
  onUpdateStaff,
  onTransferStaff,
  onOpenChangeLogo,
  onOpenPayrollModal,
  language = 'bn',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Password reset modal state
  const [resetModalStaff, setResetModalStaff] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('leedo');
  const [actionAlert, setActionAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirm delete modal state
  const [deleteModalStaff, setDeleteModalStaff] = useState<User | null>(null);

  // Transfer & Edit Staff Modal State (area change, role change, info correction & multi-branch access)
  const [editModalStaff, setEditModalStaff] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('BRANCH_REP');
  const [editBranchId, setEditBranchId] = useState('');
  const [editAssignedBranchIds, setEditAssignedBranchIds] = useState<string[]>([]);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // New Staff Form State
  const [newStaffId, setNewStaffId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState('Social Mobilizer');
  const [newRole, setNewRole] = useState<UserRole>('BRANCH_REP');
  const [newBranchId, setNewBranchId] = useState(branches[0]?.id || 'br-airport-sus');
  const [newAssignedBranchIds, setNewAssignedBranchIds] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState('+880 1711-');
  const [newPass, setNewPass] = useState('leedo');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.branchName && u.branchName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.assignedBranchNames && u.assignedBranchNames.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesBranch = selectedBranch === 'ALL' || 
      u.branchId === selectedBranch ||
      (u.assignedBranchIds && u.assignedBranchIds.includes(selectedBranch));

    return matchesSearch && matchesRole && matchesBranch;
  });

  const handleAddNewStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffId.trim() || !newName.trim()) return;

    // Multi-branch assignment support (2 to 3 branches)
    const initialAssignedIds = newRole === 'BRANCH_REP' 
      ? (newAssignedBranchIds.length > 0 ? newAssignedBranchIds : [newBranchId])
      : ['br-head-office'];

    const initialAssignedNames = initialAssignedIds.map(bid => branches.find(b => b.id === bid)?.name || bid);
    const primaryBranchId = initialAssignedIds[0] || newBranchId;
    const selectedBranchObj = branches.find(b => b.id === primaryBranchId);

    const res = onAddStaff({
      staffId: newStaffId.trim(),
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@leedo.org`,
      designation: newDesignation,
      role: newRole,
      branchId: newRole === 'BRANCH_REP' ? primaryBranchId : undefined,
      branchName: newRole === 'BRANCH_REP' ? (selectedBranchObj?.name || 'Branch') : undefined,
      assignedBranchIds: initialAssignedIds,
      assignedBranchNames: initialAssignedNames,
      phone: newPhone.trim(),
      password: newPass || 'leedo',
      status: 'ACTIVE',
      joinedDate: new Date().toISOString().substring(0, 10),
    });

    if (res.success) {
      setActionAlert({ type: 'success', text: res.message });
      setIsAddModalOpen(false);
      // Reset form
      setNewStaffId('');
      setNewName('');
      setNewEmail('');
      setNewAssignedBranchIds([]);
      setNewPhone('+880 1711-');
    } else {
      setActionAlert({ type: 'error', text: res.message });
    }
  };

  const handleConfirmResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalStaff) return;

    const res = onResetStaffPassword(resetModalStaff.staffId, newPasswordInput);
    if (res.success) {
      setActionAlert({ type: 'success', text: res.message });
      setResetModalStaff(null);
    } else {
      setActionAlert({ type: 'error', text: res.message });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteModalStaff) return;
    const res = onRemoveStaff(deleteModalStaff.staffId);
    if (res.success) {
      setActionAlert({ type: 'success', text: res.message });
      setDeleteModalStaff(null);
    } else {
      setActionAlert({ type: 'error', text: res.message });
    }
  };

  const handleToggleStatus = (staffId: string) => {
    const res = onToggleStaffStatus(staffId);
    if (res.success) {
      setActionAlert({ type: 'success', text: res.message });
    }
  };

  const handleOpenEditModal = (staff: User) => {
    setEditModalStaff(staff);
    setEditName(staff.name);
    setEditDesignation(staff.designation);
    setEditRole(staff.role);
    const initialBranchId = staff.branchId || branches[0]?.id || 'br-airport-sus';
    setEditBranchId(initialBranchId);
    const initialAssigned = staff.assignedBranchIds && staff.assignedBranchIds.length > 0
      ? staff.assignedBranchIds
      : [initialBranchId];
    setEditAssignedBranchIds(initialAssigned);
    setEditPhone(staff.phone || '');
    setEditEmail(staff.email || '');
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalStaff) return;

    const currentBranchIds = editRole === 'BRANCH_REP'
      ? (editAssignedBranchIds.length > 0 ? editAssignedBranchIds : [editBranchId || branches[0]?.id || 'br-airport-sus'])
      : ['br-head-office'];

    const assignedBranchNames = currentBranchIds.map(bid => branches.find(b => b.id === bid)?.name || bid);
    const primaryBranchId = currentBranchIds.includes(editBranchId) ? editBranchId : currentBranchIds[0];
    const selectedBranchObj = branches.find(b => b.id === primaryBranchId);
    const branchName = editRole === 'BRANCH_REP' ? (selectedBranchObj?.name || assignedBranchNames[0] || 'Branch') : undefined;
    const branchId = editRole === 'BRANCH_REP' ? primaryBranchId : undefined;

    if (onTransferStaff) {
      const res = onTransferStaff(
        editModalStaff.staffId,
        branchId || 'br-head-office',
        editRole,
        editDesignation,
        editModalStaff.assignedUnits,
        currentBranchIds,
        assignedBranchNames
      );

      if (res && res.success) {
        if (onUpdateStaff) {
          onUpdateStaff(editModalStaff.staffId, {
            name: editName.trim(),
            designation: editDesignation.trim(),
            role: editRole,
            branchId,
            branchName,
            assignedBranchIds: currentBranchIds,
            assignedBranchNames: assignedBranchNames,
            phone: editPhone.trim(),
            email: editEmail.trim(),
          });
        }
        setActionAlert({ type: 'success', text: res.message });
        setEditModalStaff(null);
        return;
      }
    }

    if (onUpdateStaff) {
      const res = onUpdateStaff(editModalStaff.staffId, {
        name: editName.trim(),
        designation: editDesignation.trim(),
        role: editRole,
        branchId,
        branchName,
        assignedBranchIds: currentBranchIds,
        assignedBranchNames: assignedBranchNames,
        phone: editPhone.trim(),
        email: editEmail.trim(),
      });
      if (res.success) {
        setActionAlert({ type: 'success', text: res.message });
        setEditModalStaff(null);
      } else {
        setActionAlert({ type: 'error', text: res.message });
      }
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'MANAGEMENT':
        return 'bg-red-950 text-red-300 border-red-800';
      case 'CENTRAL_ACCOUNTS':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      case 'BRANCH_REP':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const activeCount = users.filter(u => u.status !== 'INACTIVE').length;
  const inactiveCount = users.filter(u => u.status === 'INACTIVE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Alert toast if message exists */}
      {actionAlert && (
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          actionAlert.type === 'success' 
            ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200' 
            : 'bg-rose-950/80 border-rose-800 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionAlert.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span className="font-semibold">{actionAlert.text}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Super Admin Top Control Banner */}
      <div className="bg-gradient-to-r from-red-950/70 via-slate-900 to-purple-950/50 rounded-2xl border border-red-900/40 p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/60 border border-red-700/60 text-red-200 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-red-400" />
              <span>{language === 'bn' ? 'সুপার এডমিন কন্ট্রোল সেন্টার' : 'Super Admin Authority'}</span>
              <span>•</span>
              <span className="text-white">Murshida Akhter Kanta (Staff ID: 1002)</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {language === 'bn' ? 'কর্মী ব্যবস্থাপনা, এক্সেস কন্ট্রোল ও পাসওয়ার্ড রিসেট' : 'Staff Management & Access Control Hub'}
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              {language === 'bn'
                ? 'সংস্থার পরিচালক (প্রশাসন ও অর্থ) হিসেবে নতুন কর্মী যোগদান, সংস্থার কাউকে বাদ দেওয়া, কিংবা কারো পাসওয়ার্ড ভুলে গেলে তাৎক্ষণিক নতুন পাসওয়ার্ড প্রদান ও এক্সেস নিয়ন্ত্রণের পূর্ণ ক্ষমতা।'
                : 'Direct authority for Director - Admin & Finance: Onboard new joining staff, remove departing members, reset forgotten passwords, and control branch access.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onOpenChangeLogo && (
              <button
                type="button"
                onClick={onOpenChangeLogo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 text-purple-200 font-bold text-xs border border-purple-700/70 shadow-md transition-all cursor-pointer"
                title="সংস্থার লোগো পরিবর্তন ও আপডেট করুন (Change Organization Logo)"
              >
                <Camera className="w-4 h-4 text-purple-400" />
                <span>{language === 'bn' ? 'সংস্থার লোগো পরিবর্তন' : 'Change Org Logo'}</span>
              </button>
            )}
            {onOpenPayrollModal && (
              <button
                type="button"
                onClick={onOpenPayrollModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 shadow-md transition-all cursor-pointer"
              >
                <span>৳ {language === 'bn' ? 'বেতন ও বোনাস বিতরণ' : 'Disburse Payroll'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs shadow-lg shadow-red-950/60 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>{language === 'bn' ? '+ নতুন কর্মী যুক্ত করুন' : '+ Add New Staff'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block">{language === 'bn' ? 'মোট নিবন্ধিত কর্মী' : 'Total Registered Staff'}</span>
            <span className="text-lg font-black font-mono text-white mt-0.5 block">{users.length} জন</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block">{language === 'bn' ? 'সক্রিয় দায়িত্বশীল' : 'Active Duty Staff'}</span>
            <span className="text-lg font-black font-mono text-emerald-400 mt-0.5 block">{activeCount} জন</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block">{language === 'bn' ? 'সুপার এডমিন ও ম্যানেজমেন্ট' : 'Super Admin & Mgmt'}</span>
            <span className="text-lg font-black font-mono text-purple-400 mt-0.5 block">
              {users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'MANAGEMENT').length} জন
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block">{language === 'bn' ? 'নিষ্ক্রিয় / বাদ দেওয়া' : 'Deactivated / Departed'}</span>
            <span className="text-lg font-black font-mono text-rose-400 mt-0.5 block">{inactiveCount} জন</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'নাম, স্টাফ আইডি (1001, 1023), বা পদবী খুঁজুন...' : 'Search by name, staff ID, or designation...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <select
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">{language === 'bn' ? 'সকল পদবী ও ভূমিকা (All Roles)' : 'All Roles'}</option>
            <option value="SUPER_ADMIN">Super Admin (সর্বোচ্চ ক্ষমতা)</option>
            <option value="MANAGEMENT">Executive Management (ব্যবস্থাপনা)</option>
            <option value="CENTRAL_ACCOUNTS">Central Accounts (অ্যাকাউন্টস)</option>
            <option value="BRANCH_REP">Branch Incharge & Rep (মাঠ কর্মকর্তা)</option>
          </select>

          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">{language === 'bn' ? 'সকল শাখা ও কেন্দ্র (All Branches)' : 'All Branches'}</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff Directory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3">স্টাফ আইডি ও নাম</th>
                <th className="py-3 px-3">পদবী ও দায়িত্ব</th>
                <th className="py-3 px-3">সিস্টেম রোল (Role)</th>
                <th className="py-3 px-3">শাখা / কর্মক্ষেত্র</th>
                <th className="py-3 px-3">যোগাযোগ (ইমেইল ও ফোন)</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">সুপার এডমিন অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500">
                    কোনো কর্মী খুঁজে পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isKanta = user.staffId === '1002';
                  const isInactive = user.status === 'INACTIVE';
                  return (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-slate-800/30 transition-colors ${isInactive ? 'opacity-50 bg-rose-950/10' : ''}`}
                    >
                      {/* Staff ID & Name */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg font-black text-xs flex items-center justify-center font-mono border ${
                            isKanta ? 'bg-purple-900 border-purple-500 text-purple-200' :
                            user.role === 'MANAGEMENT' ? 'bg-red-900 border-red-600 text-red-200' :
                            user.role === 'CENTRAL_ACCOUNTS' ? 'bg-blue-900 border-blue-600 text-blue-200' :
                            'bg-slate-800 border-slate-700 text-slate-200'
                          }`}>
                            {user.staffId}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isKanta && (
                                <span className="text-[10px] bg-purple-900 text-purple-200 px-1.5 py-0.2 rounded font-mono font-bold">
                                  SUPER ADMIN
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">ID: {user.staffId}</div>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{user.designation}</div>
                        {user.assignedUnits && user.assignedUnits.length > 0 && (
                          <div className="text-[10px] text-red-400 line-clamp-1 mt-0.5">
                            {user.assignedUnits.join(', ')}
                          </div>
                        )}
                      </td>

                      {/* System Role */}
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Branch & Multi-Branch Access */}
                      <td className="py-3 px-3">
                        {user.assignedBranchNames && user.assignedBranchNames.length > 1 ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-mono">
                                {user.assignedBranchNames.length}টি শাখার যৌথ দায়িত্ব
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {user.assignedBranchNames.map(bName => (
                                <span 
                                  key={bName} 
                                  className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    bName === user.branchName
                                      ? 'bg-red-950/60 text-red-200 border-red-800 font-bold'
                                      : 'bg-slate-800 text-slate-300 border-slate-700'
                                  }`}
                                >
                                  {bName}
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-300 font-medium">
                            {user.branchName || 'Head office'}
                          </div>
                        )}
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-3">
                        <div className="text-slate-300 font-mono text-[11px]">{user.email}</div>
                        <div className="text-slate-400 text-[11px]">{user.phone || '+880 1711-XXXXXX'}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                          isInactive 
                            ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {isInactive ? 'নিষ্ক্রিয় (Inactive)' : 'সক্রিয় (Active)'}
                        </span>
                      </td>

                      {/* Actions for Super Admin */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 0. Edit / Transfer Staff (Area/Branch Change & Role/Access Change) */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(user)}
                            title="শাখা বদলি, এলাকা পরিবর্তন ও পদবি/এক্সেস সংশোধন (Transfer / Edit Staff)"
                            className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg border border-transparent hover:border-sky-700/50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* 1. Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalStaff(user);
                              setNewPasswordInput(user.staffId);
                            }}
                            title="পাসওয়ার্ড রিসেট করুন (পাসওয়ার্ড হবে স্টাফ আইডি)"
                            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg border border-transparent hover:border-amber-700/50 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Toggle Status (Active / Inactive) */}
                          {!isKanta && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user.staffId)}
                              title={isInactive ? 'সক্রিয় করুন (Activate)' : 'নিষ্ক্রিয় করুন (Deactivate)'}
                              className={`p-1.5 rounded-lg border border-transparent transition-colors ${
                                isInactive 
                                  ? 'text-emerald-400 hover:bg-emerald-950/60 hover:border-emerald-700/50' 
                                  : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
                              }`}
                            >
                              {isInactive ? <UserCheck2 className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                            </button>
                          )}

                          {/* 3. Remove / Delete Button (kew chole gele take bad deowa) */}
                          {!isKanta && (
                            <button
                              type="button"
                              onClick={() => setDeleteModalStaff(user)}
                              title="কর্মী চলে গেলে সিস্টেম থেকে বাদ দিন (Remove Staff)"
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-lg border border-transparent hover:border-rose-800/50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-red-500" />
                <h3 className="text-base font-bold text-white">
                  {language === 'bn' ? 'সংস্থায় নতুন কর্মী নিবন্ধন করুন' : 'Register New Staff Member'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewStaffSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'স্টাফ আইডি (Staff ID)' : 'Staff Numeric ID'} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: 1045, 1050"
                    value={newStaffId}
                    onChange={e => setNewStaffId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'সিস্টেম রোল (Role)' : 'Role'} *
                  </label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="BRANCH_REP">Branch Rep / Field Incharge</option>
                    <option value="CENTRAL_ACCOUNTS">Central Accounts Team</option>
                    <option value="MANAGEMENT">Executive Management</option>
                    <option value="SUPER_ADMIN">Super Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'কর্মীর পূর্ণ নাম (Full Name)' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মোঃ কামরুল ইসলাম"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'পদবী (Designation)' : 'Designation'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDesignation}
                    onChange={e => setNewDesignation(e.target.value)}
                    placeholder="Social Mobilizer / Educator"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'মূল শাখা / পোস্টিং (Primary Branch)' : 'Primary Branch'}
                  </label>
                  <select
                    value={newBranchId}
                    onChange={e => {
                      const bid = e.target.value;
                      setNewBranchId(bid);
                      if (!newAssignedBranchIds.includes(bid)) {
                        setNewAssignedBranchIds(prev => [bid, ...prev.filter(id => id !== bid)]);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Branch Assignment (একই সাথে ২-৩টি শাখার দায়িত্ব প্রদান) */}
              {newRole === 'BRANCH_REP' && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        {language === 'bn' 
                          ? 'বহু-শাখা এক্সেস ও দায়িত্ব (২ বা ৩টি শাখার দায়িত্ব দিতে টিক দিন)' 
                          : 'Assign Multiple Branches (2 or 3 branches)'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {language === 'bn'
                          ? 'কর্মী যে যে শাখার দায়িত্ব পালন করবেন, সেগুলোতে টিক দিন:'
                          : 'Select all branches this staff will have access to manage:'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                      {(newAssignedBranchIds.length > 0 ? newAssignedBranchIds : [newBranchId]).length}টি শাখা
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {branches.map(b => {
                      const effectiveList = newAssignedBranchIds.length > 0 ? newAssignedBranchIds : [newBranchId];
                      const isChecked = effectiveList.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-red-950/40 border-red-700 text-white font-medium'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewAssignedBranchIds(prev => {
                                  const base = prev.length > 0 ? prev : [newBranchId];
                                  return [...new Set([...base, b.id])];
                                });
                              } else {
                                const current = newAssignedBranchIds.length > 0 ? newAssignedBranchIds : [newBranchId];
                                if (current.length > 1) {
                                  const updated = current.filter(id => id !== b.id);
                                  setNewAssignedBranchIds(updated);
                                  if (newBranchId === b.id) setNewBranchId(updated[0]);
                                }
                              }
                            }}
                            className="rounded border-slate-700 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                          />
                          <span className="truncate leading-tight">{b.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="kamrul@leedo.org"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'প্রাথমিক লগইন পাসওয়ার্ড (Initial Password)' : 'Default Password'} *
                </label>
                <input
                  type="text"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'bn' ? 'কর্মী পরবর্তীতে নিজের প্রোফাইল থেকে এই পাসওয়ার্ড পরিবর্তন করতে পারবেন।' : 'Staff member can change this password later in their profile.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/50"
                >
                  সংরক্ষণ ও কর্মী নিবন্ধন সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal (password vule gele) */}
      {resetModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">পাসওয়ার্ড তাৎক্ষণিক রিসেট</h3>
              </div>
              <button onClick={() => setResetModalStaff(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="text-slate-400">কর্মী: <span className="text-white font-bold">{resetModalStaff.name}</span></div>
              <div className="text-slate-400 font-mono">Staff ID: <span className="text-red-400 font-bold">{resetModalStaff.staffId}</span></div>
              <div className="text-slate-400">পদবী: {resetModalStaff.designation}</div>
            </div>

            <form onSubmit={handleConfirmResetPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  রিসেট পাসওয়ার্ড প্রদান করুন (পাসওয়ার্ড হবে স্টাফ আইডি) *
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(resetModalStaff.staffId)}
                    className="px-2.5 py-1 bg-amber-950/80 text-amber-300 border border-amber-800 rounded-lg hover:bg-amber-900 font-bold"
                  >
                    ✓ স্টাফ আইডি "{resetModalStaff.staffId}" (ডিফল্ট EID)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput('leedo')}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    "leedo"
                  </button>
                </div>
                <p className="text-[11px] text-amber-300/90 mt-2 bg-amber-950/30 p-2 rounded-lg border border-amber-900/40">
                  ℹ️ কর্মী এই পাসওয়ার্ড (স্টাফ আইডি: {resetModalStaff.staffId}) দিয়ে লগইন করার পর সিস্টেম তাকে বাধ্যতামূলকভাবে নতুন ব্যক্তিগত পাসওয়ার্ড সেট করতে বলবে।
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setResetModalStaff(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-lg"
                >
                  পাসওয়ার্ড রিসেট সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete / Bad Deowa Confirm Modal (kew chole gele bad deowa) */}
      {deleteModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-rose-800/80 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-white">কর্মী প্রত্যাহার / বাদ দিন (Remove Staff)</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিত যে কর্মী <strong className="text-white">{deleteModalStaff.name}</strong> (Staff ID: <strong className="text-red-400">{deleteModalStaff.staffId}</strong>) কে সংস্থা থেকে বাদ দিতে চান? 
              তিনি আর সিস্টেমে লগইন করতে পারবেন না।
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteModalStaff(null)}
                className="px-3 py-1.5 text-slate-400 hover:text-white text-xs"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-950/60"
              >
                হ্যাঁ, সংস্থাতথ্য হতে বাদ দিন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Transfer Staff Modal (Area change, access change, designation, contact info) */}
      {editModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-6">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ArrowRightLeft className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'bn' ? 'কর্মী বদলি, এলাকা ও এক্সেস পরিবর্তন' : 'Transfer Staff & Update Access'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Staff ID: {editModalStaff.staffId} · {editModalStaff.name}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setEditModalStaff(null)} 
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'কর্মীর পূর্ণ নাম' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'পদবী (Designation)' : 'Designation'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editDesignation}
                    onChange={e => setEditDesignation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* System Role & Access */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'সিস্টেম এক্সেস ও রোল' : 'System Role & Access'} *
                  </label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <option value="BRANCH_REP">Branch Field Accounts Rep (মাঠ পর্যায়)</option>
                    <option value="CENTRAL_ACCOUNTS">Central Accounts Team (প্রধান হিসাব)</option>
                    <option value="MANAGEMENT">Executive Management (নির্বাহী)</option>
                    <option value="SUPER_ADMIN">Super Admin (পরিচালক)</option>
                  </select>
                </div>

                {/* Branch / Operational Area */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'নিযুক্ত শাখা / কর্ম এলাকা' : 'Branch / Operational Area'} *
                  </label>
                  <select
                    value={editBranchId}
                    onChange={e => {
                      const bid = e.target.value;
                      setEditBranchId(bid);
                      if (!editAssignedBranchIds.includes(bid)) {
                        setEditAssignedBranchIds(prev => [bid, ...prev.filter(id => id !== bid)]);
                      }
                    }}
                    disabled={editRole !== 'BRANCH_REP'}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500 cursor-pointer ${
                      editRole !== 'BRANCH_REP' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                  {editRole !== 'BRANCH_REP' && (
                    <span className="text-[10px] text-slate-500 mt-0.5 block">
                      {language === 'bn' ? 'প্রধান কার্যালয়ের কর্মীদের জন্য প্রযোজ্য নয়' : 'Central staff belongs to Head Office'}
                    </span>
                  )}
                </div>
              </div>

              {/* Multi-Branch Responsibility Assignment (বহু-শাখা এক্সেস ও দায়িত্ব) */}
              {editRole === 'BRANCH_REP' && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-400" />
                        {language === 'bn' 
                          ? 'বহু-শাখা এক্সেস ও দায়িত্ব (একই সাথে ২-৩টি শাখার দায়িত্ব দিতে টিক দিন)' 
                          : 'Multi-Branch Access (Assign 2 to 3 branches)'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {language === 'bn' 
                          ? 'কর্মী যে যে শাখার দায়িত্ব পালন করবেন, সেগুলোতে টিক চিহ্ন দিন। কর্মী এই সকল শাখার ভাউচার ও রিকুইজিশন তৈরি করতে পারবেন:' 
                          : 'Select all branches this staff member is authorized to access:'}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                      {editAssignedBranchIds.length} {language === 'bn' ? 'টি শাখা নির্বাচিত' : 'Branches'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1">
                    {branches.map(b => {
                      const isChecked = editAssignedBranchIds.includes(b.id);
                      return (
                        <label
                          key={b.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-red-950/40 border-red-700/80 text-white font-medium shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditAssignedBranchIds(prev => [...prev, b.id]);
                                if (!editBranchId) setEditBranchId(b.id);
                              } else {
                                if (editAssignedBranchIds.length > 1) {
                                  const updated = editAssignedBranchIds.filter(id => id !== b.id);
                                  setEditAssignedBranchIds(updated);
                                  if (editBranchId === b.id) setEditBranchId(updated[0]);
                                }
                              }
                            }}
                            className="rounded border-slate-700 text-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
                          />
                          <div className="min-w-0">
                            <span className="block truncate text-[11px] leading-tight">{b.name}</span>
                            <span className="text-[9px] font-mono text-slate-500 block">{b.code}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Primary Operating Branch Selector */}
                  {editAssignedBranchIds.length > 1 && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {language === 'bn' ? 'ডিফল্ট সক্রিয় শাখা (Primary Branch):' : 'Primary Active Branch:'}
                      </span>
                      <select
                        value={editBranchId}
                        onChange={e => setEditBranchId(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-bold focus:outline-none"
                      >
                        {editAssignedBranchIds.map(bid => {
                          const b = branches.find(item => item.id === bid);
                          return <option key={bid} value={bid}>{b?.name || bid}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'যোগাযোগের মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    {language === 'bn' ? 'অফিসিয়াল ইমেইল' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/50 text-[11px] text-sky-200 leading-relaxed">
                ℹ️ {language === 'bn' 
                  ? 'শাখা বা এক্সেস পরিবর্তন করা হলে কর্মী পরবর্তী লগইনে সরাসরি তার নতুন শাখা ও অনুমতি অনুযায়ী কাজ করতে পারবেন। সকল তথ্য ক্লাউড ফায়ারবেসে তাৎক্ষণিক সংরক্ষিত হবে।'
                  : 'Branch or role modifications take effect immediately across all devices with real-time Firebase sync.'}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalStaff(null)}
                  className="px-4 py-2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-950/60 cursor-pointer"
                >
                  {language === 'bn' ? 'তথ্য হালনাগাদ ও বদলি নিশ্চিত করুন' : 'Save Changes & Update Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
