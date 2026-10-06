import React, { useState } from 'react';
import { User, Branch, Language, UserRole } from '../types';
import { 
  Users, UserPlus, KeyRound, ShieldAlert, ShieldCheck, 
  Trash2, UserX, UserCheck2, Search, CheckCircle2, 
  AlertTriangle, Phone, Mail, Building, Building2, X 
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

  // New Staff Form State
  const [newStaffId, setNewStaffId] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesignation, setNewDesignation] = useState('Social Mobilizer');
  const [newRole, setNewRole] = useState<UserRole>('BRANCH_REP');
  const [newBranchId, setNewBranchId] = useState(branches[0]?.id || 'br-kamalapur');
  const [newPhone, setNewPhone] = useState('+880 1711-');
  const [newPass, setNewPass] = useState('leedo');

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.staffId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.branchName && u.branchName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchesBranch = selectedBranch === 'ALL' || u.branchId === selectedBranch;

    return matchesSearch && matchesRole && matchesBranch;
  });

  const handleAddNewStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffId.trim() || !newName.trim()) return;

    const selectedBranchObj = branches.find(b => b.id === newBranchId);

    const res = onAddStaff({
      staffId: newStaffId.trim(),
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '')}@leedo.org`,
      designation: newDesignation,
      role: newRole,
      branchId: newRole === 'BRANCH_REP' ? newBranchId : undefined,
      branchName: newRole === 'BRANCH_REP' ? (selectedBranchObj?.name || 'Branch') : undefined,
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

                      {/* Branch */}
                      <td className="py-3 px-3">
                        <div className="text-slate-300 font-medium">
                          {user.branchName || 'Central Head Office'}
                        </div>
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
                          {/* 1. Reset Password Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setResetModalStaff(user);
                              setNewPasswordInput('leedo');
                            }}
                            title="পাসওয়ার্ড ভুলে গেলে রিসেট করুন (Reset Password)"
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
                    {language === 'bn' ? 'শাখা / পোস্টিং (Branch)' : 'Assigned Branch'}
                  </label>
                  <select
                    value={newBranchId}
                    onChange={e => setNewBranchId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

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
                  নতুন পাসওয়ার্ড প্রদান করুন (New Password) *
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={e => setNewPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput('leedo')}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    ডিফল্ট "leedo"
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPasswordInput(`leedo${resetModalStaff.staffId}`)}
                    className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                  >
                    "leedo{resetModalStaff.staffId}"
                  </button>
                </div>
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
                  পাসওয়ার্ড রিসেট নিশ্চিত করুন
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
    </div>
  );
};
