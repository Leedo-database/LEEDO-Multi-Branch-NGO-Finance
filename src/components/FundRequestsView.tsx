import React, { useState } from 'react';
import { 
  FundRequest, Branch, SubBranch, Project, User, ExpenseCategory, FundSourceMethod, BankDetails, MfsDetails, Language 
} from '../types';
import { getTranslation } from '../services/i18n';
import { 
  Plus, CheckCircle2, Clock, XCircle, Building2, Send, 
  Wallet, Landmark, Smartphone, X, ShieldAlert, Sparkles, UserCheck, ShieldCheck 
} from 'lucide-react';

interface FundRequestsViewProps {
  fundRequests: FundRequest[];
  branches: Branch[];
  subBranches: SubBranch[];
  projects: Project[];
  currentUser: User;
  language: Language;
  isBranchRep: boolean;
  isCentralAccounts: boolean;
  isManagement: boolean;
  onAddFundRequest: (data: {
    branchId: string;
    subBranchId?: string;
    projectId?: string;
    category: ExpenseCategory | string;
    amount: number;
    purpose: string;
    urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
    preferredPaymentMethod: FundSourceMethod;
    isEventProgram?: boolean;
    eventDetails?: FundRequest['eventDetails'];
    isAdvanceRequisition?: boolean;
    bankDetails?: BankDetails;
    mfsDetails?: MfsDetails;
  }) => void;
  onVerifyByAccounts: (requestId: string, notes: string) => void;
  onApproveByManagement: (requestId: string, notes: string) => void;
  onReject: (requestId: string, reason: string) => void;
  onDisburse: (requestId: string, method: FundSourceMethod) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Program & Event Advance / Requisition (প্রোগ্রাম বা ইভেন্ট অগ্রিম / রিকুইজিশন)',
  'Program & Event Expense & Adjustment (প্রোগ্রাম বা ইভেন্ট খরচ ও সমন্বয়)',
  'Rent (House / Shelter / Office)',
  'Food & Nutrition (Rice, Dal, Oil, Vegetables)',
  'Electricity / Current Bill',
  'Gas Bill / Cylinder',
  'Water & WASA',
  'Logistics & Procurement (Kena-kata)',
  'Office & Administration Expenses',
  'Education & SUS School Materials',
  'Medical & Emergency Child Treatment',
  'Vocational Training & Skill Development',
  'General Operational Expense',
];

export const FundRequestsView: React.FC<FundRequestsViewProps> = ({
  fundRequests,
  branches,
  subBranches,
  projects,
  currentUser,
  language,
  isBranchRep,
  isCentralAccounts,
  isManagement,
  onAddFundRequest,
  onVerifyByAccounts,
  onApproveByManagement,
  onReject,
  onDisburse,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING_VERIFICATION' | 'VERIFIED_BY_ACCOUNTS' | 'APPROVED_BY_MANAGEMENT' | 'DISBURSED' | 'REJECTED'>('ALL');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');

  // Action Dialog State
  const [actingRequest, setActingRequest] = useState<FundRequest | null>(null);
  const [actionType, setActionType] = useState<'VERIFY_ACCOUNTS' | 'APPROVE_MANAGEMENT' | 'REJECT' | 'DISBURSE' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [disburseMethod, setDisburseMethod] = useState<FundSourceMethod>('BANK_TRANSFER');

  // New Request Form State
  const [branchId, setBranchId] = useState<string>(currentUser.branchId || (branches[0]?.id ?? ''));
  const [subBranchId, setSubBranchId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState<number>(25000);
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT' | 'EMERGENCY'>('NORMAL');
  const [paymentMethod, setPaymentMethod] = useState<FundSourceMethod>('MOBILE_BANKING');
  
  // Program / Event Manual Input State
  const [isEventProgram, setIsEventProgram] = useState<boolean>(true);
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [eventVenue, setEventVenue] = useState<string>('');
  const [eventCoordinator, setEventCoordinator] = useState<string>(currentUser.name);
  const [eventPhone, setEventPhone] = useState<string>(currentUser.phone || '');
  const [eventBudget, setEventBudget] = useState<string>('30000');
  const [expectedParticipants, setExpectedParticipants] = useState<string>('120');
  const [eventSummary, setEventSummary] = useState<string>('');

  // Bank details
  const [bankName, setBankName] = useState('Dutch-Bangla Bank PLC');
  const [bankBranch, setBankBranch] = useState('Local Branch');
  const [accHolder, setAccHolder] = useState(currentUser.name);
  const [accNumber, setAccNumber] = useState('');

  // MFS details
  const [mfsProvider, setMfsProvider] = useState<'bKash' | 'Nagad' | 'Rocket'>('bKash');
  const [mfsNumber, setMfsNumber] = useState(currentUser.phone || '');
  const [mfsHolder, setMfsHolder] = useState(currentUser.name);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const availableSubBranches = subBranches.filter(s => s.branchId === branchId);

  const handleCategorySelect = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    if (newCat.includes('Event') || newCat.includes('ইভেন্ট') || newCat.includes('প্রোগ্রাম')) {
      setIsEventProgram(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert(language === 'bn' ? 'দয়া করে টাকার সঠিক পরিমাণ দিন।' : 'Please enter a valid amount.');
      return;
    }
    if (!purpose.trim()) {
      alert(language === 'bn' ? 'দয়া করে খরচের কারণ ও বিবরণ দিন।' : 'Please provide the purpose of this fund request.');
      return;
    }

    const isEvt = isEventProgram || category.includes('Event') || category.includes('ইভেন্ট');

    onAddFundRequest({
      branchId,
      subBranchId: subBranchId || undefined,
      projectId: projectId || undefined,
      category,
      amount: Number(amount),
      purpose: purpose.trim(),
      urgency,
      preferredPaymentMethod: paymentMethod,
      isEventProgram: isEvt,
      eventDetails: isEvt ? {
        isEventProgram: true,
        eventName: eventName || purpose.trim(),
        eventDate,
        venue: eventVenue,
        coordinatorName: eventCoordinator,
        coordinatorPhone: eventPhone,
        totalEventBudget: Number(eventBudget) || Number(amount),
        expectedParticipants: Number(expectedParticipants) || undefined,
        programSummary: eventSummary,
      } : undefined,
      isAdvanceRequisition: isEvt,
      bankDetails: paymentMethod === 'BANK_TRANSFER' ? {
        bankName,
        branchName: bankBranch,
        accountHolderName: accHolder,
        accountNumber: accNumber,
      } : undefined,
      mfsDetails: (paymentMethod === 'MOBILE_BANKING' || paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') ? {
        provider: mfsProvider,
        accountNumber: mfsNumber,
        accountHolderName: mfsHolder,
        accountType: 'PERSONAL',
        trxId: '',
      } : undefined,
    });

    setShowModal(false);
    setPurpose('');
    setAmount(25000);
  };

  // Filter requests
  const filteredRequests = fundRequests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (!isBranchRep && selectedBranchId !== 'ALL' && r.branchId !== selectedBranchId) return false;
    return true;
  });

  const pendingVerificationCount = fundRequests.filter(r => r.status === 'PENDING_VERIFICATION').length;
  const verifiedAwaitingManagementCount = fundRequests.filter(r => r.status === 'VERIFIED_BY_ACCOUNTS').length;
  const approvedCount = fundRequests.filter(r => r.status === 'APPROVED_BY_MANAGEMENT').length;
  const disbursedCount = fundRequests.filter(r => r.status === 'DISBURSED').length;

  const totalSanctioned = fundRequests
    .filter(r => r.status === 'APPROVED_BY_MANAGEMENT' || r.status === 'DISBURSED')
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-800/40">
              <Send className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">
                {isBranchRep 
                  ? (language === 'bn' ? 'ব্রাঞ্চ ফান্ড রিকুইজিশন (টাকার আবেদন)' : 'Branch Fund Requisition')
                  : (language === 'bn' ? 'ফান্ড রিকুইজিশন ভেরিফিকেশন ও অনুমোদন' : 'Fund Requisition Verification & Approval Queue')}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn'
                  ? 'শাখা রিকুইজিশন পাঠাবে → অ্যাকাউন্টস যাচাই করবে → ম্যানেজমেন্ট অনুমোদন করবে → অর্থ বিতরণ সম্পন্ন হবে।'
                  : 'Branch requests funds → Accounts verifies → Management approves → Disbursed to Branch.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setBranchId(currentUser.branchId || (branches[0]?.id ?? ''));
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-950/50 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('actionNewFundRequest')}</span>
        </button>
      </div>

      {/* Metrics Row: 2-step verification progress */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/60 border border-amber-800/40 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'bn' ? '১. অ্যাকাউন্টস যাচাই বাকি' : '1. Accounts Verify Pending'}
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2 font-mono">{pendingVerificationCount}</div>
        </div>

        <div className="bg-slate-900/60 border border-sky-800/40 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'bn' ? '২. ম্যানেজমেন্ট অনুমোদন বাকি' : '2. Awaiting Management'}
            </span>
            <UserCheck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 mt-2 font-mono">{verifiedAwaitingManagementCount}</div>
        </div>

        <div className="bg-slate-900/60 border border-emerald-800/40 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'bn' ? '৩. অনুমোদিত (বিতরণযোগ্য)' : '3. Ready to Disburse'}
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2 font-mono">{approvedCount}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              {language === 'bn' ? 'মোট অনুমোদিত তহবিল' : 'Total Approved Funds'}
            </span>
            <Wallet className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">৳ {totalSanctioned.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: language === 'bn' ? 'সবগুলো' : 'All' },
            { id: 'PENDING_VERIFICATION', label: language === 'bn' ? 'অ্যাকাউন্টস যাচাই বাকি' : 'Accounts Pending' },
            { id: 'VERIFIED_BY_ACCOUNTS', label: language === 'bn' ? 'ম্যানেজমেন্টের অপেক্ষায়' : 'Management Pending' },
            { id: 'APPROVED_BY_MANAGEMENT', label: language === 'bn' ? 'অনুমোদিত' : 'Approved' },
            { id: 'DISBURSED', label: language === 'bn' ? 'বিতরণ সম্পন্ন' : 'Disbursed' },
            { id: 'REJECTED', label: language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected' },
          ].map(st => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st.id 
                  ? 'bg-red-600 text-white font-bold' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {!isBranchRep && (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{t('branch')}:</span>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
            >
              <option value="ALL">{language === 'bn' ? 'সকল শাখা' : 'All Branches'} ({branches.length})</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800/80">
            <Send className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-400">
              {language === 'bn' ? 'কোনো ফান্ড রিকুইজিশন পাওয়া যায়নি।' : 'No fund requisitions found.'}
            </div>
          </div>
        ) : (
          filteredRequests.map(req => (
            <div 
              key={req.id}
              className={`p-4 rounded-xl border transition-all ${
                req.status === 'APPROVED_BY_MANAGEMENT' 
                  ? 'bg-emerald-950/20 border-emerald-800/50' 
                  : req.status === 'DISBURSED'
                  ? 'bg-sky-950/20 border-sky-800/50'
                  : req.status === 'REJECTED'
                  ? 'bg-rose-950/20 border-rose-800/50'
                  : req.status === 'VERIFIED_BY_ACCOUNTS'
                  ? 'bg-amber-950/20 border-amber-800/50'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400 bg-red-950/50 px-2 py-0.5 rounded border border-red-800/40">
                      {req.requestNumber}
                    </span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {req.branchName}
                    </span>
                    {req.subBranchName && (
                      <span className="text-[11px] font-medium text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/30">
                        📍 {req.subBranchName}
                      </span>
                    )}
                    {req.projectName && (
                      <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {req.projectName}
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.urgency === 'EMERGENCY'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : req.urgency === 'URGENT'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {req.urgency}
                    </span>

                    {/* Status Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      req.status === 'APPROVED_BY_MANAGEMENT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : req.status === 'DISBURSED'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : req.status === 'VERIFIED_BY_ACCOUNTS'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {req.status === 'PENDING_VERIFICATION' && (
                        <span>{language === 'bn' ? 'অ্যাকাউন্টস যাচাই বাকি' : 'Pending Verification'}</span>
                      )}
                      {req.status === 'VERIFIED_BY_ACCOUNTS' && (
                        <span>{language === 'bn' ? 'অ্যাকাউন্টস যাচাইকৃত (ম্যানেজমেন্টের অপেক্ষায়)' : 'Verified (Awaiting Management)'}</span>
                      )}
                      {req.status === 'APPROVED_BY_MANAGEMENT' && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {language === 'bn' ? 'ম্যানেজমেন্ট অনুমোদিত' : 'Approved by Management'}
                        </span>
                      )}
                      {req.status === 'DISBURSED' && (
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {language === 'bn' ? 'তহবিল বিতরণ সম্পন্ন' : 'Disbursed'}
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          {language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium">
                    <span className="text-red-400 font-bold mr-1">{t('category')}:</span>
                    {req.category}
                  </div>

                  {/* Advance Requisition & Event Program Badge / Card */}
                  {(req.isEventProgram || req.eventDetails || req.isAdvanceRequisition) && (
                    <div className="bg-purple-950/30 border border-purple-800/40 rounded-lg p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>{req.eventDetails?.eventName || 'প্রোগ্রাম / ইভেন্ট অগ্রিম'}</span>
                        </div>
                        {req.isAdvanceRequisition && (
                          req.advanceSettled ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              {language === 'bn' ? `অগ্রিম সমন্বিত (${req.settledVoucherNumber || 'Voucher'})` : `Settled (${req.settledVoucherNumber})`}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500 text-amber-300 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {language === 'bn' ? 'অগ্রিম টাকার সমন্বয় বাকি' : 'Advance Pending Settlement'}
                            </span>
                          )
                        )}
                      </div>

                      {req.eventDetails && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-purple-200/80 pt-1 border-t border-purple-800/30">
                          {req.eventDetails.venue && (
                            <div><span className="text-slate-400 font-medium">ভেন্যু:</span> {req.eventDetails.venue}</div>
                          )}
                          {req.eventDetails.eventDate && (
                            <div><span className="text-slate-400 font-medium">তারিখ:</span> {req.eventDetails.eventDate}</div>
                          )}
                          {req.eventDetails.coordinatorName && (
                            <div><span className="text-slate-400 font-medium">সমন্বয়কারী:</span> {req.eventDetails.coordinatorName} {req.eventDetails.coordinatorPhone ? `(${req.eventDetails.coordinatorPhone})` : ''}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/80">
                    <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">
                      {language === 'bn' ? 'খরচের বিবরণ / উদ্দেশ্য:' : 'Purpose / Description:'}
                    </span>
                    {req.purpose}
                  </p>

                  {/* Payment Details */}
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-300">{t('paymentMethod')}:</span>
                      {req.preferredPaymentMethod === 'BANK_TRANSFER' ? (
                        <span className="flex items-center gap-1 text-sky-400 font-mono">
                          <Landmark className="w-3 h-3" />
                          {req.bankDetails?.bankName} ({req.bankDetails?.accountNumber})
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-pink-400 font-mono">
                          <Smartphone className="w-3 h-3" />
                          {req.mfsDetails?.provider} ({req.mfsDetails?.accountNumber}) - {req.mfsDetails?.accountHolderName}
                        </span>
                      )}
                    </div>
                    <span>•</span>
                    <div>
                      {language === 'bn' ? 'আবেদনকারী:' : 'Requested by:'}{' '}
                      <span className="text-slate-200 font-semibold">{req.requestedByName}</span> (ID: {req.requestedByStaffId})
                    </div>
                    <span>•</span>
                    <div>{new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>

                  {/* Verification Note (Accounts) */}
                  {req.verifiedBy && (
                    <div className="text-xs text-amber-300 bg-amber-950/40 p-2 rounded border border-amber-800/40 flex items-start gap-1.5">
                      <UserCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {language === 'bn' ? '১. সেন্ট্রাল অ্যাকাউন্টস যাচাই:' : '1. Accounts Verification:'}{' '}
                        </span>
                        {req.verifiedBy.notes} ({req.verifiedBy.name}, {req.verifiedBy.date})
                      </div>
                    </div>
                  )}

                  {/* Approval Note (Management) */}
                  {req.approvedBy && (
                    <div className="text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/40 flex items-start gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {language === 'bn' ? '২. ম্যানেজমেন্ট চূড়ান্ত অনুমোদন:' : '2. Management Final Approval:'}{' '}
                        </span>
                        {req.approvedBy.notes} ({req.approvedBy.name}, {req.approvedBy.date})
                      </div>
                    </div>
                  )}

                  {req.rejectionReason && (
                    <div className="text-xs text-rose-300 bg-rose-950/40 p-2 rounded border border-rose-800/40">
                      <span className="font-bold">✕ {language === 'bn' ? 'প্রত্যাখ্যানের কারণ:' : 'Rejection Reason:'} </span>
                      {req.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Amount and Multi-Role Action Buttons */}
                <div className="flex md:flex-col items-end justify-between md:justify-start gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                      {language === 'bn' ? 'দাবিকৃত ফান্ড' : 'Requested Amount'}
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                      ৳ {req.amount.toLocaleString()}
                    </span>
                  </div>

                  {/* Step 1 Action: Central Accounts Verifies */}
                  {isCentralAccounts && req.status === 'PENDING_VERIFICATION' && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => {
                          setActingRequest(req);
                          setActionType('VERIFY_ACCOUNTS');
                          setActionNotes(language === 'bn' ? 'বাজেট ও কোটেশন যাচাই করা হয়েছে, ম্যানেজমেন্ট অনুমোদনের জন্য সুপারিশকৃত।' : 'Budget verified against project allocations.');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'অ্যাকাউন্টস যাচাই' : 'Verify'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActingRequest(req);
                          setActionType('REJECT');
                          setActionNotes('');
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-lg border border-slate-700 cursor-pointer"
                      >
                        {t('actionReject')}
                      </button>
                    </div>
                  )}

                  {/* Step 2 Action: Management Approves */}
                  {isManagement && (req.status === 'VERIFIED_BY_ACCOUNTS' || req.status === 'PENDING_VERIFICATION') && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => {
                          setActingRequest(req);
                          setActionType('APPROVE_MANAGEMENT');
                          setActionNotes(language === 'bn' ? 'ম্যানেজমেন্ট (ED / Director) কর্তৃক অর্থ ছাড় অনুমোদন করা হলো।' : 'Management executive sanction granted.');
                        }}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-md shadow-emerald-950/40"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ম্যানেজমেন্ট অনুমোদন' : 'Approve'}</span>
                      </button>
                      <button
                        onClick={() => {
                          setActingRequest(req);
                          setActionType('REJECT');
                          setActionNotes('');
                        }}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-lg border border-slate-700 cursor-pointer"
                      >
                        {t('actionReject')}
                      </button>
                    </div>
                  )}

                  {/* Step 3 Action: Central Accounts Disburses Money */}
                  {isCentralAccounts && req.status === 'APPROVED_BY_MANAGEMENT' && (
                    <button
                      onClick={() => {
                        setActingRequest(req);
                        setActionType('DISBURSE');
                        setDisburseMethod(req.preferredPaymentMethod);
                      }}
                      className="flex items-center gap-1 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors mt-2"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>{t('actionDisburse')}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Requisition Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-red-950 text-red-400">
                  <Send className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {language === 'bn' ? 'নতুন ফান্ড রিকুইজিশন (টাকার আবেদন)' : 'Create Fund Requisition'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {language === 'bn' ? 'শাখার জন্য সেন্ট্রাল অ্যাকাউন্টসে রিকুইজিশন জমা দিন' : 'Submit money request for branch operations'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
              <div className="p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl text-amber-300 text-[11px]">
                {t('mandatoryNotice')}
              </div>

              {/* Branch & Sub-Branch Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('branch')} *</label>
                  {isBranchRep ? (
                    <input
                      type="text"
                      disabled
                      value={currentUser.branchName || 'My Branch'}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 font-bold"
                    />
                  ) : (
                    <select
                      value={branchId}
                      onChange={(e) => {
                        setBranchId(e.target.value);
                        setSubBranchId('');
                      }}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('subBranch')}</label>
                  <select
                    value={subBranchId}
                    onChange={(e) => setSubBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">{language === 'bn' ? '-- মূল শাখা কেন্দ্র --' : '-- General Branch Operations --'}</option>
                    {availableSubBranches.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Project */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-300 font-semibold">{t('category')} *</label>
                    <button
                      type="button"
                      onClick={() => setIsEventProgram(!isEventProgram)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                        isEventProgram 
                          ? 'bg-purple-900/60 border-purple-500 text-purple-200 font-bold' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      <span>{language === 'bn' ? 'ইভেন্ট/প্রোগ্রাম অগ্রিম' : 'Event Advance'}</span>
                    </button>
                  </div>
                  <select
                    value={category}
                    onChange={(e) => handleCategorySelect(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                  >
                    {EXPENSE_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('project')}</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                  >
                    <option value="">{language === 'bn' ? 'সাধারণ কোর ফান্ড (প্রজেক্ট ছাড়া)' : 'General Core Funds'}</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* EVENT MANUAL INPUT FORM SECTION (ইভেন্ট সিলেক্ট করলে ওপেন হবে) */}
              {(isEventProgram || category.includes('Event') || category.includes('ইভেন্ট') || category.includes('প্রোগ্রাম')) && (
                <div className="bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-800/70 rounded-xl p-4 space-y-3.5 shadow-lg">
                  <div className="flex items-center justify-between border-b border-purple-800/40 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                          {language === 'bn' ? 'প্রোগ্রাম / ইভেন্ট ম্যানুয়াল তথ্য এন্ট্রি (Event Advance Details)' : 'Event Manual Input Particulars'}
                        </h4>
                        <p className="text-[11px] text-purple-300/70">
                          {language === 'bn' ? 'শাখা বা হেড অফিসের কর্মসূচির বিস্তারিত তথ্য ম্যানুয়াল এন্ট্রি করুন' : 'Provide program details for this advance requisition'}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
                      ADVANCE REQ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Event Name */}
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 font-medium mb-1">
                        প্রোগ্রাম বা ইভেন্টের নাম (Event Name) *
                      </label>
                      <input
                        type="text"
                        required={isEventProgram}
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="e.g. আন্তর্জাতিক পথশিশু দিবস সমাবেশ ও সাংস্কৃতিক উৎসব ২০২৬"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white font-medium focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Event Date */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        অনুষ্ঠানের তারিখ (Date)
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Venue */}
                    <div className="md:col-span-2">
                      <label className="block text-slate-300 font-medium mb-1">
                        অনুষ্ঠানের স্থান / ভেন্যু (Event Venue)
                      </label>
                      <input
                        type="text"
                        value={eventVenue}
                        onChange={(e) => setEventVenue(e.target.value)}
                        placeholder="e.g. কমলাপুর রেলস্টেশন চত্বর / সদরঘাট লঞ্চ টার্মিনাল মাঠ"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Total Budget */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        মোট আনুমানিক বাজেট (৳)
                      </label>
                      <input
                        type="number"
                        value={eventBudget}
                        onChange={(e) => setEventBudget(e.target.value)}
                        placeholder="e.g. 50000"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Coordinator */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        ইভেন্ট সমন্বয়কারী / ইনচার্জ
                      </label>
                      <input
                        type="text"
                        value={eventCoordinator}
                        onChange={(e) => setEventCoordinator(e.target.value)}
                        placeholder="e.g. মোঃ মাসুদ (ইনচার্জ)"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        মোবাইল নম্বর
                      </label>
                      <input
                        type="text"
                        value={eventPhone}
                        onChange={(e) => setEventPhone(e.target.value)}
                        placeholder="+880 1711-..."
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Expected Participants */}
                    <div>
                      <label className="block text-slate-300 font-medium mb-1">
                        অংশগ্রহণকারী শিশুদের সংখ্যা
                      </label>
                      <input
                        type="number"
                        value={expectedParticipants}
                        onChange={(e) => setExpectedParticipants(e.target.value)}
                        placeholder="e.g. 120"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    {/* Summary */}
                    <div className="md:col-span-3">
                      <label className="block text-slate-300 font-medium mb-1">
                        কর্মসূচির রূপরেখা ও সংক্ষিপ্ত বিবরণ
                      </label>
                      <input
                        type="text"
                        value={eventSummary}
                        onChange={(e) => setEventSummary(e.target.value)}
                        placeholder="যেমন: সকালে পথশিশুদের পুষ্টিকর নাস্তা, খেলাধুলা ও সাংস্কৃতিক অনুষ্ঠান, দুপুরে বিশেষ ভোজ ও পুরষ্কার বিতরণ"
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-purple-700/60 rounded text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  {/* Advance adjustment reminder notice */}
                  <div className="p-2.5 bg-purple-950/60 border border-purple-700/50 rounded-lg flex items-center gap-2 text-[11px] text-purple-200">
                    <span className="text-amber-400 font-bold shrink-0">⚡ অডিট নিয়ম:</span>
                    <span>
                      এই অগ্রিম অনুমোদন ও উত্তোলনের পর খরচকৃত বিল ও রসিদ দিয়ে ভাউচার অপশনে <strong>"অগ্রিম সমন্বয় (Advance Adjustment)"</strong> সম্পন্ন করা আবশ্যক।
                    </span>
                  </div>
                </div>
              )}

              {/* Amount & Urgency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('amount')} *</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono font-bold focus:ring-1 focus:ring-red-500"
                    placeholder="e.g. 25000"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">{t('urgency')} *</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['NORMAL', 'URGENT', 'EMERGENCY'] as const).map(lvl => (
                      <button
                        type="button"
                        key={lvl}
                        onClick={() => setUrgency(lvl)}
                        className={`py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          urgency === lvl 
                            ? lvl === 'EMERGENCY' ? 'bg-rose-600 text-white border-rose-500' :
                              lvl === 'URGENT' ? 'bg-amber-600 text-white border-amber-500' :
                              'bg-slate-700 text-white border-slate-500'
                            : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">{t('purpose')} *</label>
                <textarea
                  required
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder={language === 'bn' ? 'কেন এই টাকা প্রয়োজন, কয়জন শিশু উপকৃত হবে, ক্রয়ের বিবরণ...' : 'Describe why this fund is required...'}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:ring-1 focus:ring-red-500"
                />
              </div>

              {/* Payment Details */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <label className="block text-slate-300 font-bold">{t('paymentMethod')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'MOBILE_BANKING', label: 'bKash / Nagad', icon: Smartphone },
                    { id: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Landmark },
                    { id: 'CASH', label: 'Cash Float', icon: Wallet },
                  ].map(m => {
                    const Icon = m.icon;
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as FundSourceMethod)}
                        className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer ${
                          paymentMethod === m.id
                            ? 'bg-red-950/60 border-red-600 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-red-400 shrink-0" />
                        <span className="text-[11px] font-semibold truncate">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {(paymentMethod === 'MOBILE_BANKING' || paymentMethod === 'BKASH' || paymentMethod === 'NAGAD') && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('mfsProvider')} *</label>
                      <select
                        value={mfsProvider}
                        onChange={(e) => setMfsProvider(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      >
                        <option value="bKash">bKash (বিকাশ)</option>
                        <option value="Nagad">Nagad (নগদ)</option>
                        <option value="Rocket">Rocket (রকেট)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('mobileNumber')} (11 digits) *</label>
                      <input
                        type="tel"
                        required
                        value={mfsNumber}
                        onChange={(e) => setMfsNumber(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('accountHolder')} *</label>
                      <input
                        type="text"
                        required
                        value={mfsHolder}
                        onChange={(e) => setMfsHolder(e.target.value)}
                        placeholder="Name on SIM"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('bankName')} *</label>
                      <input
                        type="text"
                        required
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        placeholder="e.g. Dutch-Bangla Bank PLC"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('branchName')} *</label>
                      <input
                        type="text"
                        required
                        value={bankBranch}
                        onChange={(e) => setBankBranch(e.target.value)}
                        placeholder="e.g. Motijheel Branch"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('accountHolder')} *</label>
                      <input
                        type="text"
                        required
                        value={accHolder}
                        onChange={(e) => setAccHolder(e.target.value)}
                        placeholder="e.g. LEEDO Float"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 font-medium mb-1">{t('accountNumber')} *</label>
                      <input
                        type="text"
                        required
                        value={accNumber}
                        onChange={(e) => setAccNumber(e.target.value)}
                        placeholder="e.g. 115.120.984521"
                        className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-950/40 cursor-pointer"
                >
                  {language === 'bn' ? 'অ্যাকাউন্টসে রিকুইজিশন পাঠান' : 'Submit Requisition to Accounts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Action Dialog (Verify Accounts / Approve Management / Disburse / Reject) */}
      {actingRequest && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              {actionType === 'VERIFY_ACCOUNTS' && (language === 'bn' ? 'অ্যাকাউন্টস ডিপার্টমেন্ট যাচাই ও ফরওয়ার্ড' : 'Step 1: Accounts Verification & Forward')}
              {actionType === 'APPROVE_MANAGEMENT' && (language === 'bn' ? 'ম্যানেজমেন্ট চূড়ান্ত অনুমোদন (ED / Director)' : 'Step 2: Management Final Executive Approval')}
              {actionType === 'REJECT' && (language === 'bn' ? 'রিকুইজিশন প্রত্যাখ্যান' : 'Reject Requisition')}
              {actionType === 'DISBURSE' && (language === 'bn' ? 'শাখা বরাবর তহবিল বিতরণ' : 'Disburse Funds to Branch')}
            </h3>

            <div className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <div className="font-bold text-white">{actingRequest.requestNumber} - ৳ {actingRequest.amount.toLocaleString()}</div>
              <div className="text-slate-400 mt-0.5">{actingRequest.branchName} • {actingRequest.category}</div>
            </div>

            {actionType === 'DISBURSE' ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">{t('paymentMethod')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDisburseMethod('BANK_TRANSFER')}
                    className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      disburseMethod === 'BANK_TRANSFER' ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisburseMethod('MOBILE_BANKING')}
                    className={`p-2.5 rounded-lg border text-xs font-bold cursor-pointer ${
                      disburseMethod === 'MOBILE_BANKING' ? 'bg-pink-600 text-white border-pink-400' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    bKash / Nagad
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {actionType === 'VERIFY_ACCOUNTS' ? (language === 'bn' ? 'অ্যাকাউন্টস ভেরিফিকেশন নোটস:' : 'Accounts Verification Notes:') :
                   actionType === 'APPROVE_MANAGEMENT' ? (language === 'bn' ? 'ম্যানেজমেন্টের অনুমোদন নোটস:' : 'Management Executive Sanction Notes:') :
                   (language === 'bn' ? 'প্রত্যাখ্যানের সুনির্দিষ্ট কারণ:' : 'Reason for Rejection:')}
                </label>
                <textarea
                  rows={2}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={actionType === 'REJECT' ? 'e.g. Quotation missing or budget exhausted' : 'e.g. Budget verified against monthly allocation'}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActingRequest(null);
                  setActionType(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                {t('cancel')}
              </button>

              {actionType === 'VERIFY_ACCOUNTS' && (
                <button
                  onClick={() => {
                    onVerifyByAccounts(actingRequest.id, actionNotes);
                    setActingRequest(null);
                    setActionType(null);
                  }}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {language === 'bn' ? 'যাচাই সম্পন্ন ও ম্যানেজমেন্টে পাঠান' : 'Verify & Send to Management'}
                </button>
              )}

              {actionType === 'APPROVE_MANAGEMENT' && (
                <button
                  onClick={() => {
                    onApproveByManagement(actingRequest.id, actionNotes);
                    setActingRequest(null);
                    setActionType(null);
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {language === 'bn' ? 'চূড়ান্ত অনুমোদন প্রদান করুন' : 'Confirm Executive Approval'}
                </button>
              )}

              {actionType === 'REJECT' && (
                <button
                  onClick={() => {
                    if (!actionNotes.trim()) {
                      alert(language === 'bn' ? 'দয়া করে কারণ উল্লেখ করুন।' : 'Please provide a reason.');
                      return;
                    }
                    onReject(actingRequest.id, actionNotes);
                    setActingRequest(null);
                    setActionType(null);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {language === 'bn' ? 'প্রত্যাখ্যান নিশ্চিত করুন' : 'Confirm Rejection'}
                </button>
              )}

              {actionType === 'DISBURSE' && (
                <button
                  onClick={() => {
                    onDisburse(actingRequest.id, disburseMethod);
                    setActingRequest(null);
                    setActionType(null);
                  }}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  {language === 'bn' ? 'বিতরণ নিশ্চিত করুন' : 'Confirm Disbursement'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
