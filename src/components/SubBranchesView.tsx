import React, { useState } from 'react';
import { Branch, SubBranch, User } from '../types';
import { 
  Building2, Plus, Users, Phone, MapPin, CheckCircle2, 
  X, Layers, Search, Shield, ArrowRight, RotateCcw, Wallet, Landmark 
} from 'lucide-react';

interface SubBranchesViewProps {
  branches: Branch[];
  subBranches: SubBranch[];
  users?: User[];
  currentUser: User;
  isBranchRep: boolean;
  onAddSubBranch: (branchId: string, subData: {
    name: string;
    code: string;
    inChargeStaffId?: string;
    inChargeName?: string;
    phone?: string;
    description?: string;
  }) => void;
  onResetOfficialBranches?: () => { success: boolean; message: string };
  onNavigateTab?: (tab: string) => void;
}

export const SubBranchesView: React.FC<SubBranchesViewProps> = ({
  branches,
  subBranches,
  users = [],
  currentUser,
  isBranchRep,
  onAddSubBranch,
  onResetOfficialBranches,
  onNavigateTab,
}) => {
  const [activeTab, setActiveTab] = useState<'BRANCHES' | 'SUB_BRANCHES'>('BRANCHES');
  const [showModal, setShowModal] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncAlert, setSyncAlert] = useState<string | null>(null);

  // Form State
  const [targetBranchId, setTargetBranchId] = useState<string>(currentUser.branchId || (branches[0]?.id ?? ''));
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [inChargeStaffId, setInChargeStaffId] = useState(currentUser.staffId || '');
  const [inChargeName, setInChargeName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      alert('Please provide Sub-Branch Name and Code.');
      return;
    }

    onAddSubBranch(targetBranchId, {
      name: name.trim(),
      code: code.trim(),
      inChargeStaffId: inChargeStaffId.trim(),
      inChargeName: inChargeName.trim(),
      phone: phone.trim(),
      description: description.trim(),
    });

    setShowModal(false);
    setName('');
    setCode('');
    setDescription('');
  };

  const handleResetBranches = () => {
    if (onResetOfficialBranches) {
      const res = onResetOfficialBranches();
      setSyncAlert(res.message);
      setTimeout(() => setSyncAlert(null), 5000);
    }
  };

  // Filtered branches for tab 1
  const filteredBranches = branches.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
  });

  // Filtered sub-branches for tab 2
  const visibleSubBranches = isBranchRep
    ? subBranches.filter(s => s.branchId === currentUser.branchId || (currentUser.assignedBranchIds && currentUser.assignedBranchIds.includes(s.branchId)))
    : subBranches.filter(s => {
        if (selectedBranchFilter !== 'ALL' && s.branchId !== selectedBranchFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.branchName.toLowerCase().includes(q);
        }
        return true;
      });

  const isSuperAdminOrMgmt = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MANAGEMENT';

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {syncAlert && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{syncAlert}</span>
          </div>
          <button onClick={() => setSyncAlert(null)} className="p-1 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="p-3 rounded-xl bg-red-950/70 text-red-400 border border-red-800/50 shrink-0">
            <Building2 className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              LEEDO Branches & Sub-Branch Architecture (শাখা ও উপ-শাখা)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              অফিসিয়াল ১২টি প্রধান শাখা ও উপ-শাখা নেটওয়ার্ক · বহু-শাখা কর্মী দায়িত্ব ও ফিল্ড ইউনিট প্রশাসন
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isSuperAdminOrMgmt && onResetOfficialBranches && (
            <button
              type="button"
              onClick={handleResetBranches}
              title="পূর্বের পুরোনো সব শাখা বাদ দিয়ে নতুন ১২টি অফিসিয়াল শাখা হালনাগাদ ও নিশ্চিত করুন"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold border border-amber-800/50 transition-all cursor-pointer shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>১২টি শাখা নিশ্চিত করুন (Sync 12 Branches)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setTargetBranchId(currentUser.branchId || (branches[0]?.id ?? ''));
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন উপ-শাখা যোগ (Add Sub-Branch)</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('BRANCHES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'BRANCHES'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>অফিসিয়াল ১২টি প্রধান শাখা ({branches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SUB_BRANCHES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'SUB_BRANCHES'
                ? 'bg-red-600 text-white shadow-md shadow-red-950/60'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>শাখাধীন উপ-শাখা ও ইউনিটসমূহ ({subBranches.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder={activeTab === 'BRANCHES' ? "শাখার নাম বা কোড খুঁজুন..." : "উপ-শাখা বা ইউনিট খুঁজুন..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs w-64 focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* TAB 1: 12 Official LEEDO Branches */}
      {activeTab === 'BRANCHES' && (
        <div className="space-y-4">
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400 flex items-center justify-between">
            <span>
              লিডোর কার্যক্রমের ১২টি প্রধান কেন্দ্র: Airport SUS, Mirpur SUS, Tejgaon SUS, Kamalapur SUS, Kamalapur TSSB, Kadamtali TSSB, Sadarghat SUS, Shambazar SUS, Vocational Trade, Inclusive school, Peac Home, Head office.
            </span>
            <span className="font-mono text-emerald-400 font-bold shrink-0 ml-2">মোট ১২টি শাখা সক্রিয়</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBranches.map(branch => {
              // Find staff assigned to this branch
              const assignedStaff = users.filter(u => 
                u.branchId === branch.id || (u.assignedBranchIds && u.assignedBranchIds.includes(branch.id))
              );

              // Sub-branches under this branch
              const branchSubBranches = subBranches.filter(s => s.branchId === branch.id);

              return (
                <div
                  key={branch.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Header: Code & Status */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-950/70 px-2 py-0.5 rounded border border-red-800/50">
                        {branch.code}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        সক্রিয় শাখা
                      </span>
                    </div>

                    {/* Branch Title & Address */}
                    <div>
                      <h3 className="text-base font-bold text-white leading-snug">{branch.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span>{branch.address}</span>
                      </p>
                    </div>

                    {/* Financial Balances Card */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-sans">হাতে নগদ (Cash Float)</span>
                        <span className="text-amber-400 font-bold block mt-0.5">৳ {(Number(branch.currentCashFloat) || 0).toLocaleString()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <span className="text-[10px] text-slate-500 block font-sans">ব্যাংক ব্যালেন্স</span>
                        <span className="text-emerald-400 font-bold block mt-0.5">৳ {(Number(branch.bankBalance) || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Assigned In-charge & Staff with Multi-Branch tags */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        দায়িত্বপ্রাপ্ত ইনচার্জ ও কর্মী:
                      </span>
                      {assignedStaff.length > 0 ? (
                        <div className="space-y-1">
                          {assignedStaff.map(staff => {
                            const isMultiBranch = staff.assignedBranchIds && staff.assignedBranchIds.length > 1;
                            return (
                              <div 
                                key={staff.id} 
                                className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px]"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="font-bold text-white truncate">{staff.name}</span>
                                  <span className="text-[10px] font-mono text-slate-400 shrink-0">({staff.staffId})</span>
                                </div>
                                {isMultiBranch && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 shrink-0">
                                    {staff.assignedBranchIds?.length}টি শাখা দায়িত্ব
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic block">{branch.contactPerson}</span>
                      )}
                    </div>

                    {/* Sub-Units summary */}
                    {branchSubBranches.length > 0 && (
                      <div className="pt-1">
                        <span className="text-[10px] text-slate-500 block mb-1">
                          উপ-শাখা ও ইউনিটসমূহ ({branchSubBranches.length}টি):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {branchSubBranches.map(sub => (
                            <span 
                              key={sub.id} 
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Quick Actions */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">{branch.phone}</span>
                    {onNavigateTab && (
                      <button
                        type="button"
                        onClick={() => onNavigateTab('branch-portal')}
                        className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>শাখা পোর্টাল</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Sub-Branches & Field Units Directory */}
      {activeTab === 'SUB_BRANCHES' && (
        <div className="space-y-4">
          {/* Sub-Branch Filter Bar */}
          {!isBranchRep && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="উপ-শাখা বা কোড দিয়ে খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">শাখা অনুযায়ী ফিল্টার:</span>
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="ALL">সকল শাখা ({branches.length}টি শাখা)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Sub-Branches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleSubBranches.map(sub => (
              <div 
                key={sub.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                      {sub.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {sub.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mt-2 leading-snug">{sub.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="font-medium text-slate-300">মূল শাখা: {sub.branchName}</span>
                  </div>

                  {sub.description && (
                    <p className="text-xs text-slate-400 mt-2 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 leading-relaxed">
                      {sub.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> দায়িত্বশীল:
                    </span>
                    <span className="text-slate-200 font-semibold">{sub.inChargeName || 'Field Mobilizer'}</span>
                  </div>
                  {sub.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> ফোন:
                      </span>
                      <span className="text-slate-300 font-mono text-[11px]">{sub.phone}</span>
                    </div>
                  )}
                  {sub.inChargeStaffId && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">স্টাফ আইডি:</span>
                      <span className="text-red-400 font-mono font-bold">{sub.inChargeStaffId}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Sub-Branch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-red-950 text-red-400">
                  <Layers className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Add Sub-Branch / Unit (নতুন উপ-শাখা যোগ)</h3>
                  <p className="text-xs text-slate-400">Create a sub-unit under an existing LEEDO branch</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Parent Branch (মূল শাখা) *</label>
                {isBranchRep ? (
                  <input
                    type="text"
                    disabled
                    value={currentUser.branchName || 'My Branch'}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-bold"
                  />
                ) : (
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sub-Branch / Unit Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Kamalapur SUS or Night Shelter"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. KAM-SUS"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono uppercase focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">In-Charge Name</label>
                  <input
                    type="text"
                    value={inChargeName}
                    onChange={(e) => setInChargeName(e.target.value)}
                    placeholder="e.g. Md. Masud"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Staff ID</label>
                  <input
                    type="text"
                    value={inChargeStaffId}
                    onChange={(e) => setInChargeStaffId(e.target.value)}
                    placeholder="e.g. 1023"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description / Operational Scope</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe activities, target children, or facilities in this sub-branch..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-950/40"
                >
                  Save Sub-Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
