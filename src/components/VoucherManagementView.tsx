import React, { useState } from 'react';
import { TransactionVoucher, Branch, Project, User } from '../types';
import { 
  Search, Plus, Printer, Check, XCircle, Edit3, Trash2,
  FileText, Image as ImageIcon, Building, Smartphone, ShoppingCart, DollarSign, X, AlertTriangle 
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
  onEditVoucher?: (voucherId: string, updatedData: Partial<TransactionVoucher>) => { success: boolean; message: string };
  onDeleteVoucher?: (voucherId: string) => { success: boolean; message: string };
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
  onEditVoucher,
  onDeleteVoucher,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [inspectingVoucher, setInspectingVoucher] = useState<TransactionVoucher | null>(null);
  const [rejectModalVoucherId, setRejectModalVoucherId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Edit Voucher Modal State
  const [editingVoucher, setEditingVoucher] = useState<TransactionVoucher | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDate, setEditDate] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editAlert, setEditAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete Voucher Modal State
  const [deletingVoucher, setDeletingVoucher] = useState<TransactionVoucher | null>(null);

  const isSuperAdminOrKanta = currentUser.role === 'SUPER_ADMIN' || currentUser.staffId === '1002';
  const isAccountsOrMgmt = currentUser.role === 'CENTRAL_ACCOUNTS' || currentUser.role === 'MANAGEMENT' || isSuperAdminOrKanta;

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

  const handleOpenEdit = (v: TransactionVoucher) => {
    setEditingVoucher(v);
    setEditTitle(v.title);
    setEditAmount(v.amount);
    setEditDate(v.date);
    setEditCategory(v.category);
    setEditNotes(v.notes || '');
    setEditAlert(null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVoucher || !onEditVoucher) return;

    if (!editTitle.trim()) {
      setEditAlert({ type: 'error', text: 'অনুগ্রহ করে ভাউচারের বিবরণ লিখুন।' });
      return;
    }
    if (editAmount <= 0) {
      setEditAlert({ type: 'error', text: 'টাকার পরিমাণ শূন্যের বেশি হতে হবে।' });
      return;
    }

    const res = onEditVoucher(editingVoucher.id, {
      title: editTitle.trim(),
      amount: editAmount,
      date: editDate,
      category: editCategory,
      notes: editNotes.trim(),
    });

    if (res.success) {
      setEditAlert({ type: 'success', text: res.message });
      setTimeout(() => {
        setEditingVoucher(null);
        setEditAlert(null);
      }, 1000);
    } else {
      setEditAlert({ type: 'error', text: res.message });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingVoucher || !onDeleteVoucher) return;
    onDeleteVoucher(deletingVoucher.id);
    setDeletingVoucher(null);
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
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Voucher Verification & Audit Hub</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            দোকানের মেমো, বিল কপি ও ভাউচার যাচাই, ভুল হলে সংশোধন বা ডিলিট, বেতন ও ব্যাংক ট্রানজেকশন অডিট
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {onOpenPayroll && (
            <button
              onClick={onOpenPayroll}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl shadow-sm transition-all whitespace-nowrap cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>বেতন ও বোনাস বিতরণ</span>
            </button>
          )}
          {/* Consolidated Single Voucher Button */}
          <button
            onClick={onOpenNewVoucher}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-900/30 transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ভাউচার (New Voucher)</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search voucher #, vendor, bank..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="EXPENSE_PROCUREMENT">Expense & Procurement</option>
            <option value="ADVANCE_ADJUSTMENT">Advance Adjustment (অগ্রিম সমন্বয়)</option>
            <option value="DONATION_INCOME">Donation & Grant Income</option>
            <option value="BANK_TRANSFER">Bank Fund Transfer</option>
            <option value="PETTY_CASH_FLOAT">Petty Cash Float</option>
            <option value="INTER_BRANCH_TRANSFER">Inter-Branch Transfer</option>
          </select>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Branches & Zones</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Pending Verification</option>
            <option value="APPROVED">Audited & Approved</option>
            <option value="REJECTED">Audit Rejected</option>
          </select>

          {/* Summary Count */}
          <div className="flex items-center justify-between sm:justify-end px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono">
            <span>Filtered:</span>
            <span className="font-bold text-white ml-1">{filteredVouchers.length} Vouchers</span>
          </div>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-3">Voucher # / Date</th>
                <th className="py-3 px-3">Type & Category</th>
                <th className="py-3 px-3">Details / Project / Event</th>
                <th className="py-3 px-3">Branch & Bank</th>
                <th className="py-3 px-3 text-right">Amount (BDT)</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredVouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    কোনো ভাউচার পাওয়া যায়নি (No transaction vouchers found).
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
                      {/* Advance Adjustment Badge */}
                      {v.advanceAdjustment && (
                        <div className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 flex items-center gap-1 mt-0.5">
                          <span>⚡ অগ্রিম সমন্বয়: Adv ৳{v.advanceAdjustment.advanceAmount.toLocaleString()} → Spent ৳{v.amount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {v.projectName ? (
                          <span className="text-emerald-400 font-medium">{v.projectName}</span>
                        ) : (
                          <span className="text-slate-500">General Operating Fund</span>
                        )}
                      </div>
                    </td>

                    {/* Branch & Banking Details */}
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200">{v.branchName}</div>
                      {v.bankDetails && (
                        <div className="text-[10px] text-sky-400 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          <span>{v.bankDetails.bankName.split(' ')[0]}</span>
                        </div>
                      )}
                      {v.mfsDetails && (
                        <div className="text-[10px] text-pink-400 flex items-center gap-1 mt-0.5">
                          <Smartphone className="w-3 h-3" />
                          <span>{v.mfsDetails.provider} · {v.mfsDetails.accountNumber}</span>
                        </div>
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
                        {/* Inspect Shop Bill */}
                        {v.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingVoucher(v)}
                            title="দোকানের ক্যাশ মেমো / বিল কপি অডিট পরীক্ষণ (Inspect Shop Bill Copy)"
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden sm:inline">দোকানের বিল</span>
                          </button>
                        )}

                        {/* Print Thermal / Statement */}
                        <button
                          type="button"
                          onClick={() => onSelectPrintVoucher(v)}
                          title="Print Thermal POS Receipt or A4 Statement"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Voucher (Kono data vul hole edit kora) */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(v)}
                          title="ভাউচারের তথ্য বা টাকা সংশোধন (Edit Voucher)"
                          className="p-1.5 text-sky-400 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Voucher (Kono data vul hole delete kora) */}
                        {isAccountsOrMgmt && (
                          <button
                            type="button"
                            onClick={() => setDeletingVoucher(v)}
                            title="ভাউচার বাতিল বা ডিলিট করুন (Delete Voucher)"
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Approve / Reject for Accounts & Management */}
                        {isAccountsOrMgmt && v.status === 'SUBMITTED' && (
                          <>
                            <button
                              type="button"
                              onClick={() => onApproveVoucher(v.id)}
                              title="Audit & Approve Voucher"
                              className="p-1.5 text-emerald-400 hover:bg-emerald-950 rounded-lg transition-colors cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRejectModalVoucherId(v.id)}
                              title="Reject Voucher with Note"
                              className="p-1.5 text-rose-400 hover:bg-rose-950 rounded-lg transition-colors cursor-pointer"
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

      {/* Edit Voucher Modal */}
      {editingVoucher && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4">
          <div className="min-h-full flex items-start sm:items-center justify-center py-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto relative">
              <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-sky-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">ভাউচার সংশোধন (Edit Voucher)</h3>
                    <p className="text-xs text-slate-400 font-mono">{editingVoucher.voucherNumber}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingVoucher(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {editAlert && (
                <div className={`m-4 p-3 rounded-xl text-xs ${
                  editAlert.type === 'success' 
                    ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-200' 
                    : 'bg-rose-950/80 border border-rose-800 text-rose-200'
                }`}>
                  {editAlert.text}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="p-5 sm:p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    খরচের শিরোনাম / বিবরণ *
                  </label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      টাকার পরিমাণ (BDT) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editAmount}
                      onChange={e => setEditAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      তারিখ *
                    </label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    ক্যাটাগরি
                  </label>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    অডিট ও অ্যাকাউন্টিং নোট
                  </label>
                  <textarea
                    rows={2}
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    placeholder="সংশোধনের কারণ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingVoucher(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    পরিবর্তন সেভ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 max-w-md w-full rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-bold text-white">ভাউচার ডিলিট নিশ্চিতকরণ</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিত যে ভাউচার <strong className="text-white font-mono">{deletingVoucher.voucherNumber}</strong> (৳{deletingVoucher.amount.toLocaleString()}) ডিলিট করতে চান?
            </p>
            <p className="text-[11px] text-amber-300 bg-amber-950/50 p-2.5 rounded-lg border border-amber-900/50">
              ⚠️ এটি ডিলিট করলে লেজার হিসাব ও ক্যাশ ফ্লোট থেকে এই টাকার প্রভাব স্বয়ংক্রিয়ভাবে বাদ হয়ে যাবে এবং ক্লাউড থেকে মুছে যাবে।
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingVoucher(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-900/40 cursor-pointer"
              >
                হ্যাঁ, ডিলিট করুন
              </button>
            </div>
          </div>
        </div>
      )}

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
