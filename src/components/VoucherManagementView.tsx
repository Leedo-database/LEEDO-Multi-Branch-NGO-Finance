import React, { useState } from 'react';
import { TransactionVoucher, Branch, Project, User } from '../types';
import { 
  Search, Filter, Plus, Printer, Check, XCircle, 
  FileText, ArrowRightLeft, Image as ImageIcon, Building, Smartphone, ShoppingCart, ShieldCheck, DollarSign 
} from 'lucide-react';
import { BillInspectorModal } from './BillInspectorModal';

interface VoucherManagementViewProps {
  vouchers: TransactionVoucher[];
  branches: Branch[];
  projects: Project[];
  currentUser: User;
  onApproveVoucher: (id: string) => void;
  onRejectVoucher: (id: string, reason: string) => void;
  onOpenNewVoucher: () => void;
  onSelectPrintVoucher: (voucher: TransactionVoucher) => void;
  onOpenPayroll?: () => void;
}

export const VoucherManagementView: React.FC<VoucherManagementViewProps> = ({
  vouchers,
  branches,
  projects,
  currentUser,
  onApproveVoucher,
  onRejectVoucher,
  onOpenNewVoucher,
  onSelectPrintVoucher,
  onOpenPayroll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectingVoucher, setInspectingVoucher] = useState<TransactionVoucher | null>(null);
  const [rejectModalVoucherId, setRejectModalVoucherId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const isAccountsOrMgmt = currentUser.role === 'CENTRAL_ACCOUNTS' || currentUser.role === 'MANAGEMENT';

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = 
      v.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.vendorDetails && v.vendorDetails.vendorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.bankDetails && v.bankDetails.bankName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.projectName && v.projectName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === 'ALL' || v.type === selectedType;
    const matchesBranch = selectedBranch === 'ALL' || v.branchId === selectedBranch;
    const matchesCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;

    return matchesSearch && matchesType && matchesBranch && matchesCategory && matchesStatus;
  });

  const handleConfirmReject = () => {
    if (!rejectModalVoucherId || !rejectReason.trim()) return;
    onRejectVoucher(rejectModalVoucherId, rejectReason);
    setRejectModalVoucherId(null);
    setRejectReason('');
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'DONATION_INCOME': return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'ADVANCE_ADJUSTMENT': return 'text-amber-300 bg-amber-950/60 border-amber-600';
      case 'EXPENSE_PROCUREMENT': return 'text-red-400 bg-red-950/60 border-red-800';
      case 'BANK_TRANSFER': return 'text-blue-400 bg-blue-950/60 border-blue-800';
      case 'INTER_BRANCH_TRANSFER': return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'PETTY_CASH_FLOAT': return 'text-amber-400 bg-amber-950/60 border-amber-800';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Voucher Verification & Audit Hub</h1>
          <p className="text-sm text-slate-400 mt-1">
            দোকানের মেমো, বিল কপি ও ভাউচার যাচাই, স্টাফ বেতন ও বোনাস বিতরণ, ব্যাংক ট্রানজেকশন অডিট
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenPayroll && (
            <button
              onClick={onOpenPayroll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>বেতন ও বোনাস বিতরণ</span>
            </button>
          )}
          <button
            onClick={onOpenNewVoucher}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Voucher</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search voucher #, vendor, bank..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Voucher Types</option>
            <option value="EXPENSE_PROCUREMENT">Expense / Procurement</option>
            <option value="ADVANCE_ADJUSTMENT">Advance Adjustment (অগ্রিম সমন্বয়)</option>
            <option value="DONATION_INCOME">Donation / Income</option>
            <option value="BANK_TRANSFER">Bank-to-Bank Transfer</option>
            <option value="INTER_BRANCH_TRANSFER">Inter-Branch Transfer</option>
            <option value="PETTY_CASH_FLOAT">Petty Cash Float</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Categories</option>
            <option value="Program & Event Expense & Adjustment (প্রোগ্রাম বা ইভেন্ট খরচ ও সমন্বয়)">Event Expense & Adjustment (ইভেন্ট খরচ ও সমন্বয়)</option>
            <option value="Program & Event Advance / Requisition (প্রোগ্রাম বা ইভেন্ট অগ্রিম / রিকুইজিশন)">Event Advance (ইভেন্ট অগ্রিম)</option>
            <option value="Staff Salary & Monthly Payroll (কর্মীদের মাসিক বেতন)">Staff Salary (কর্মীদের বেতন)</option>
            <option value="Festival Bonus & Eid/Puja Allowance (উৎসব বোনাস ও ভাতা)">Festival Bonus (উৎসব বোনাস)</option>
            <option value="Staff Travel & Field Conveyance (ফিল্ড যাতায়াত ও কনভেন্স)">Field Conveyance (যাতায়াত ভাতা)</option>
            <option value="Rent (House / Shelter / Office)">Rent (ভাড়া খরচ)</option>
            <option value="Food & Nutrition (Rice, Dal, Oil, Vegetables)">Food & Nutrition (খাবার)</option>
            <option value="Electricity / Current Bill">Electricity / Current (বিদ্যুৎ)</option>
            <option value="Gas Bill / Cylinder">Gas Bill / Cylinder (গ্যাস)</option>
            <option value="Water & WASA">Water & WASA (পানি খরচ)</option>
            <option value="Logistics & Procurement (Kena-kata)">Logistics Kena-kata (কেনাকাটা)</option>
            <option value="Office & Administration Expenses">Office & Administration</option>
            <option value="Education & SUS School Materials">Education & SUS Materials</option>
            <option value="Medical & Emergency Child Treatment">Medical & Healthcare</option>
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            disabled={currentUser.role === 'BRANCH_REP'}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 disabled:opacity-60"
          >
            <option value="ALL">All Branches ({branches.length})</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted (Pending Audit)</option>
            <option value="APPROVED">Approved & Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold">
              <tr>
                <th className="py-3 px-3">Voucher # & Date</th>
                <th className="py-3 px-3">Type & Category</th>
                <th className="py-3 px-3">Particulars & Vendor Details</th>
                <th className="py-3 px-3">Branch & Payment Channel</th>
                <th className="py-3 px-3 text-right">Amount (BDT)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    No transaction vouchers found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredVouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Voucher Number & Date */}
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-white">{v.voucherNumber}</div>
                      <div className="text-[11px] text-slate-500">{v.date}</div>
                    </td>

                    {/* Type & Category */}
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded border ${getTypeBadgeClass(v.type)}`}>
                        {v.type.replace('_', ' ')}
                      </span>
                      <div className="text-[11px] font-semibold text-red-400 mt-1 max-w-[150px] truncate" title={v.category}>
                        {v.category}
                      </div>
                    </td>

                    {/* Title, Vendor, and Project */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-medium text-white line-clamp-1">{v.title}</div>
                      {v.vendorDetails && (
                        <div className="text-[11px] text-amber-300 mt-0.5 flex items-center gap-1">
                          <ShoppingCart className="w-3 h-3 text-amber-400" />
                          <span>Vendor: {v.vendorDetails.vendorName}</span>
                        </div>
                      )}
                      {/* Event Badge */}
                      {v.eventDetails?.eventName && (
                        <div className="text-[10px] text-purple-300 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40 inline-flex items-center gap-1 mt-0.5">
                          <span>🎪 {v.eventDetails.eventName}</span>
                          {v.eventDetails.venue && <span className="text-slate-400">({v.eventDetails.venue})</span>}
                        </div>
                      )}
                      {/* Advance Adjustment Badge */}
                      {v.advanceAdjustment && (
                        <div className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 flex items-center gap-1 mt-0.5">
                          <span>⚡ অগ্রিম সমন্বয়: Adv ৳{v.advanceAdjustment.advanceAmount.toLocaleString()} → Spent ৳{v.amount.toLocaleString()}</span>
                          {v.advanceAdjustment.balanceAmount > 0 && (
                            <span className={v.advanceAdjustment.adjustmentType === 'SURPLUS_RETURNED' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              ({v.advanceAdjustment.adjustmentType === 'SURPLUS_RETURNED' ? `ফেরত ৳${v.advanceAdjustment.balanceAmount.toLocaleString()}` : `দাবি ৳${v.advanceAdjustment.balanceAmount.toLocaleString()}`})
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {v.projectName ? (
                          <span className="text-emerald-400 font-medium">{v.projectName}</span>
                        ) : (
                          <span className="text-slate-500">General Operating Fund</span>
                        )}
                        {v.items && v.items.length > 0 && (
                          <span className="text-slate-500 ml-1">({v.items.length} items)</span>
                        )}
                      </div>
                    </td>

                    {/* Branch & Banking Details */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{v.branchName}</div>
                      {v.bankDetails && (
                        <div className="text-[10px] text-sky-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{v.bankDetails.bankName.split(' ')[0]} ({v.bankDetails.accountHolderName.split(' ')[0]})</span>
                        </div>
                      )}
                      {v.mfsDetails && (
                        <div className="text-[10px] text-pink-400 flex items-center gap-1 mt-0.5">
                          <Smartphone className="w-3 h-3" />
                          <span>{v.mfsDetails.provider} · {v.mfsDetails.accountNumber}</span>
                        </div>
                      )}
                      {v.fundSourceMethod === 'CASH' && (
                        <div className="text-[10px] text-slate-500 mt-0.5">Cash in Hand / Drawer</div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right">
                      <div className="font-mono font-bold text-sm text-white tabular-nums">
                        ৳ {v.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        By {v.createdBy.userName.split(' ')[0]} (ID: {v.createdBy.staffId})
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                        v.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        v.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {v.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {v.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingVoucher(v)}
                            title="দোকানের ক্যাশ মেমো / বিল কপি অডিট পরীক্ষণ (Inspect Shop Bill Copy)"
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg transition-colors cursor-pointer"
                          >
                            {v.receiptType === 'pdf' ? (
                              <FileText className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <ImageIcon className="w-3.5 h-3.5 text-red-400" />
                            )}
                            <span className="hidden sm:inline">দোকানের বিল</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectPrintVoucher(v)}
                          title="Print Thermal POS Receipt or A4 Statement"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {isAccountsOrMgmt && v.status === 'SUBMITTED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApproveVoucher(v.id)}
                              title="Audit & Approve Voucher"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950 rounded transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalVoucherId(v.id)}
                              title="Reject Voucher with Note"
                              className="p-1.5 text-rose-400 hover:bg-rose-950 rounded transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill & Cash Memo Audit Inspector Modal */}
      <BillInspectorModal
        voucher={inspectingVoucher}
        isOpen={Boolean(inspectingVoucher)}
        onClose={() => setInspectingVoucher(null)}
        onApprove={onApproveVoucher}
        onReject={onRejectVoucher}
        onPrint={onSelectPrintVoucher}
        canVerify={isAccountsOrMgmt}
      />

      {/* Reject Voucher Reason Modal */}
      {rejectModalVoucherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl overflow-hidden p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Audit Rejection Notice</h3>
            <p className="text-xs text-slate-400">
              Provide justification for rejecting this voucher. The branch coordinator will be notified.
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Missing supplier tax invoice, unit price exceeds approved procurement tariff..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalVoucherId(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
