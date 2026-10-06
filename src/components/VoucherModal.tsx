import React, { useState } from 'react';
import { 
  X, Plus, Trash2, Camera, Upload, Check, Building, Smartphone, 
  ShoppingCart, FileText, Sparkles, Calendar, AlertCircle, ArrowDownRight, Tag, RefreshCw 
} from 'lucide-react';
import { 
  Branch, SubBranch, Donor, Project, TransactionVoucher, VoucherItem, VoucherType, 
  FundSourceMethod, MfsProvider, BankDetails, MfsDetails, VendorDetails, ExpenseCategory, 
  Language, FundRequest, EventProgramDetails, AdvanceAdjustmentDetails 
} from '../types';
import { getCategoryMnemonic, getMnemonicLabel } from '../utils/voucherCodeGenerator';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (voucher: Omit<TransactionVoucher, 'id' | 'voucherNumber' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>) => void;
  branches: Branch[];
  subBranches?: SubBranch[];
  projects: Project[];
  donors: Donor[];
  fundRequests?: FundRequest[];
  defaultBranchId?: string;
  isBranchRep?: boolean;
  language?: Language;
}

const BANGLADESH_BANKS = [
  'Dhaka Bank Limited',
  'Islami Bank Bangladesh Limited',
  'BRAC Bank Limited',
  'Dutch-Bangla Bank Limited (DBBL)',
  'The City Bank Limited',
  'Sonali Bank PLC',
  'Eastern Bank PLC (EBL)',
  'Standard Chartered Bank',
  'Pubali Bank Limited',
  'Mutual Trust Bank (MTB)',
  'United Commercial Bank (UCB)',
  'Prime Bank Limited',
  'Janata Bank Limited',
  'Other / Local Bank',
];

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Program & Event Expense & Adjustment (প্রোগ্রাম বা ইভেন্ট খরচ ও সমন্বয়)',
  'Program & Event Advance / Requisition (প্রোগ্রাম বা ইভেন্ট অগ্রিম / রিকুইজিশন)',
  'Staff Salary & Monthly Payroll (কর্মীদের মাসিক বেতন)',
  'Festival Bonus & Eid/Puja Allowance (উৎসব বোনাস ও ভাতা)',
  'Staff Travel & Field Conveyance (ফিল্ড যাতায়াত ও কনভেন্স)',
  'Staff Mobile & Communication Allowance (মোবাইল বিল ও যোগাযোগ ভাতা)',
  'Staff Emergency Medical & Welfare Fund (স্টাফ কল্যাণ ও চিকিৎসা ভাতা)',
  'Rent (House / Shelter / Office)', // ভাড়া বাবদ খরচ
  'Food & Nutrition (Rice, Dal, Oil, Vegetables)', // খাদ্য ও পুষ্টি
  'Electricity / Current Bill', // বিদ্যুৎ / কারেন্ট
  'Gas Bill / Cylinder', // গ্যাস ও সিলিন্ডার
  'Water & WASA', // পানি খরচ
  'Logistics & Procurement (Kena-kata)', // লজিস্টিক কেনাকাটা
  'Office & Administration Expenses', // অফিস ও প্রশাসন
  'Education & SUS School Materials', // শিক্ষা ও স্কুল উপকরণ
  'Medical & Emergency Child Treatment', // চিকিৎসা ও ওষুধ
  'Vocational Training & Skill Development', // বৃত্তিমূলক প্রশিক্ষণ
  'General Operational Expense',
];

export const VoucherModal: React.FC<VoucherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  branches,
  subBranches = [],
  projects,
  donors,
  fundRequests = [],
  defaultBranchId,
  isBranchRep,
  language = 'bn',
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<VoucherType>('EXPENSE_PROCUREMENT');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [branchId, setBranchId] = useState(defaultBranchId || branches[0]?.id || '');
  const [subBranchId, setSubBranchId] = useState('');
  const [targetBranchId, setTargetBranchId] = useState(branches[1]?.id || '');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [donorId, setDonorId] = useState(donors[0]?.id || '');
  const [fundSourceMethod, setFundSourceMethod] = useState<FundSourceMethod>('BANK_TRANSFER');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Nutrition (Rice, Dal, Oil, Vegetables)');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80');
  const [receiptType, setReceiptType] = useState<'image' | 'pdf'>('image');
  const [receiptFileName, setReceiptFileName] = useState('shop_cash_memo_receipt.jpg');

  // Program / Event Manual Input Details State
  const [isEventProgram, setIsEventProgram] = useState<boolean>(false);
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [eventVenue, setEventVenue] = useState<string>('');
  const [eventCoordinator, setEventCoordinator] = useState<string>('');
  const [eventPhone, setEventPhone] = useState<string>('');
  const [eventBudget, setEventBudget] = useState<string>('');
  const [eventSummary, setEventSummary] = useState<string>('');
  const [expectedParticipants, setExpectedParticipants] = useState<string>('');

  // Advance Adjustment State ("এই ভাউচারে টাকা এই হলো তার সমন্বয়")
  const [isAdvanceAdjustment, setIsAdvanceAdjustment] = useState<boolean>(false);
  const [selectedAdvanceReqNumber, setSelectedAdvanceReqNumber] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('');
  const [adjustmentSettlementNotes, setAdjustmentSettlementNotes] = useState<string>('এই ভাউচারে টাকা এই হলো তার অগ্রিম সমন্বয়।');
  const [returnedMethod, setReturnedMethod] = useState<FundSourceMethod>('CASH');

  // Bank Transfer Fields
  const [bankName, setBankName] = useState(BANGLADESH_BANKS[0]);
  const [bankBranchName, setBankBranchName] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('');
  const [bankChequeRef, setBankChequeRef] = useState('');

  // Mobile Banking (MFS) Fields
  const [mfsProvider, setMfsProvider] = useState<MfsProvider>('bKash');
  const [mfsAccountNumber, setMfsAccountNumber] = useState('');
  const [mfsAccountHolder, setMfsAccountHolder] = useState('');
  const [mfsAccountType, setMfsAccountType] = useState<'PERSONAL' | 'MERCHANT' | 'AGENT'>('MERCHANT');
  const [mfsTrxId, setMfsTrxId] = useState('');

  // Vendor Details
  const [isVendorPayment, setIsVendorPayment] = useState(false);
  const [vendorName, setVendorName] = useState('');
  const [vendorContactPerson, setVendorContactPerson] = useState('');
  const [vendorContactPhone, setVendorContactPhone] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorInvoiceNumber, setVendorInvoiceNumber] = useState('');
  const [vendorTradeLicense, setVendorTradeLicense] = useState('');

  // Items for itemized procurement
  const [items, setItems] = useState<VoucherItem[]>([
    { id: '1', description: 'Miniket Rice (50kg bags)', quantity: 10, unit: 'Bags', unitPrice: 3400, totalPrice: 34000 }
  ]);

  const handleAddItem = () => {
    const newItem: VoucherItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unit: 'Kg',
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const handleUpdateItem = (id: string, field: keyof VoucherItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          const q = field === 'quantity' ? Number(value) : item.quantity;
          const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
          updated.totalPrice = Math.max(0, q * p);
        }
        return updated;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(i => i.id !== id));
  };

  const isExpenseOrAdjustment = type === 'EXPENSE_PROCUREMENT' || type === 'ADVANCE_ADJUSTMENT';
  const itemsSum = items.reduce((acc, it) => acc + (it.totalPrice || 0), 0);
  const calculatedAmount = (isExpenseOrAdjustment && items.length > 0 && items[0].description) ? itemsSum : Number(amount);

  // Advance adjustment math
  const numAdvance = Number(advanceAmount) || 0;
  const balanceDifference = Math.abs(numAdvance - calculatedAmount);
  const adjustmentType: 'SETTLED' | 'SURPLUS_RETURNED' | 'EXCESS_CLAIMED' = 
    calculatedAmount === numAdvance ? 'SETTLED' : (calculatedAmount < numAdvance ? 'SURPLUS_RETURNED' : 'EXCESS_CLAIMED');

  // Auto-fill from selected advance requisition
  const handleSelectAdvanceReq = (reqNumber: string) => {
    setSelectedAdvanceReqNumber(reqNumber);
    const req = fundRequests.find(r => r.requestNumber === reqNumber || r.id === reqNumber);
    if (req) {
      setAdvanceAmount(String(req.amount));
      if (req.branchId) setBranchId(req.branchId);
      if (req.subBranchId) setSubBranchId(req.subBranchId);
      if (req.projectId) setProjectId(req.projectId);
      if (req.category) setCategory(req.category as ExpenseCategory);
      if (req.isEventProgram && req.eventDetails) {
        setIsEventProgram(true);
        setEventName(req.eventDetails.eventName || '');
        if (req.eventDetails.venue) setEventVenue(req.eventDetails.venue);
        if (req.eventDetails.coordinatorName) setEventCoordinator(req.eventDetails.coordinatorName);
        if (req.eventDetails.totalEventBudget) setEventBudget(String(req.eventDetails.totalEventBudget));
      }
      if (!title) {
        setTitle(`${req.purpose.substring(0, 45)} (অগ্রিম সমন্বয়)`);
      }
    }
  };

  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    if (newCat.includes('Event') || newCat.includes('ইভেন্ট') || newCat.includes('প্রোগ্রাম')) {
      setIsEventProgram(true);
    }
    if (newCat.includes('Adjustment') || newCat.includes('সমন্বয়') || newCat.includes('সমন্বয়')) {
      setIsAdvanceAdjustment(true);
      if (type !== 'ADVANCE_ADJUSTMENT') {
        setType('ADVANCE_ADJUSTMENT');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedBranch = branches.find(b => b.id === branchId);
    const selectedTargetBranch = branches.find(b => b.id === targetBranchId);
    const selectedProject = projects.find(p => p.id === projectId);
    const selectedDonor = donors.find(d => d.id === donorId);

    if (calculatedAmount <= 0) {
      alert('Voucher amount must be greater than zero.');
      return;
    }

    const bankDetailsObj: BankDetails | undefined = (fundSourceMethod === 'BANK_TRANSFER') ? {
      bankName,
      branchName: bankBranchName,
      accountHolderName: bankAccountHolder,
      accountNumber: bankAccountNumber,
      routingNumber: bankRoutingNumber,
      chequeOrTransactionRef: bankChequeRef,
    } : undefined;

    const mfsDetailsObj: MfsDetails | undefined = (fundSourceMethod === 'MOBILE_BANKING' || fundSourceMethod === 'BKASH' || fundSourceMethod === 'NAGAD' || fundSourceMethod === 'ROCKET' || fundSourceMethod === 'UPAY') ? {
      provider: mfsProvider,
      accountNumber: mfsAccountNumber,
      accountHolderName: mfsAccountHolder,
      accountType: mfsAccountType,
      trxId: mfsTrxId,
    } : undefined;

    const vendorDetailsObj: VendorDetails | undefined = isVendorPayment ? {
      isVendorPayment: true,
      vendorName,
      contactPerson: vendorContactPerson,
      contactPhone: vendorContactPhone,
      vendorAddress,
      invoiceNumber: vendorInvoiceNumber,
      tradeLicenseOrTin: vendorTradeLicense,
    } : undefined;

    const selectedSubBranch = subBranches.find(s => s.id === subBranchId);

    const isAdj = type === 'ADVANCE_ADJUSTMENT' || isAdvanceAdjustment;
    const isEvt = isEventProgram || category.includes('Event') || category.includes('ইভেন্ট');

    onSave({
      type,
      title: title || `${category} - ${selectedBranch?.name}`,
      amount: calculatedAmount,
      date,
      branchId,
      branchName: selectedBranch?.name || 'Unknown Branch',
      subBranchId: subBranchId || undefined,
      subBranchName: selectedSubBranch?.name || undefined,
      targetBranchId: type === 'INTER_BRANCH_TRANSFER' ? targetBranchId : undefined,
      targetBranchName: type === 'INTER_BRANCH_TRANSFER' ? selectedTargetBranch?.name : undefined,
      projectId: (isExpenseOrAdjustment || type === 'DONATION_INCOME' || type === 'INTER_BRANCH_TRANSFER') ? projectId : undefined,
      projectName: (isExpenseOrAdjustment || type === 'DONATION_INCOME' || type === 'INTER_BRANCH_TRANSFER') ? selectedProject?.name : undefined,
      donorId: type === 'DONATION_INCOME' ? donorId : selectedProject?.donorId,
      donorName: type === 'DONATION_INCOME' ? selectedDonor?.name : selectedProject?.donorName,
      fundSourceMethod,
      category,
      isEventProgram: isEvt,
      eventDetails: isEvt ? {
        isEventProgram: true,
        eventName: eventName || title,
        eventDate,
        venue: eventVenue,
        coordinatorName: eventCoordinator,
        coordinatorPhone: eventPhone,
        totalEventBudget: Number(eventBudget) || calculatedAmount,
        expectedParticipants: Number(expectedParticipants) || undefined,
        programSummary: eventSummary,
      } : undefined,
      isAdvanceAdjustment: isAdj,
      advanceAdjustment: isAdj ? {
        isAdvanceAdjustment: true,
        advanceRequisitionNumber: selectedAdvanceReqNumber || undefined,
        advanceAmount: numAdvance,
        actualExpenseAmount: calculatedAmount,
        adjustmentType,
        balanceAmount: balanceDifference,
        settlementNotes: adjustmentSettlementNotes || 'এই ভাউচারে টাকা এই হলো তার অগ্রিম সমন্বয়।',
        returnedMethod,
        refundStatus: adjustmentType === 'SURPLUS_RETURNED' ? 'RETURNED_TO_OFFICE' : (adjustmentType === 'EXCESS_CLAIMED' ? 'CLAIMED_FROM_OFFICE' : 'EXACT_MATCH'),
      } : undefined,
      bankDetails: bankDetailsObj,
      mfsDetails: mfsDetailsObj,
      vendorDetails: vendorDetailsObj,
      paymentReference: fundSourceMethod === 'BANK_TRANSFER' ? bankChequeRef : (fundSourceMethod === 'MOBILE_BANKING' ? mfsTrxId : undefined),
      items: isExpenseOrAdjustment ? items : undefined,
      receiptUrl: isExpenseOrAdjustment ? receiptUrl : undefined,
      receiptType: isExpenseOrAdjustment ? receiptType : undefined,
      receiptFileName: isExpenseOrAdjustment ? receiptFileName : undefined,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-950/80 gap-2">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {language === 'bn' ? 'আর্থিক লেনদেন ভাউচার এন্ট্রি' : 'Record Financial Transaction Voucher'}
              </h2>
              <span className="font-mono text-[10px] sm:text-xs font-bold text-red-400 bg-red-950/60 border border-red-800/40 px-2 py-0.5 rounded">
                Code: LEEDO-2026-{getCategoryMnemonic(category, type)}-...
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              {language === 'bn' 
                ? `ভাউচার ধরন: ${getMnemonicLabel(getCategoryMnemonic(category, type), 'bn')} (কোড দেখলেই ব্যয়ের খাত স্পষ্ট বোঝা যাবে)` 
                : `Voucher Category Code: ${getCategoryMnemonic(category, type)} (${getMnemonicLabel(getCategoryMnemonic(category, type), 'en')})`}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-5 max-h-[85vh] overflow-y-auto">
          {/* Voucher Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {language === 'bn' ? 'ভাউচারের ধরন নির্বাচন করুন' : 'Voucher Classification'}
            </label>
            {isBranchRep ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('EXPENSE_PROCUREMENT');
                    setIsAdvanceAdjustment(false);
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    type === 'EXPENSE_PROCUREMENT'
                      ? 'bg-red-600/20 border-red-500 text-red-400 font-bold shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {language === 'bn' ? 'খরচ / কেনাকাটা ভাউচার' : 'Expense / Procurement'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('ADVANCE_ADJUSTMENT');
                    setIsAdvanceAdjustment(true);
                  }}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                    type === 'ADVANCE_ADJUSTMENT'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                      : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {language === 'bn' ? 'অগ্রিম সমন্বয় ভাউচার (Advance Adjustment)' : 'Advance Adjustment'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {[
                  { id: 'EXPENSE_PROCUREMENT', label: language === 'bn' ? 'খরচ / কেনাকাটা' : 'Expense' },
                  { id: 'ADVANCE_ADJUSTMENT', label: language === 'bn' ? 'অগ্রিম সমন্বয়' : 'Advance Adjustment' },
                  { id: 'DONATION_INCOME', label: language === 'bn' ? 'অনুদান / আয়' : 'Income' },
                  { id: 'BANK_TRANSFER', label: language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer' },
                  { id: 'INTER_BRANCH_TRANSFER', label: language === 'bn' ? 'আন্তঃশাখা' : 'Inter-Branch' },
                  { id: 'PETTY_CASH_FLOAT', label: language === 'bn' ? 'পেটি ক্যাশ' : 'Petty Cash' },
                ].map(v => (
                  <button
                    type="button"
                    key={v.id}
                    onClick={() => {
                      setType(v.id as VoucherType);
                      if (v.id === 'ADVANCE_ADJUSTMENT') {
                        setIsAdvanceAdjustment(true);
                      }
                    }}
                    className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                      type === v.id
                        ? 'bg-red-600/20 border-red-500 text-red-400 font-bold shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/80 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Particulars & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Particulars / Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. House Rent / Rice Purchase / Event Advance Settlement"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Voucher Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Financial Expense Category Selector & Toggles */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Financial Expense Category (খরচের খাত)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventProgram(!isEventProgram)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                    isEventProgram 
                      ? 'bg-purple-900/60 border-purple-500 text-purple-200 font-bold' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>ইভেন্ট/প্রোগ্রাম</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdvanceAdjustment(!isAdvanceAdjustment);
                    if (!isAdvanceAdjustment) setType('ADVANCE_ADJUSTMENT');
                  }}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 transition-colors ${
                    isAdvanceAdjustment 
                      ? 'bg-amber-900/60 border-amber-500 text-amber-200 font-bold' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                  <span>অগ্রিম সমন্বয়</span>
                </button>
              </div>
            </div>

            <select
              value={category}
              onChange={e => handleCategoryChange(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 font-medium"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* ADVANCE ADJUSTMENT SECTION (অগ্রিম টাকার সমন্বয়) */}
          {(isAdvanceAdjustment || type === 'ADVANCE_ADJUSTMENT') && (
            <div className="border border-amber-800/70 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 rounded-xl p-4 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-amber-800/40 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                      অগ্রিম টাকার সমন্বয় হিসাব (Advance Adjustment Breakdown)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ইভেন্ট বা কর্মসূচির গৃহীত অগ্রিমের সাথে ভাউচারের মোট খরচের চূড়ান্ত সমন্বয়
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300">
                  ADJUSTMENT
                </span>
              </div>

              {/* Requisition / Advance Reference Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    গৃহীত অগ্রিম রিকুইজিশন / ভাউচার নির্বাচন করুন
                  </label>
                  <select
                    value={selectedAdvanceReqNumber}
                    onChange={e => handleSelectAdvanceReq(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-700/60 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- তালিকা থেকে নির্বাচন করুন বা নিচে ম্যানুয়াল লিখুন --</option>
                    {fundRequests
                      .filter(r => r.branchId === branchId || !isBranchRep)
                      .map(r => (
                        <option key={r.id} value={r.requestNumber}>
                          {r.requestNumber} - ৳{r.amount.toLocaleString()} ({r.purpose.substring(0, 30)}...)
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    অগ্রিম রিকুইজিশন কোড (ম্যানুয়াল ইনপুট)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LEEDO-REQ-2026-EVT-001"
                    value={selectedAdvanceReqNumber}
                    onChange={e => setSelectedAdvanceReqNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-amber-700/60 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              {/* Advance Amount vs Expense Amount & Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">গৃহীত মোট অগ্রিম (Advance Given)</span>
                  <div className="relative">
                    <span className="absolute left-2 top-1.5 text-slate-500 font-bold text-xs">৳</span>
                    <input
                      type="number"
                      min="0"
                      value={advanceAmount}
                      onChange={e => setAdvanceAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-slate-900 border border-amber-600/50 rounded pl-6 pr-2 py-1 text-sm font-mono text-amber-300 font-bold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400 block mb-1">এই ভাউচারে প্রকৃত খরচ (Actual Spent)</span>
                  <div className="text-sm font-mono text-emerald-400 font-bold py-1">
                    ৳ {calculatedAmount.toLocaleString()}
                  </div>
                </div>

                <div className={`p-3 rounded-lg border ${
                  adjustmentType === 'SURPLUS_RETURNED' 
                    ? 'bg-emerald-950/40 border-emerald-700/60' 
                    : adjustmentType === 'EXCESS_CLAIMED'
                    ? 'bg-rose-950/40 border-rose-700/60'
                    : 'bg-blue-950/40 border-blue-700/60'
                }`}>
                  <span className="text-[11px] text-slate-300 block mb-1">
                    {adjustmentType === 'SURPLUS_RETURNED' ? 'উদ্বৃত্ত ফেরত (Return)' : (adjustmentType === 'EXCESS_CLAIMED' ? 'অতিরিক্ত দাবি (Claim)' : 'সমন্বয় স্ট্যাটাস')}
                  </span>
                  <div className={`text-sm font-mono font-bold ${
                    adjustmentType === 'SURPLUS_RETURNED' ? 'text-emerald-400' : (adjustmentType === 'EXCESS_CLAIMED' ? 'text-rose-400' : 'text-blue-400')
                  }`}>
                    ৳ {balanceDifference.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Bold Statement of Settlement */}
              <div className="p-3 bg-amber-950/60 border border-amber-600/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <span className="text-xs font-black text-amber-200 block">
                      এই ভাউচারে টাকা এই হলো তার সমন্বয় (Advance Settlement Confirmation)
                    </span>
                    <span className="text-[11px] text-amber-300/80">
                      {adjustmentType === 'SURPLUS_RETURNED' 
                        ? `অগ্রিমের ৳${numAdvance.toLocaleString()} হতে মোট খরচ হয়েছে ৳${calculatedAmount.toLocaleString()}। অবশিষ্ট উদ্বৃত্ত ৳${balanceDifference.toLocaleString()} হেড অফিস/শাখা ক্যাশে জমা ফেরত দেওয়া হলো।`
                        : adjustmentType === 'EXCESS_CLAIMED'
                        ? `অগ্রিম ছিল ৳${numAdvance.toLocaleString()}, কিন্তু প্রকৃত খরচ ৳${calculatedAmount.toLocaleString()}। অতিরিক্ত ৳${balanceDifference.toLocaleString()} ইনচার্জকে রিইমবার্স করা হবে।`
                        : `গৃহীত অগ্রিম ৳${numAdvance.toLocaleString()} এবং ভাউচারের মোট খরচ ৳${calculatedAmount.toLocaleString()} সম্পূর্ণ সমান। সুষম সমন্বয় সম্পন্ন।`}
                    </span>
                  </div>
                </div>

                {adjustmentType === 'SURPLUS_RETURNED' && (
                  <div className="shrink-0 flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-amber-800">
                    <span className="text-[10px] text-slate-400">ফেরত মাধ্যম:</span>
                    <select
                      value={returnedMethod}
                      onChange={e => setReturnedMethod(e.target.value as FundSourceMethod)}
                      className="bg-transparent text-amber-300 font-bold text-xs focus:outline-none cursor-pointer"
                    >
                      <option value="CASH">ক্যাশ ফ্লোটে ফেরত</option>
                      <option value="BANK_TRANSFER">ব্যাংক একাউন্টে জমা</option>
                      <option value="MOBILE_BANKING">বিকাশ/নগদে জমা</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* EVENT / PROGRAM DETAILS SECTION (ইভেন্ট সিলেক্ট করলে ওপেন হবে) */}
          {(isEventProgram || category.includes('Event') || category.includes('ইভেন্ট') || category.includes('প্রোগ্রাম')) && (
            <div className="border border-purple-800/70 bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 rounded-xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between border-b border-purple-800/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      প্রোগ্রাম / ইভেন্ট ম্যানুয়াল তথ্য এন্ট্রি (Event & Program Details)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ইভেন্ট সংক্রান্ত তথ্য ম্যানুয়ালি ইনপুট দিন (নাম, ভেন্যু, তারিখ, সমন্বয়কারী ইত্যাদি)
                    </p>
                  </div>
                </div>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-purple-950 border border-purple-700 text-purple-300">
                  EVENT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Event Name */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    প্রোগ্রাম বা ইভেন্টের নাম (Event / Program Name) *
                  </label>
                  <input
                    type="text"
                    required={isEventProgram}
                    placeholder="e.g. আন্তর্জাতিক পথশিশু দিবস সমাবেশ ও সাংস্কৃতিক উৎসব ২০২৬"
                    value={eventName}
                    onChange={e => setEventName(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white font-medium focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    অনুষ্ঠানের তারিখ (Event Date)
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Venue / Location */}
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">
                    অনুষ্ঠানের স্থান / ভেন্যু (Event Venue & Location)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. কমলাপুর রেলস্টেশন চত্বর / মোহাম্মদপুর রিং রোড কমিউনিটি হল"
                    value={eventVenue}
                    onChange={e => setEventVenue(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Estimated Budget */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    আনুমানিক মোট বাজেট (৳)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={eventBudget}
                    onChange={e => setEventBudget(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Coordinator & Phone */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    ইভেন্ট সমন্বয়কারী / ইনচার্জ
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. মোঃ মাসুদ (ইনচার্জ)"
                    value={eventCoordinator}
                    onChange={e => setEventCoordinator(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="text"
                    placeholder="+880 1711-..."
                    value={eventPhone}
                    onChange={e => setEventPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    অংশগ্রহণকারী শিশুদের সংখ্যা
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 150"
                    value={expectedParticipants}
                    onChange={e => setExpectedParticipants(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-purple-400"
                  />
                </div>

                {/* Summary / Notes */}
                <div className="md:col-span-3">
                  <label className="block text-slate-300 font-medium mb-1">
                    কর্মসূচির পরিকল্পনা ও সারসংক্ষেপ (Program Activities & Schedule)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: সকালে নাস্তা বিতরণ, দুপুরে বিশেষ পুষ্টিকর খাবার, শিশুদের চিত্রাঙ্কন ও ক্রীড়া প্রতিযোগিতা, সনদ ও পুরষ্কার বিতরণ"
                    value={eventSummary}
                    onChange={e => setEventSummary(e.target.value)}
                    className="w-full bg-slate-950 border border-purple-700/60 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Branch & Project Mapping */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {type === 'INTER_BRANCH_TRANSFER' ? 'Originating Branch (Source)' : 'Branch Center (শাখা)'}
              </label>
              <select
                disabled={isBranchRep}
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 disabled:opacity-60"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>

              {/* Sub-Branch / Unit dropdown */}
              <div className="mt-2">
                <label className="block text-[11px] font-medium text-slate-400 mb-0.5">Sub-Branch / Unit (উপ-শাখা/ইউনিট)</label>
                <select
                  value={subBranchId}
                  onChange={e => setSubBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">-- General Branch / Main Center --</option>
                  {subBranches.filter(s => s.branchId === branchId).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {type === 'INTER_BRANCH_TRANSFER' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Destination Branch (Target)</label>
                <select
                  value={targetBranchId}
                  onChange={e => setTargetBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {branches.filter(b => b.id !== branchId).map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            ) : type === 'DONATION_INCOME' ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Contributing Donor / Grantor</label>
                <select
                  value={donorId}
                  onChange={e => setDonorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  {donors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project Earmark Tag</label>
                <select
                  value={projectId}
                  onChange={e => setProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                >
                  <option value="">-- General Branch Operating Fund --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Payment & Disbursement Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'BANK_TRANSFER', label: 'Bank Transfer / BEFTN', icon: Building },
                { id: 'MOBILE_BANKING', label: 'Mobile Banking (bKash/Nagad)', icon: Smartphone },
                { id: 'CASH', label: 'Cash in Hand (Petty/Market)', icon: Check },
                { id: 'DONOR_DIRECT', label: 'Direct Donor Grant', icon: Check },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = fundSourceMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setFundSourceMethod(m.id as FundSourceMethod)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-red-600/20 border-red-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-red-400' : 'text-slate-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC BANK TRANSFER FIELDS */}
          {fundSourceMethod === 'BANK_TRANSFER' && (
            <div className="border border-sky-800/60 bg-sky-950/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
                <Building className="w-4 h-4" />
                <span>Bank-to-Bank Transfer Particulars</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bank Name</label>
                  <select
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    {BANGLADESH_BANKS.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Bank Branch Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kawran Bazar Branch, Motijheel, Mohammadpur"
                    value={bankBranchName}
                    onChange={e => setBankBranchName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Recipient Account Holder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Syed Abdur Razzak (Landlord) or Akij Wholesale"
                    value={bankAccountHolder}
                    onChange={e => setBankAccountHolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 215.100.99824 or 150120938810"
                    value={bankAccountNumber}
                    onChange={e => setBankAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Routing Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="9-digit routing code"
                    value={bankRoutingNumber}
                    onChange={e => setBankRoutingNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Cheque # / BEFTN Ref / Trx Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-992140 or BEFTN-DH-092"
                    value={bankChequeRef}
                    onChange={e => setBankChequeRef(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC MOBILE BANKING (MFS) FIELDS */}
          {(fundSourceMethod === 'MOBILE_BANKING' || fundSourceMethod === 'BKASH' || fundSourceMethod === 'NAGAD' || fundSourceMethod === 'ROCKET' || fundSourceMethod === 'UPAY') && (
            <div className="border border-pink-800/60 bg-pink-950/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Mobile Financial Services (MFS) Particulars</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">MFS Provider</label>
                  <select
                    value={mfsProvider}
                    onChange={e => setMfsProvider(e.target.value as MfsProvider)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-bold"
                  >
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Rocket">Rocket (DBBL রকেট)</option>
                    <option value="Upay">Upay (উপায়)</option>
                    <option value="Cellfin">Cellfin (সেলফিন)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mobile Account Number (11 Digits)</label>
                  <input
                    type="text"
                    required
                    placeholder="017XXXXXXXX"
                    value={mfsAccountNumber}
                    onChange={e => setMfsAccountNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Name of recipient / vendor"
                    value={mfsAccountHolder}
                    onChange={e => setMfsAccountHolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Account Type</label>
                  <select
                    value={mfsAccountType}
                    onChange={e => setMfsAccountType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white"
                  >
                    <option value="MERCHANT">Merchant Account</option>
                    <option value="PERSONAL">Personal Account</option>
                    <option value="AGENT">Cash Out Agent</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Transaction ID (TrxID)</label>
                  <input
                    type="text"
                    placeholder="e.g. BK99382109 or NG882736192"
                    value={mfsTrxId}
                    onChange={e => setMfsTrxId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VENDOR PAYMENT DETAILS TOGGLE */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                <input
                  type="checkbox"
                  checked={isVendorPayment}
                  onChange={e => setIsVendorPayment(e.target.checked)}
                  className="rounded border-slate-700 text-red-600 focus:ring-0 w-4 h-4"
                />
                <span>This payment is to a Vendor / Supplier / Landlord (ভেন্ডর / দোকানদার / বাড়িওয়ালা)</span>
              </label>
            </div>

            {isVendorPayment && (
              <div className="pt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs border-t border-slate-800/80">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Vendor / Enterprise Name</label>
                  <input
                    type="text"
                    required={isVendorPayment}
                    placeholder="e.g. Haji Akram Rice Mill, Mayer Doa Grocery"
                    value={vendorName}
                    onChange={e => setVendorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Person & Phone</label>
                  <input
                    type="text"
                    placeholder="+880 1819-..."
                    value={vendorContactPhone}
                    onChange={e => setVendorContactPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Invoice / Bill #</label>
                  <input
                    type="text"
                    placeholder="INV-99214"
                    value={vendorInvoiceNumber}
                    onChange={e => setVendorInvoiceNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white font-mono"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-slate-400 font-medium mb-1">Vendor Physical Address / Market Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop 12, Badamtali Ghat, Old Dhaka"
                    value={vendorAddress}
                    onChange={e => setVendorAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Itemized Table if Expense / Procurement or Advance Adjustment */}
          {(type === 'EXPENSE_PROCUREMENT' || type === 'ADVANCE_ADJUSTMENT') ? (
            <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {type === 'ADVANCE_ADJUSTMENT' ? 'ইভেন্ট বা কর্মসূচির বিস্তারিত খরচ তালিকা (Itemized Event Expenses)' : 'Itemized Purchase Details'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {type === 'ADVANCE_ADJUSTMENT' 
                      ? 'অগ্রিমের বিপরীতে সম্পন্ন প্রতিটি ব্যয়ের হিসাব (খাবার, ব্যানার, সাউন্ড সিস্টেম, যাতায়াত ইত্যাদি)' 
                      : 'Detailed breakdown of food items, utilities, or logistics'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-400 bg-red-950/50 border border-red-800 rounded hover:bg-red-900/60 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="py-2 px-2">Item Description</th>
                      <th className="py-2 px-2 w-20">Qty</th>
                      <th className="py-2 px-2 w-20">Unit</th>
                      <th className="py-2 px-2 w-24">Unit Price (৳)</th>
                      <th className="py-2 px-2 w-28 text-right">Total (৳)</th>
                      <th className="py-2 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {items.map(item => (
                      <tr key={item.id}>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rice (50kg), LPG Gas, Electricity bill"
                            value={item.description}
                            onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white focus:outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={e => handleUpdateItem(item.id, 'quantity', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white focus:outline-none focus:border-red-500 font-mono"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={e => handleUpdateItem(item.id, 'unit', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white focus:outline-none focus:border-red-500"
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={e => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded px-2 py-1 text-white focus:outline-none focus:border-red-500 font-mono"
                          />
                        </td>
                        <td className="py-1.5 px-2 text-right font-mono font-medium text-emerald-400">
                          ৳ {item.totalPrice.toLocaleString()}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-slate-500 hover:text-red-400 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-800 text-sm font-semibold text-white">
                <span className="text-slate-400 mr-3">Calculated Total:</span>
                <span className="text-emerald-400 font-mono text-base">৳ {itemsSum.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Amount (BDT)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold">৳</span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Receipt Proof Attachment (Image or PDF) */}
          <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/50 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                {language === 'bn' ? 'দোকানের ক্যাশ মেমো / বিল কপি সংযুক্তি (Physical Proof & Receipt Attachment)' : 'Shop Invoice / Cash Memo Physical Proof'} *
              </label>
              <span className="text-[11px] text-red-400 font-medium">ছবি বা PDF (অডিট ভেরিফিকেশনের জন্য বাধ্যতামূলক)</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center relative">
                {receiptUrl ? (
                  receiptType === 'pdf' ? (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-red-400">
                      <FileText className="w-8 h-8 text-red-500" />
                      <span className="text-[10px] font-bold mt-1">PDF File</span>
                    </div>
                  ) : (
                    <img src={receiptUrl} alt="Receipt proof" className="w-full h-full object-cover" />
                  )
                ) : (
                  <Camera className="w-6 h-6 text-slate-600" />
                )}
              </div>

              <div className="flex-1 space-y-2 text-left w-full">
                <p className="text-xs text-slate-300">
                  {language === 'bn'
                    ? 'দোকানদারের আসল ক্যাশ মেমো, ইনভয়েস, বিদ্যুৎ বিলের কপি অথবা স্যালারি শীট আপলোড করুন।'
                    : 'Upload vendor cash memo, official invoice, or signed utility/salary receipt (Image or PDF).'}
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 font-bold text-white rounded-lg shadow-md shadow-red-950/50 flex items-center gap-1.5 transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ফাইল আপলোড (ছবি বা PDF)' : 'Upload Memo (Image/PDF)'}</span>
                    <input 
                      type="file" 
                      accept="image/*,application/pdf" 
                      className="hidden" 
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setReceiptFileName(file.name);
                          setReceiptType(file.type.includes('pdf') ? 'pdf' : 'image');
                          const reader = new FileReader();
                          reader.onloadend = () => setReceiptUrl(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80');
                      setReceiptType('image');
                      setReceiptFileName('wholesale_groceries_badamtali_memo.jpg');
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700"
                  >
                    নমুনা মুদি মেমো
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReceiptUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80');
                      setReceiptType('image');
                      setReceiptFileName('lazz_pharma_medicine_cash_memo.jpg');
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700"
                  >
                    ওষুধ মেমো
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReceiptUrl('https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&q=80');
                      setReceiptType('pdf');
                      setReceiptFileName('leedo_staff_salary_payroll_advice.pdf');
                    }}
                    className="px-2.5 py-1.5 text-xs bg-slate-800 text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-700"
                  >
                    স্যালারি শীট PDF
                  </button>
                </div>

                {receiptFileName && (
                  <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 mt-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span>সংযুক্ত ফাইল: {receiptFileName} ({receiptType.toUpperCase()})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes & Audit Remarks</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Beneficiary counts, approval references, urgent purchase notes..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Record & Submit Voucher</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
