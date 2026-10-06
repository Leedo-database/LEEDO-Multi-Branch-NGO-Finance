import React, { useState } from 'react';
import { Project, Branch, Donor, User, ProjectBranchAllocation } from '../types';
import { 
  FolderPlus, Edit3, CheckCircle, AlertCircle, 
  Building, Calendar, DollarSign, Plus, X 
} from 'lucide-react';

interface ProjectBudgetsViewProps {
  projects: Project[];
  branches: Branch[];
  donors: Donor[];
  currentUser: User;
  onCreateProject: (project: Omit<Project, 'id' | 'spentBudget'>) => void;
  onReallocateBudget: (projectId: string, allocations: ProjectBranchAllocation[], totalBudget: number, notes: string) => void;
  onCloseProject: (projectId: string, notes: string) => void;
  onAddBranch: (branchData: Omit<Branch, 'id' | 'totalSpent' | 'activeProjectsCount' | 'currentCashFloat'> & { initialCashFloat: number }) => void;
}

export const ProjectBudgetsView: React.FC<ProjectBudgetsViewProps> = ({
  projects,
  branches,
  donors,
  currentUser,
  onCreateProject,
  onReallocateBudget,
  onCloseProject,
  onAddBranch,
}) => {
  const isAccountsOrMgmt = currentUser.role === 'CENTRAL_ACCOUNTS' || currentUser.role === 'MANAGEMENT';

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [reallocateProject, setReallocateProject] = useState<Project | null>(null);
  const [closingProject, setClosingProject] = useState<Project | null>(null);
  const [reconciliationNotes, setReconciliationNotes] = useState('');

  const [editingAllocations, setEditingAllocations] = useState<ProjectBranchAllocation[]>([]);
  const [reallocateNotes, setReallocateNotes] = useState('');

  const [newProjName, setNewProjName] = useState('');
  const [newProjCode, setNewProjCode] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjDonorId, setNewProjDonorId] = useState(donors[0]?.id || '');
  const [newProjCategory, setNewProjCategory] = useState<Project['primaryCategory']>('FOOD_SHELTER');
  const [newProjStartDate, setNewProjStartDate] = useState('2026-09-01');
  const [newProjEndDate, setNewProjEndDate] = useState('2027-08-31');
  const [branchAllocationInputs, setBranchAllocationInputs] = useState<Record<string, number>>({});

  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchContact, setNewBranchContact] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchBankBal, setNewBranchBankBal] = useState(100000);
  const [newBranchCashFloat, setNewBranchCashFloat] = useState(25000);

  const openReallocateModal = (project: Project) => {
    setReallocateProject(project);
    setEditingAllocations(JSON.parse(JSON.stringify(project.branchAllocations)));
    setReallocateNotes('');
  };

  const handleUpdateAllocation = (branchId: string, amount: number) => {
    setEditingAllocations(prev => prev.map(a => a.branchId === branchId ? { ...a, allocatedAmount: Math.max(a.spentAmount, amount) } : a));
  };

  const handleSaveReallocation = () => {
    if (!reallocateProject) return;
    const newTotal = editingAllocations.reduce((acc, a) => acc + a.allocatedAmount, 0);
    onReallocateBudget(reallocateProject.id, editingAllocations, newTotal, reallocateNotes);
    setReallocateProject(null);
  };

  const handleConfirmCloseProject = () => {
    if (!closingProject) return;
    onCloseProject(closingProject.id, reconciliationNotes);
    setClosingProject(null);
    setReconciliationNotes('');
  };

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donor = donors.find(d => d.id === newProjDonorId);
    const assignedBranches: ProjectBranchAllocation[] = [];

    Object.entries(branchAllocationInputs).forEach(([bId, amt]) => {
      if (amt > 0) {
        const branchObj = branches.find(b => b.id === bId);
        assignedBranches.push({
          branchId: bId,
          branchName: branchObj?.name || 'Branch',
          allocatedAmount: amt,
          spentAmount: 0,
        });
      }
    });

    if (assignedBranches.length === 0) {
      alert('Please allocate budget to at least one branch.');
      return;
    }

    const totalBudget = assignedBranches.reduce((acc, a) => acc + a.allocatedAmount, 0);

    onCreateProject({
      name: newProjName,
      code: newProjCode || `PRJ-${newProjName.substring(0, 4).toUpperCase()}`,
      description: newProjDesc,
      donorId: newProjDonorId,
      donorName: donor?.name || 'LEEDO Donor',
      primaryCategory: newProjCategory,
      targetBranchIds: assignedBranches.map(a => a.branchId),
      totalBudget,
      startDate: newProjStartDate,
      endDate: newProjEndDate,
      status: 'ACTIVE',
      branchAllocations: assignedBranches,
    });

    setIsNewProjectModalOpen(false);
    setNewProjName('');
    setNewProjCode('');
    setNewProjDesc('');
    setBranchAllocationInputs({});
  };

  const handleCreateBranchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBranch({
      name: newBranchName,
      code: newBranchCode || `BR-${newBranchName.substring(0, 3).toUpperCase()}`,
      address: newBranchAddress,
      contactPerson: newBranchContact,
      phone: newBranchPhone,
      bankBalance: Number(newBranchBankBal),
      initialCashFloat: Number(newBranchCashFloat),
      totalAllocated: 0,
      status: 'ACTIVE',
    });

    setIsAddBranchModalOpen(false);
    setNewBranchName('');
    setNewBranchCode('');
    setNewBranchAddress('');
    setNewBranchContact('');
    setNewBranchPhone('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Mother Account & Dynamic Project Allocations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Head Office central fund management, branch-wise dynamic budget distribution across 8 sub-branches
          </p>
        </div>

        {isAccountsOrMgmt && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddBranchModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              + Add Sub-Branch
            </button>
            <button
              onClick={() => setIsNewProjectModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Project Allocation</span>
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map(project => {
          const isClosed = project.status === 'CLOSED';
          const remainingBudget = Math.max(0, project.totalBudget - project.spentBudget);
          const percentUsed = Math.min(100, Math.round((project.spentBudget / project.totalBudget) * 100));

          return (
            <div 
              key={project.id} 
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                isClosed 
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-75' 
                  : 'bg-slate-900/90 border-slate-800 shadow-xl hover:border-slate-700'
              }`}
            >
              <div>
                {/* Project Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800">
                        {project.code}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        project.status === 'ACTIVE' ? 'bg-emerald-900/40 text-emerald-300' :
                        project.status === 'CLOSING_SOON' ? 'bg-amber-900/40 text-amber-300' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-2 tracking-tight">{project.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  </div>
                </div>

                {/* Donor & Timeline Meta */}
                <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500">Funded By:</span>
                    <div className="font-semibold text-slate-200 truncate">{project.donorName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Timeline / Closure:</span>
                    <div className="font-mono text-slate-300">{project.startDate} to {project.endDate}</div>
                  </div>
                </div>

                {/* Overall Budget Progress */}
                <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Total Project Ceiling:</span>
                    <span className="font-mono font-bold text-white text-sm">৳ {project.totalBudget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${percentUsed > 90 ? 'bg-red-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400">
                    <span>Spent: ৳{project.spentBudget.toLocaleString()} ({percentUsed}%)</span>
                    <span>Remaining: ৳{remainingBudget.toLocaleString()}</span>
                  </div>
                </div>

                {/* Dynamic Branch Allocations Breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Branch-Wise Dynamic Allocations:
                  </div>
                  <div className="divide-y divide-slate-800/60 bg-slate-950/50 rounded-lg border border-slate-800 overflow-hidden text-xs">
                    {project.branchAllocations.map(ba => {
                      const branchPct = Math.round((ba.spentAmount / (ba.allocatedAmount || 1)) * 100);
                      return (
                        <div key={ba.branchId} className="p-2.5 flex items-center justify-between">
                          <div>
                            <span className="font-medium text-white">{ba.branchName}</span>
                            <div className="text-[10px] text-slate-500">
                              Burn: {branchPct}% of allocation
                            </div>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-emerald-400 font-semibold">৳{ba.spentAmount.toLocaleString()}</span>
                            <span className="text-slate-500 mx-1">/</span>
                            <span className="text-slate-200">৳{ba.allocatedAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reconciliation Notes */}
                {project.reconciliationNotes && (
                  <div className="mt-4 p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs text-amber-300">
                    <span className="font-bold">Reconciliation Statement: </span>
                    {project.reconciliationNotes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isAccountsOrMgmt && !isClosed && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                  <button
                    onClick={() => openReallocateModal(project)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-red-400" />
                    <span>Re-allocate Budgets</span>
                  </button>
                  <button
                    onClick={() => setClosingProject(project)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-300 hover:text-white bg-red-950/50 hover:bg-red-900 border border-red-800/80 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Close Project</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* RE-ALLOCATE BUDGET MODAL */}
      {reallocateProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-lg w-full rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Re-allocate Project Budgets</h3>
                <p className="text-xs text-slate-400">{reallocateProject.name} ({reallocateProject.code})</p>
              </div>
              <button onClick={() => setReallocateProject(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300">
              Adjust branch budget ceilings dynamically. Allocated amount cannot be reduced below already spent funds.
            </p>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {editingAllocations.map(ba => (
                <div key={ba.branchId} className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-white">{ba.branchName}</span>
                    <span className="text-slate-400">Already Spent: ৳{ba.spentAmount.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 font-bold">৳</span>
                    <input
                      type="number"
                      min={ba.spentAmount}
                      value={ba.allocatedAmount}
                      onChange={e => handleUpdateAllocation(ba.branchId, Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-3 pl-8 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Reason / Audit Justification Note</label>
              <textarea
                rows={2}
                value={reallocateNotes}
                onChange={e => setReallocateNotes(e.target.value)}
                placeholder="e.g. Surge in shelter child intake requires shifting ৳50,000 from Tejgaon to Kamalapur..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                New Total Budget: <strong className="font-mono text-emerald-400">৳{editingAllocations.reduce((a, b) => a + b.allocatedAmount, 0).toLocaleString()}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setReallocateProject(null)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveReallocation}
                  className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg"
                >
                  Apply Re-allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CLOSE PROJECT RECONCILIATION MODAL */}
      {closingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Close Project & Final Reconciliation</h3>
            <p className="text-xs text-slate-400">
              Closing <strong>{closingProject.name}</strong> will lock all budget lines and prevent further expense vouchers from being submitted against this code.
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Original Allocated Budget:</span>
                <span className="font-mono text-white">৳ {closingProject.totalBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Actually Spent:</span>
                <span className="font-mono text-emerald-400">৳ {closingProject.spentBudget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-800">
                <span className="text-slate-300">Unspent Balance to Return to Donor:</span>
                <span className="font-mono text-amber-400">৳ {(closingProject.totalBudget - closingProject.spentBudget).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Final Reconciliation Audit Report</label>
              <textarea
                rows={3}
                required
                value={reconciliationNotes}
                onChange={e => setReconciliationNotes(e.target.value)}
                placeholder="Detail final beneficiary count, procurement audit sign-off, and refund reference to donor account..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setClosingProject(null)}
                className="px-3 py-1.5 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCloseProject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg"
              >
                Confirm Project Closure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PROJECT MODAL */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 max-w-2xl w-full rounded-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create New Project Allocation</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjName}
                    onChange={e => setNewProjName(e.target.value)}
                    placeholder="e.g. Winter Warmth & Shelter Food Drive"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Project Code</label>
                  <input
                    type="text"
                    required
                    value={newProjCode}
                    onChange={e => setNewProjCode(e.target.value)}
                    placeholder="e.g. PRJ-WINT-26"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Fund Donor</label>
                  <select
                    value={newProjDonorId}
                    onChange={e => setNewProjDonorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    {donors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Intervention Category</label>
                  <select
                    value={newProjCategory}
                    onChange={e => setNewProjCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  >
                    <option value="FOOD_SHELTER">Food & Shelter Support</option>
                    <option value="CLOTHES_FOOD">Clothes & Food Relief</option>
                    <option value="EDUCATION">Education & Recreation</option>
                    <option value="EMERGENCY">Emergency Child Rehabilitation</option>
                    <option value="HEALTHCARE">Healthcare & Medicine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newProjStartDate}
                    onChange={e => setNewProjStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Completion Deadline</label>
                  <input
                    type="date"
                    required
                    value={newProjEndDate}
                    onChange={e => setNewProjEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Project Scope & Beneficiaries Description</label>
                <textarea
                  rows={2}
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  placeholder="Target street children count, center locations, meal specifications..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              {/* Branch Allocations Table */}
              <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60">
                <label className="block text-red-400 font-semibold mb-2">
                  Assign Budgets per Sub-Branch Center (BDT):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {branches.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-2 bg-slate-900 border border-slate-800 rounded">
                      <span className="font-medium text-slate-200">{b.name}</span>
                      <div className="w-32">
                        <input
                          type="number"
                          placeholder="0"
                          min="0"
                          value={branchAllocationInputs[b.id] || ''}
                          onChange={e => setBranchAllocationInputs({ ...branchAllocationInputs, [b.id]: Number(e.target.value) })}
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono text-emerald-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg"
                >
                  Save Project Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SUB-BRANCH MODAL */}
      {isAddBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Dynamic Sub-Branch Center</h3>
              <button onClick={() => setIsAddBranchModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateBranchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Branch Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shadarghat Terminal Branch"
                  value={newBranchName}
                  onChange={e => setNewBranchName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Branch Code</label>
                  <input
                    type="text"
                    required
                    placeholder="BR-SAD"
                    value={newBranchCode}
                    onChange={e => setNewBranchCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+880 1711-..."
                    value={newBranchPhone}
                    onChange={e => setNewBranchPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Branch Coordinator / Contact Person</label>
                <input
                  type="text"
                  required
                  placeholder="Full name of branch accounts officer"
                  value={newBranchContact}
                  onChange={e => setNewBranchContact(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Physical Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street / area location"
                  value={newBranchAddress}
                  onChange={e => setNewBranchAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opening Bank Balance</label>
                  <input
                    type="number"
                    min="0"
                    value={newBranchBankBal}
                    onChange={e => setNewBranchBankBal(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Opening Cash Float</label>
                  <input
                    type="number"
                    min="0"
                    value={newBranchCashFloat}
                    onChange={e => setNewBranchCashFloat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddBranchModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg"
                >
                  Register Sub-Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
