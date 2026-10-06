import React, { useState } from 'react';
import { Branch, SubBranch, User } from '../types';
import { 
  Building2, Plus, Users, Phone, MapPin, CheckCircle2, 
  X, Layers, Search, Shield 
} from 'lucide-react';

interface SubBranchesViewProps {
  branches: Branch[];
  subBranches: SubBranch[];
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
}

export const SubBranchesView: React.FC<SubBranchesViewProps> = ({
  branches,
  subBranches,
  currentUser,
  isBranchRep,
  onAddSubBranch,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

  const visibleSubBranches = isBranchRep
    ? subBranches.filter(s => s.branchId === currentUser.branchId)
    : subBranches.filter(s => {
        if (selectedBranchFilter !== 'ALL' && s.branchId !== selectedBranchFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.branchName.toLowerCase().includes(q);
        }
        return true;
      });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isBranchRep 
                  ? `${currentUser.branchName || 'Branch'} Sub-Branches & Field Units` 
                  : 'LEEDO Branches & Sub-Branch Architecture (শাখা ও উপ-শাখা)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isBranchRep
                  ? 'Manage and add field units under your branch (e.g., School Under the Sky, Night Shelter, Vocational Center).'
                  : 'Comprehensive directory of primary operational branches and dynamic sub-branches / units.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setTargetBranchId(currentUser.branchId || (branches[0]?.id ?? ''));
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Sub-Branch (নতুন উপ-শাখা যোগ করুন)</span>
        </button>
      </div>

      {/* Filter Bar */}
      {!isBranchRep && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search sub-branches by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs w-64 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Filter Branch:</span>
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
            >
              <option value="ALL">All Branches ({branches.length})</option>
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
                <span className="font-medium text-slate-300">Under: {sub.branchName}</span>
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
                  <Users className="w-3 h-3" /> In-Charge:
                </span>
                <span className="text-slate-200 font-semibold">{sub.inChargeName || 'Field Mobilizer'}</span>
              </div>
              {sub.phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone:
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">{sub.phone}</span>
                </div>
              )}
              {sub.inChargeStaffId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Staff ID:</span>
                  <span className="text-red-400 font-mono font-bold">{sub.inChargeStaffId}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

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
