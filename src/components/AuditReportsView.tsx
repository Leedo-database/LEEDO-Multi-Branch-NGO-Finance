import React, { useState } from 'react';
import { TransactionVoucher, Branch, Project, AuditLog } from '../types';
import { LeedoLogo } from './LeedoLogo';
import { 
  Download, Printer, Filter, Calendar, FileText, 
  CheckCircle2, Clock, ShieldAlert, ArrowDownRight, ArrowUpRight 
} from 'lucide-react';

interface AuditReportsViewProps {
  vouchers: TransactionVoucher[];
  branches: Branch[];
  projects: Project[];
  auditLogs: AuditLog[];
  onSelectPrintVoucher: (voucher: TransactionVoucher) => void;
}

export const AuditReportsView: React.FC<AuditReportsViewProps> = ({
  vouchers,
  branches,
  projects,
  auditLogs,
  onSelectPrintVoucher,
}) => {
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [reportTab, setReportTab] = useState<'STATEMENTS' | 'AUDIT_TRAIL'>('STATEMENTS');

  // Filter vouchers within date range and scope
  const filteredVouchers = vouchers.filter(v => {
    const isWithinDate = v.date >= startDate && v.date <= endDate;
    const matchesBranch = selectedBranchId === 'ALL' || v.branchId === selectedBranchId;
    const matchesProject = selectedProjectId === 'ALL' || v.projectId === selectedProjectId;
    return isWithinDate && matchesBranch && matchesProject;
  });

  const periodIncome = filteredVouchers
    .filter(v => v.type === 'DONATION_INCOME' && v.status === 'APPROVED')
    .reduce((acc, v) => acc + v.amount, 0);

  const periodExpense = filteredVouchers
    .filter(v => v.type === 'EXPENSE_PROCUREMENT' && v.status === 'APPROVED')
    .reduce((acc, v) => acc + v.amount, 0);

  const periodNet = periodIncome - periodExpense;

  const exportToCSV = () => {
    const headers = [
      'Voucher Number',
      'Date',
      'Type',
      'Branch',
      'Project',
      'Category',
      'Method',
      'Amount (BDT)',
      'Bank/MFS Info',
      'Vendor Info',
      'Status',
      'Prepared By (Staff ID)',
      'Approved By',
      'Notes'
    ];

    const rows = filteredVouchers.map(v => [
      `"${v.voucherNumber}"`,
      `"${v.date}"`,
      `"${v.type}"`,
      `"${v.branchName}"`,
      `"${v.projectName || 'General'}"`,
      `"${v.category}"`,
      `"${v.fundSourceMethod}"`,
      v.amount,
      `"${v.bankDetails ? `${v.bankDetails.bankName} - ${v.bankDetails.accountHolderName}` : (v.mfsDetails ? `${v.mfsDetails.provider} ${v.mfsDetails.accountNumber}` : 'N/A')}"`,
      `"${v.vendorDetails ? v.vendorDetails.vendorName : 'N/A'}"`,
      `"${v.status}"`,
      `"${v.createdBy.userName} (${v.createdBy.staffId})"`,
      `"${v.approvedBy?.userName || 'N/A'}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEEDO_Financial_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printStatement = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Audit Reports & Statutory Financial Statements
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Custom date-range statements, vendor transactions, CSV data exports & immutable staff audit trail logs
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setReportTab('STATEMENTS')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              reportTab === 'STATEMENTS' ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Financial Statement
          </button>
          <button
            onClick={() => setReportTab('AUDIT_TRAIL')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              reportTab === 'AUDIT_TRAIL' ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail Logs ({auditLogs.length})
          </button>
        </div>
      </div>

      {reportTab === 'STATEMENTS' ? (
        <div className="space-y-6">
          {/* Custom Date Range & Scope Controls */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Sub-Branch Scope</label>
                <select
                  value={selectedBranchId}
                  onChange={e => setSelectedBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="ALL">Overall LEEDO (All 8 Sub-Branches)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Project Earmark Filter</label>
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white focus:outline-none focus:border-red-500"
                >
                  <option value="ALL">All Projects & Operations</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Filtered: <strong className="text-white font-mono">{filteredVouchers.length} transactions</strong> between {startDate} and {endDate}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-sky-300 bg-sky-950/40 border border-sky-800 rounded-lg hover:bg-sky-900 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={printStatement}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-300 bg-red-950/40 border border-red-800 rounded-lg hover:bg-red-900 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Statement</span>
                </button>
              </div>
            </div>
          </div>

          {/* Statement Summary Callout Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Period Donor Inflow</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                ৳ {periodIncome.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Period Verified Outflow</span>
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-2">
                ৳ {periodExpense.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Net Period Cash Movement</span>
                <Clock className="w-4 h-4 text-sky-400" />
              </div>
              <div className={`text-2xl font-bold font-mono mt-2 ${periodNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ৳ {periodNet.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Printable Statement View Container */}
          <div className="bg-white text-slate-950 p-8 rounded-xl shadow-2xl border border-slate-200 printable-area">
            {/* Statement Header with Official Logo */}
            <div className="flex items-center justify-between border-b-2 border-red-700 pb-5 mb-6">
              <div className="flex items-center gap-4">
                <LeedoLogo size="lg" variant="stacked" />
                <div className="text-left">
                  <h2 className="text-2xl font-black text-red-600 tracking-tight leading-none">LEEDO</h2>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-1">
                    Local Education and Economic Development Organization
                  </p>
                  <p className="text-xs text-slate-500">
                    Govt. Reg # DHA-09281 | NGO Affairs Bureau FD-4 Compliance Statement
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-black text-slate-900 uppercase">
                  STATEMENT OF INCOME AND EXPENDITURE
                </p>
                <p className="text-xs font-mono text-slate-600 mt-0.5">
                  Period: {startDate} to {endDate}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Scope: {selectedBranchId === 'ALL' ? 'Overall LEEDO All 8 Sub-Branches' : branches.find(b => b.id === selectedBranchId)?.name}
                </p>
              </div>
            </div>

            {/* Statement Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Date</th>
                  <th className="p-2 border-r border-slate-300">Voucher #</th>
                  <th className="p-2 border-r border-slate-300">Particulars & Category</th>
                  <th className="p-2 border-r border-slate-300">Branch & Channel</th>
                  <th className="p-2 border-r border-slate-300">Vendor / Bank Details</th>
                  <th className="p-2 border-r border-slate-300 text-right">Income (BDT)</th>
                  <th className="p-2 text-right">Expenditure (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVouchers.map(v => {
                  const isIncome = v.type === 'DONATION_INCOME';
                  return (
                    <tr key={v.id}>
                      <td className="p-2 border-r border-slate-200 font-mono text-slate-600 whitespace-nowrap">{v.date}</td>
                      <td className="p-2 border-r border-slate-200 font-mono font-bold text-slate-800 whitespace-nowrap">{v.voucherNumber}</td>
                      <td className="p-2 border-r border-slate-200">
                        <div className="font-semibold text-slate-900">{v.title}</div>
                        <div className="text-[10px] text-red-700 font-medium">{v.category}</div>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-700">
                        <div className="font-medium">{v.branchName}</div>
                        <div className="text-[10px] text-slate-500">{v.fundSourceMethod}</div>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-slate-600 text-[11px]">
                        {v.vendorDetails ? (
                          <span className="font-medium text-slate-800">Vendor: {v.vendorDetails.vendorName}</span>
                        ) : v.bankDetails ? (
                          <span>Bank: {v.bankDetails.bankName} ({v.bankDetails.accountHolderName})</span>
                        ) : v.mfsDetails ? (
                          <span>MFS: {v.mfsDetails.provider} {v.mfsDetails.accountNumber}</span>
                        ) : (
                          'Direct / Cash'
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right font-mono font-semibold text-emerald-800 whitespace-nowrap">
                        {isIncome ? `৳ ${v.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-2 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                        {!isIncome ? `৳ ${v.amount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                <tr>
                  <td colSpan={5} className="p-2 text-right uppercase border-r border-slate-300">
                    Period Grand Totals:
                  </td>
                  <td className="p-2 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ৳ {periodIncome.toLocaleString()}
                  </td>
                  <td className="p-2 text-right font-mono text-slate-900">
                    ৳ {periodExpense.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Official Signatures with Exact Staff Names and IDs */}
            <div className="grid grid-cols-4 gap-4 pt-16 mt-8 border-t border-slate-300 text-center text-xs">
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">
                  Md. Habibur Rahman (1004)
                </div>
                <p className="text-slate-500">Accountant (Central Accounts)</p>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">
                  Sazzad Hosen (1079)
                </div>
                <p className="text-slate-500">Assistant Accountant</p>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">
                  Murshida Akhter Kanta (1002)
                </div>
                <p className="text-slate-500">Director - Admin & Finance</p>
              </div>
              <div>
                <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-800">
                  Forhad Hossain (1001)
                </div>
                <p className="text-slate-500">Founder & ED (Sanctioned)</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* IMMUTABLE AUDIT TRAIL LOGS */
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Immutable Financial Audit Trail
            </h2>
            <p className="text-xs text-slate-400">
              Full chronological record of staff actions with employee IDs and timestamps
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Staff ID & Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Entity Type & ID</th>
                  <th className="py-2.5 px-3">Audit Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <div className="text-white font-semibold font-sans">{log.userName}</div>
                      <div className="text-[10px] text-red-400 font-bold">Staff ID: {log.staffId}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans">{log.role}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        log.action === 'APPROVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        log.action === 'CREATE' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        log.action === 'REALLOCATE' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        log.action === 'PASSWORD_CHANGE' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-red-400">
                      {log.entityType}: {log.entityId}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-300 max-w-md">
                      <div>{log.description}</div>
                      {log.previousValue && log.newValue && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Change: <span className="line-through">{log.previousValue}</span> → <span className="text-emerald-400 font-bold">{log.newValue}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
