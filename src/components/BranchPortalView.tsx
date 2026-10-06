import React, { useState } from 'react';
import { Branch, SubBranch, Project, TransactionVoucher, User, PettyCashRecord, FundRequest, Language } from '../types';
import { getTranslation } from '../services/i18n';
import { 
  Building2, Plus, Wallet, Shield, CheckCircle, 
  ArrowDownRight, Clock, AlertCircle, Send, Layers, Printer, FileText, Image as ImageIcon 
} from 'lucide-react';
import { BillInspectorModal } from './BillInspectorModal';

interface BranchPortalViewProps {
  currentUser: User;
  branches: Branch[];
  currentBranch: Branch | undefined;
  subBranches: SubBranch[];
  fundRequests: FundRequest[];
  branchProjects: Project[];
  branchVouchers: TransactionVoucher[];
  pettyCashLogs: PettyCashRecord[];
  onOpenNewVoucher: () => void;
  onRecordPettyCash: (record: Omit<PettyCashRecord, 'id'>) => void;
  onSelectPrintVoucher: (voucher: TransactionVoucher) => void;
  onNavigateTab: (tab: string) => void;
  language: Language;
}

export const BranchPortalView: React.FC<BranchPortalViewProps> = ({
  currentUser,
  branches,
  currentBranch,
  subBranches = [],
  fundRequests = [],
  branchProjects,
  branchVouchers,
  pettyCashLogs,
  onOpenNewVoucher,
  onRecordPettyCash,
  onSelectPrintVoucher,
  onNavigateTab,
  language,
}) => {
  const effectiveBranch = currentBranch || branches.find(b => b.id === 'br-kamalapur') || branches[0];
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Petty cash form state
  const [isPettyModalOpen, setIsPettyModalOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState(effectiveBranch?.currentCashFloat || 40000);
  const [receivedFloat, setReceivedFloat] = useState('');
  const [spentCash, setSpentCash] = useState('');
  const [pettyNotes, setPettyNotes] = useState('');
  const [inspectingBillVoucher, setInspectingBillVoucher] = useState<TransactionVoucher | null>(null);

  const totalReceived = Number(receivedFloat) || 0;
  const totalSpent = Number(spentCash) || 0;
  const closingBalance = Math.max(0, openingBalance + totalReceived - totalSpent);

  const handlePettySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveBranch) return;

    onRecordPettyCash({
      branchId: effectiveBranch.id,
      branchName: effectiveBranch.name,
      date: new Date().toISOString().substring(0, 10),
      openingBalance,
      totalReceived,
      totalSpent,
      closingBalance,
      reconciledBy: `${currentUser.name} (ID: ${currentUser.staffId})`,
      notes: pettyNotes || 'Daily petty cash imprest reconciliation',
    });

    setIsPettyModalOpen(false);
    setReceivedFloat('');
    setSpentCash('');
    setPettyNotes('');
  };

  const branchLogs = pettyCashLogs.filter(p => p.branchId === effectiveBranch?.id);

  return (
    <div className="space-y-6">
      {/* Branch Header with Staff ID & Sub-Units */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-500 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{effectiveBranch?.name}</h1>
                <span className="text-xs font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-800 font-bold">
                  {effectiveBranch?.code}
                </span>
                <span className="text-xs font-medium text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {language === 'bn' ? 'ইনচার্জ:' : 'Incharge:'} {currentUser.name} (ID: {currentUser.staffId})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{effectiveBranch?.address}</p>

              {/* Sub-Units Display */}
              {effectiveBranch?.subUnits && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {language === 'bn' ? 'শাখাধীন ইউনিটসমূহ:' : 'Branch Sub-Units:'}
                  </span>
                  {effectiveBranch.subUnits.map(unit => (
                    <span key={unit} className="text-[10px] font-medium bg-slate-950 border border-slate-700/80 text-amber-300 px-2.5 py-0.5 rounded-md">
                      {unit}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateTab('fund-requests')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-amber-400 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('actionNewFundRequest')}</span>
            </button>

            <button
              onClick={() => onNavigateTab('sub-branches')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t('navSubBranches')} ({subBranches.filter(s => s.branchId === effectiveBranch?.id).length})</span>
            </button>

            <button
              onClick={onOpenNewVoucher}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-md shadow-red-950/40 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('actionRecordExpense')}</span>
            </button>
          </div>
        </div>

        {/* 3 Liquidity Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{language === 'bn' ? 'হাতে নগদ পেটি ক্যাশ ফ্লোট' : 'Daily Petty Cash in Hand'}</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
              ৳ {effectiveBranch?.currentCashFloat.toLocaleString()}
            </div>
            <button
              onClick={() => {
                setOpeningBalance(effectiveBranch?.currentCashFloat || 0);
                setIsPettyModalOpen(true);
              }}
              className="mt-3 text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>+ {language === 'bn' ? 'দৈনিক ক্যাশ ফ্লোট আপডেট' : 'Reconcile Cash Float'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{language === 'bn' ? 'শাখার ব্যাংক হিসাবের ব্যালেন্স' : 'Branch Bank Account'}</span>
              <Building2 className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-2">
              ৳ {effectiveBranch?.bankBalance.toLocaleString()}
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              {language === 'bn' ? 'সেন্ট্রাল অ্যাকাউন্টস তত্ত্বাবধান' : 'Central Accounts Supervised'}
            </div>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>{language === 'bn' ? 'মোট পরিচালন ব্যয় (খরচ)' : 'Total Spent (Expenses)'}</span>
              <ArrowDownRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white mt-2">
              ৳ {effectiveBranch?.totalSpent.toLocaleString()}
            </div>
            <div className="mt-3 text-[11px] text-slate-400">
              {language === 'bn' ? 'বরাদ্দকৃত সীমা:' : 'Allocated Ceiling:'}{' '}
              <span className="font-mono text-slate-300">৳{effectiveBranch?.totalAllocated.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Projects Assigned to This Branch & Petty Cash Register */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects in This Branch */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-base font-bold text-white tracking-tight mb-1">
            {language === 'bn' ? `${effectiveBranch?.name}-এ বরাদ্দকৃত প্রজেক্টসমূহ` : `Projects Assigned to ${effectiveBranch?.name}`}
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            {language === 'bn' ? 'এই প্রজেক্টগুলোর অধীনে শাখা খরচ করতে পারবে।' : 'Active project allocations for this branch'}
          </p>

          <div className="space-y-3">
            {branchProjects.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                {language === 'bn' ? 'কোনো সক্রিয় প্রজেক্ট নেই।' : 'No active projects assigned to this center.'}
              </p>
            ) : (
              branchProjects.map(p => {
                const allocation = p.branchAllocations.find(ba => ba.branchId === effectiveBranch?.id);
                return (
                  <div key={p.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-white text-sm">{p.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">Donor: {p.donorName}</div>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-slate-900 px-2 py-0.5 rounded text-red-400 border border-slate-700">
                        {p.code}
                      </span>
                    </div>
                    {allocation && (
                      <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-xs font-mono">
                        <span className="text-slate-400">
                          {language === 'bn' ? 'বরাদ্দ:' : 'Ceiling:'} ৳{allocation.allocatedAmount.toLocaleString()}
                        </span>
                        <span className="text-emerald-400">
                          {language === 'bn' ? 'খরচ:' : 'Spent:'} ৳{allocation.spentAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Daily Petty Cash Imprest Register */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {language === 'bn' ? 'দৈনিক পেটি ক্যাশ রেজিস্টার' : 'Petty Cash Daily Reconciliations'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'শাখা ইনচার্জ কর্তৃক ক্যাশবক্স হিসাব' : 'Daily cash float reconciliation logs'}
              </p>
            </div>
            <button
              onClick={() => {
                setOpeningBalance(effectiveBranch?.currentCashFloat || 0);
                setIsPettyModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-red-400 border border-red-800/40 rounded-lg cursor-pointer"
            >
              + {language === 'bn' ? 'নতুন রিকনসিল' : 'New Log'}
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
            {branchLogs.length === 0 ? (
              <p className="text-slate-500 py-6 text-center">
                {language === 'bn' ? 'কোনো পেটি ক্যাশ লগ নেই।' : 'No petty cash records logged yet.'}
              </p>
            ) : (
              branchLogs.map(l => (
                <div key={l.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center font-mono">
                    <span className="text-slate-400">{l.date}</span>
                    <span className="text-amber-400 font-bold">Closing: ৳{l.closingBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Opening: ৳{l.openingBalance.toLocaleString()}</span>
                    <span>Received: +৳{l.totalReceived.toLocaleString()}</span>
                    <span>Spent: -৳{l.totalSpent.toLocaleString()}</span>
                  </div>
                  {l.notes && <div className="text-[11px] text-slate-400 italic mt-1">"{l.notes}"</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Strictly Branch Expense Ledger (Vouchers) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {language === 'bn' ? `${effectiveBranch?.name}-এর খরচের ভাউচার লেজার` : `${effectiveBranch?.name} Expense Voucher Ledger`}
            </h2>
            <p className="text-xs text-slate-400">
              {language === 'bn' ? 'শাখা প্রতিনিধি শুধু খরচ এন্ট্রি করতে পারবেন এবং অ্যাকাউন্টস তা অনুমোদন করবে।' : 'Branch expenses audited and verified by Accounts'}
            </p>
          </div>

          <button
            onClick={onOpenNewVoucher}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('actionRecordExpense')}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Voucher #</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Particulars</th>
                <th className="py-2.5 px-3">Project</th>
                <th className="py-2.5 px-3 text-right">Amount (BDT)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {branchVouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    {language === 'bn' ? 'এই শাখার কোনো খরচের ভাউচার নেই।' : 'No expense vouchers logged for this branch.'}
                  </td>
                </tr>
              ) : (
                branchVouchers.map(v => (
                  <tr key={v.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-mono font-bold text-red-400">{v.voucherNumber}</td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{v.date}</td>
                    <td className="py-3 px-3 text-slate-300 font-medium">{v.category}</td>
                    <td className="py-3 px-3 text-slate-200">
                      <div>{v.title}</div>
                      {v.subBranchName && (
                        <div className="text-[10px] text-amber-400 font-medium">📍 {v.subBranchName}</div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{v.projectName || 'Core Ops'}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      ৳ {v.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        v.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                        'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {v.status === 'APPROVED' ? (language === 'bn' ? 'অ্যাকাউন্টস অনুমোদিত' : 'Approved') :
                         v.status === 'SUBMITTED' ? (language === 'bn' ? 'অ্যাকাউন্টস যাচাই বাকি' : 'Submitted') :
                         v.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {v.receiptUrl && (
                          <button
                            type="button"
                            onClick={() => setInspectingBillVoucher(v)}
                            title="দোকানের বিল কপি দেখুন (View Attached Bill/Memo)"
                            className="px-2 py-1 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800 rounded text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ImageIcon className="w-3 h-3" />
                            <span>বিল</span>
                          </button>
                        )}
                        <button
                          onClick={() => onSelectPrintVoucher(v)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          <Printer className="w-3 h-3 inline mr-1" />
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Petty Cash Modal */}
      {isPettyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-1">
              {language === 'bn' ? 'দৈনিক ক্যাশ ফ্লোট রিকনসিলিয়েশন' : 'Daily Petty Cash Float Reconciliation'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{effectiveBranch?.name}</p>

            <form onSubmit={handlePettySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'প্রারম্ভিক ব্যালেন্স (Opening Balance)' : 'Opening Balance (BDT)'} *
                </label>
                <input
                  type="number"
                  required
                  value={openingBalance}
                  onChange={e => setOpeningBalance(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'আজ গৃহীত নতুন ক্যাশ ফ্লোট (Cash In)' : 'Cash Received / Replenished (BDT)'}
                </label>
                <input
                  type="number"
                  value={receivedFloat}
                  onChange={e => setReceivedFloat(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'আজকের মোট ক্যাশ খরচ (Total Cash Out)' : 'Cash Spent Today (BDT)'}
                </label>
                <input
                  type="number"
                  value={spentCash}
                  onChange={e => setSpentCash(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">
                  {language === 'bn' ? 'সমাপনী ব্যালেন্স (Closing Float):' : 'Closing Balance:'}
                </span>
                <span className="text-amber-400 font-mono font-black text-sm">৳ {closingBalance.toLocaleString()}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'নোট / মন্তব্য' : 'Reconciliation Notes'}
                </label>
                <textarea
                  rows={2}
                  value={pettyNotes}
                  onChange={e => setPettyNotes(e.target.value)}
                  placeholder="e.g. Daily dinner purchase, transport for rescue team"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPettyModalOpen(false)}
                  className="px-3 py-1.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg cursor-pointer"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill & Memo Viewer */}
      <BillInspectorModal
        voucher={inspectingBillVoucher}
        isOpen={Boolean(inspectingBillVoucher)}
        onClose={() => setInspectingBillVoucher(null)}
        onPrint={onSelectPrintVoucher}
        canVerify={false}
        language={language}
      />
    </div>
  );
};
