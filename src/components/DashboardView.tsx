import React from 'react';
import { Branch, Donor, Project, TransactionVoucher } from '../types';
import { 
  TrendingUp, TrendingDown, Clock, AlertTriangle, 
  ArrowUpRight, Calendar, Building2, CheckCircle2, ChevronRight,
  Flame, Zap, Home, Droplets, ShoppingBag, Briefcase, Utensils
} from 'lucide-react';

interface DashboardViewProps {
  branches: Branch[];
  projects: Project[];
  donors: Donor[];
  vouchers: TransactionVoucher[];
  onNavigateTab: (tab: string) => void;
  onOpenNewVoucher: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  branches,
  projects,
  donors,
  vouchers,
  onNavigateTab,
  onOpenNewVoucher,
}) => {
  // Aggregate calculations
  const totalIncome = vouchers
    .filter(v => v.type === 'DONATION_INCOME' && v.status === 'APPROVED')
    .reduce((acc, v) => acc + v.amount, 0);

  const totalExpense = vouchers
    .filter(v => v.type === 'EXPENSE_PROCUREMENT' && v.status === 'APPROVED')
    .reduce((acc, v) => acc + v.amount, 0);

  const totalBankBalance = branches.reduce((acc, b) => acc + b.bankBalance, 0);
  const totalPettyCashFloat = branches.reduce((acc, b) => acc + b.currentCashFloat, 0);
  const totalAllocatedBudget = projects.reduce((acc, p) => acc + p.totalBudget, 0);
  const totalSpentBudget = projects.reduce((acc, p) => acc + p.spentBudget, 0);

  // Category-wise expense breakdown (Rent, Food, Current, Gas, Water, Logistics, Office Admin)
  const categoryBreakdown = vouchers
    .filter(v => v.type === 'EXPENSE_PROCUREMENT' && v.status === 'APPROVED')
    .reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + v.amount;
      return acc;
    }, {} as Record<string, number>);

  // Method breakdown (Bank, Mobile Banking, Cash, Direct)
  const paymentMethodBreakdown = vouchers
    .filter(v => v.status === 'APPROVED')
    .reduce((acc, v) => {
      const key = (v.fundSourceMethod === 'MOBILE_BANKING' || v.fundSourceMethod === 'BKASH' || v.fundSourceMethod === 'NAGAD' || v.fundSourceMethod === 'ROCKET' || v.fundSourceMethod === 'UPAY') 
        ? 'Mobile Banking (bKash/Nagad/Rocket)'
        : v.fundSourceMethod;
      acc[key] = (acc[key] || 0) + v.amount;
      return acc;
    }, {} as Record<string, number>);

  const getDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date('2026-09-25');
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-8">
      {/* Editorial Page Lead */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">LEEDO Executive Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">
            Central Financial Health, Project Allocations & Liquidity across 8 Sub-Branches
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
          >
            Generate Financial Statement
          </button>
          <button
            onClick={onOpenNewVoucher}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            + Create Voucher
          </button>
        </div>
      </div>

      {/* 4 Main Core Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Donated Income */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Verified Donor Inflow</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            ৳ {totalIncome.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Grants & Donors</span>
            <span>·</span>
            <span>{vouchers.filter(v => v.type === 'DONATION_INCOME').length} Vouchers</span>
          </div>
        </div>

        {/* Metric 2: Total Spent Outflow */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Total Verified Spend</span>
            <TrendingDown className="w-4 h-4 text-red-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            ৳ {totalExpense.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Budget Burn: {Math.round((totalSpentBudget / (totalAllocatedBudget || 1)) * 100)}%</span>
            <span>·</span>
            <span className="text-emerald-400">Within Ceilings</span>
          </div>
        </div>

        {/* Metric 3: Branch Bank Reserves */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Sub-Branches Bank Balance</span>
            <Building2 className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-400 tabular-nums">
            ৳ {totalBankBalance.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>8 Sub-Branches</span>
            <span>·</span>
            <span>Central & Branch Banks</span>
          </div>
        </div>

        {/* Metric 4: Petty Cash Float in Hand */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Branch Petty Cash in Hand</span>
            <ArrowUpRight className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            ৳ {totalPettyCashFloat.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1.5">
            <span>Daily Drawer Floats</span>
            <span>·</span>
            <span className="text-amber-400">Reconciled Daily</span>
          </div>
        </div>
      </div>

      {/* CORE SPECIFIC EXPENSE CATEGORIES SUMMARY (Rent, Food, Current, Gas, Water, Logistics, Office Admin) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <h2 className="text-base font-bold text-white tracking-tight mb-1">
          Operational Expense Breakdown by Category (খরচের খাতভিত্তিক বিবরণ)
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Tracking shelter rents, food supplies, utilities (electricity, gas, water), logistics kena-kata, and office administration
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
          {[
            { label: 'Shelter / Office Rent (ভাড়া)', key: 'Rent (House / Shelter / Office)', icon: Home, color: 'text-indigo-400' },
            { label: 'Food & Nutrition (খাবার ও পুষ্টি)', key: 'Food & Nutrition (Rice, Dal, Oil, Vegetables)', icon: Utensils, color: 'text-emerald-400' },
            { label: 'Electricity / Current (বিদ্যুৎ)', key: 'Electricity / Current Bill', icon: Zap, color: 'text-yellow-400' },
            { label: 'Gas Bill & Cylinders (গ্যাস)', key: 'Gas Bill / Cylinder', icon: Flame, color: 'text-orange-400' },
            { label: 'Water & WASA (পানি খরচ)', key: 'Water & WASA', icon: Droplets, color: 'text-cyan-400' },
            { label: 'Logistics Kena-kata (কেনাকাটা)', key: 'Logistics & Procurement (Kena-kata)', icon: ShoppingBag, color: 'text-purple-400' },
            { label: 'Office & Admin (অফিস ও প্রশাসন)', key: 'Office & Administration Expenses', icon: Briefcase, color: 'text-blue-400' },
            { label: 'Education & SUS Materials', key: 'Education & SUS School Materials', icon: CheckCircle2, color: 'text-pink-400' },
          ].map(cat => {
            const Icon = cat.icon;
            const amt = categoryBreakdown[cat.key] || 0;
            return (
              <div key={cat.key} className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1">
                  <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                  <span className="truncate">{cat.label}</span>
                </div>
                <div className="text-base font-bold font-mono text-white tabular-nums">
                  ৳ {amt.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Project Budget Allocation vs Spend + Timeline Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project-Wise Breakdown (2 Columns) */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Projects: Spend vs. Allocated Budget</h2>
              <p className="text-xs text-slate-400">Expenditure tracking against donor grant ceilings</p>
            </div>
            <button
              onClick={() => onNavigateTab('projects')}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
            >
              <span>Manage Allocations</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {projects.map(project => {
              const percentage = Math.min(100, Math.round((project.spentBudget / project.totalBudget) * 100));
              const daysLeft = getDaysRemaining(project.endDate);
              const isUrgent = daysLeft <= 30 && project.status !== 'CLOSED';

              return (
                <div key={project.id} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{project.name}</span>
                        <span className="text-xs font-mono text-red-400 font-bold">{project.code}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span>Donor: {project.donorName}</span>
                        <span className="mx-1.5">·</span>
                        <span>{project.branchAllocations.length} Branches Assigned</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <div className="text-xs font-mono font-bold text-slate-200">
                        ৳ {project.spentBudget.toLocaleString()} / ৳ {project.totalBudget.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        <span>{percentage}% utilized</span>
                        {isUrgent && (
                          <span className="ml-1.5 text-amber-400 font-semibold">({daysLeft} days to closure)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Branch Allocation Tags */}
                  <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {project.branchAllocations.map(ba => (
                      <span key={ba.branchId} className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {ba.branchName.replace(' Branch', '')}: <span className="font-mono text-emerald-400">৳{ba.spentAmount.toLocaleString()}</span> / ৳{ba.allocatedAmount.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Timeline Tracker & Closing Alerts (1 Column) */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white tracking-tight">Timeline & Closing Alerts</h2>
            </div>

            <div className="space-y-3">
              {projects.map(p => {
                const days = getDaysRemaining(p.endDate);
                const isClosingSoon = days <= 30;

                return (
                  <div 
                    key={p.id}
                    className={`p-3 rounded-lg border text-xs ${
                      isClosingSoon 
                        ? 'bg-amber-950/20 border-amber-900/50 text-amber-200' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{p.code}</span>
                      {isClosingSoon ? (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          {days > 0 ? `${days} days left` : 'Deadline Ended'}
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono">{days} days</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.name}</div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>End Date: {p.endDate}</span>
                      <span>{p.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <h2 className="text-base font-bold text-white tracking-tight mb-3">Fund Channel Distribution</h2>
            <div className="space-y-2 text-xs">
              {Object.entries(paymentMethodBreakdown).map(([methodName, amt]) => (
                <div key={methodName} className="p-2 bg-slate-950/50 rounded border border-slate-800/80">
                  <div className="flex justify-between items-center text-slate-300">
                    <span className="truncate pr-2">{methodName}</span>
                    <span className="font-mono font-bold text-white whitespace-nowrap">৳ {amt.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 8 Sub-Branches Financial Analytics Table (Including Peace Home & Inclusive School) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              All 8 Sub-Branches: Liquidity & Spend Analytics
            </h2>
            <p className="text-xs text-slate-400">
              Airport, Mirpur, Tejgaon, Rayerbazar, Kamalapur (SUS & Shelter), Kadamtali (4 Units), Peace Home, and Inclusive School
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('branch-portal')}
            className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1"
          >
            <span>Switch to Branch Scope</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3">Sub-Branch</th>
                <th className="py-3 px-3">Contact Incharge & Sub-Units</th>
                <th className="py-3 px-3 text-right">Cash in Drawer</th>
                <th className="py-3 px-3 text-right">Bank Balance</th>
                <th className="py-3 px-3 text-right">Allocated</th>
                <th className="py-3 px-3 text-right">Total Spent</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {branches.map(branch => (
                <tr key={branch.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{branch.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{branch.code} · {branch.phone}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300 max-w-xs">
                    <div className="font-medium text-slate-200">{branch.contactPerson}</div>
                    {branch.subUnits && (
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {branch.subUnits.join(' · ')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-amber-400">
                    ৳ {branch.currentCashFloat.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-medium text-sky-400">
                    ৳ {branch.bankBalance.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    ৳ {branch.totalAllocated.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                    ৳ {branch.totalSpent.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
