import React, { useState } from 'react';
import { User, FundSourceMethod, BankDetails, MfsDetails, Language } from '../types';
import { X, Check, DollarSign, Gift, Upload, Building, Smartphone, Calendar, FileText, UserCheck } from 'lucide-react';

interface PayrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onDisburse: (data: {
    staffId: string;
    staffName: string;
    monthYear: string;
    payrollType: 'SALARY' | 'BONUS' | 'BOTH';
    salaryAmount: number;
    bonusAmount?: number;
    conveyanceAmount?: number;
    paymentMethod: FundSourceMethod;
    bankDetails?: BankDetails;
    mfsDetails?: MfsDetails;
    receiptUrl?: string;
    receiptType?: 'image' | 'pdf';
    receiptFileName?: string;
    notes?: string;
  }) => void;
  language?: Language;
}

export const PayrollModal: React.FC<PayrollModalProps> = ({
  isOpen,
  onClose,
  users,
  onDisburse,
  language = 'bn',
}) => {
  if (!isOpen) return null;

  // Active staff only
  const activeStaffList = users.filter(u => u.status !== 'INACTIVE');
  const [selectedStaffId, setSelectedStaffId] = useState(activeStaffList[0]?.staffId || '');
  const [monthYear, setMonthYear] = useState('September 2026');
  const [payrollType, setPayrollType] = useState<'SALARY' | 'BONUS' | 'BOTH'>('SALARY');
  const [salaryAmount, setSalaryAmount] = useState('22000');
  const [bonusAmount, setBonusAmount] = useState('10000');
  const [conveyanceAmount, setConveyanceAmount] = useState('2500');
  const [paymentMethod, setPaymentMethod] = useState<FundSourceMethod>('BANK_TRANSFER');
  const [notes, setNotes] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80');
  const [receiptType, setReceiptType] = useState<'image' | 'pdf'>('image');
  const [receiptFileName, setReceiptFileName] = useState('signed_payroll_sheet_sep_2026.jpg');

  // Bank fields
  const [bankName, setBankName] = useState('Dhaka Bank Limited');
  const [accountNumber, setAccountNumber] = useState('215.100.99824');
  const [chequeRef, setChequeRef] = useState('BEFTN-SAL-0926');

  // MFS fields
  const [mfsNumber, setMfsNumber] = useState('');
  const [mfsTrxId, setMfsTrxId] = useState('');

  const currentSelectedUser = activeStaffList.find(u => u.staffId === selectedStaffId) || activeStaffList[0];

  const numSalary = payrollType === 'BONUS' ? 0 : Number(salaryAmount) || 0;
  const numBonus = payrollType === 'SALARY' ? 0 : Number(bonusAmount) || 0;
  const numConveyance = Number(conveyanceAmount) || 0;
  const grandTotal = numSalary + numBonus + numConveyance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grandTotal <= 0) {
      alert('Total payroll disbursement must be greater than zero.');
      return;
    }

    onDisburse({
      staffId: currentSelectedUser.staffId,
      staffName: currentSelectedUser.name,
      monthYear,
      payrollType,
      salaryAmount: numSalary,
      bonusAmount: numBonus,
      conveyanceAmount: numConveyance,
      paymentMethod,
      bankDetails: paymentMethod === 'BANK_TRANSFER' ? {
        bankName,
        branchName: 'Kawran Bazar Branch',
        accountHolderName: currentSelectedUser.name,
        accountNumber,
        chequeOrTransactionRef: chequeRef,
      } : undefined,
      mfsDetails: (paymentMethod === 'MOBILE_BANKING' || paymentMethod === 'BKASH') ? {
        provider: 'bKash',
        accountNumber: mfsNumber || currentSelectedUser.phone || '01711XXXXXX',
        accountHolderName: currentSelectedUser.name,
        accountType: 'PERSONAL',
        trxId: mfsTrxId,
      } : undefined,
      receiptUrl,
      receiptType,
      receiptFileName,
      notes,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2.5 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 text-white flex items-center justify-center font-bold shadow-lg shadow-red-950/50">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {language === 'bn' ? 'স্টাফ মাসিক বেতন ও উৎসব বোনাস বিতরণ' : 'Staff Salary & Festival Bonus Disbursement'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'কর্মীদের বেতন, বোনাস ও ভাতা এন্ট্রি এবং অটো-ভাউচার তৈরি' : 'Disburse payroll and auto-generate verifiable voucher'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Staff Member Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'কর্মী নির্বাচন করুন (Staff Member)' : 'Select Staff Member'} *
              </label>
              <select
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-red-500"
              >
                {activeStaffList.map(u => (
                  <option key={u.id} value={u.staffId}>
                    {u.name} (ID: {u.staffId}) — {u.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'বেতনের মাস ও বছর (Month & Year)' : 'Payroll Month & Year'} *
              </label>
              <select
                value={monthYear}
                onChange={e => setMonthYear(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-red-500"
              >
                <option value="January 2026">January 2026 (জানুয়ারি ২০২৬)</option>
                <option value="February 2026">February 2026 (ফেব্রুয়ারি ২০২৬)</option>
                <option value="March 2026">March 2026 (মার্চ ২০২৬)</option>
                <option value="April 2026">April 2026 (এপ্রিল ২০২৬)</option>
                <option value="May 2026">May 2026 (মে ২০২৬)</option>
                <option value="June 2026">June 2026 (জুন ২০২৬)</option>
                <option value="July 2026">July 2026 (জুলাই ২০২৬)</option>
                <option value="August 2026">August 2026 (আগস্ট ২০২৬)</option>
                <option value="September 2026">September 2026 (সেপ্টেম্বর ২০২৬)</option>
                <option value="October 2026">October 2026 (অক্টোবর ২০২৬)</option>
                <option value="November 2026">November 2026 (নভেম্বর ২০২৬)</option>
                <option value="December 2026">December 2026 (ডিসেম্বর ২০২৬)</option>
              </select>
            </div>
          </div>

          {/* Selected Staff Info Card */}
          {currentSelectedUser && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 text-red-400 font-mono font-bold flex items-center justify-center text-xs">
                  {currentSelectedUser.staffId}
                </div>
                <div>
                  <div className="text-white font-bold">{currentSelectedUser.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {currentSelectedUser.designation} • {currentSelectedUser.branchName || 'Head Office'}
                  </div>
                </div>
              </div>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                Active Staff
              </span>
            </div>
          )}

          {/* Payroll Type Toggle */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">
              {language === 'bn' ? 'বিতরণের ধরন (Disbursement Type)' : 'Disbursement Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPayrollType('SALARY')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  payrollType === 'SALARY'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মাসিক বেতন' : 'Monthly Salary'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPayrollType('BONUS')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  payrollType === 'BONUS'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'উৎসব বোনাস' : 'Festival Bonus'}</span>
              </button>
              <button
                type="button"
                onClick={() => setPayrollType('BOTH')}
                className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                  payrollType === 'BOTH'
                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>{language === 'bn' ? 'বেতন + বোনাস' : 'Salary + Bonus'}</span>
              </button>
            </div>
          </div>

          {/* Amount Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(payrollType === 'SALARY' || payrollType === 'BOTH') && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'মূল বেতন (Basic Salary)' : 'Basic Salary'} (BDT) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={salaryAmount}
                  onChange={e => setSalaryAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            {(payrollType === 'BONUS' || payrollType === 'BOTH') && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'বোনাস / ঈদ ভাতা (Festival Bonus)' : 'Festival Bonus'} (BDT) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={bonusAmount}
                  onChange={e => setBonusAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'যাতায়াত ও ভ্রমণ ভাতা (Conveyance)' : 'Conveyance Allowance'} (BDT)
              </label>
              <input
                type="number"
                min="0"
                value={conveyanceAmount}
                onChange={e => setConveyanceAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Grand Total Summary Callout */}
          <div className="p-3 rounded-xl bg-red-950/30 border border-red-900/50 flex items-center justify-between">
            <span className="text-xs font-bold text-red-200">
              {language === 'bn' ? 'মোট বিতরণযোগ্য অর্থ (Total Disbursement):' : 'Total Net Payable:'}
            </span>
            <span className="text-lg font-black font-mono text-emerald-400">
              ৳ {grandTotal.toLocaleString()}
            </span>
          </div>

          {/* Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                {language === 'bn' ? 'পেমেন্ট মাধ্যম (Payment Method)' : 'Payment Channel'}
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as FundSourceMethod)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-red-500"
              >
                <option value="BANK_TRANSFER">Bank Transfer (Dhaka Bank BEFTN)</option>
                <option value="MOBILE_BANKING">bKash Payroll Disbursement</option>
                <option value="CASH">Cash in Hand (অফিস নগদ তহবিল)</option>
              </select>
            </div>

            {paymentMethod === 'BANK_TRANSFER' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  {language === 'bn' ? 'চেক বা ট্রানজেকশন রেফারেন্স' : 'Cheque / Transaction Ref'}
                </label>
                <input
                  type="text"
                  value={chequeRef}
                  onChange={e => setChequeRef(e.target.value)}
                  placeholder="e.g. BEFTN-SAL-0926"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            )}
          </div>

          {/* Payslip & Signed Sheet Proof Attachment */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <label className="block text-slate-300 font-semibold">
              {language === 'bn' ? 'স্বাক্ষরিত স্যালারি শীট / ব্যাংক স্টেটমেন্ট রসিদ (ছবি বা PDF)' : 'Signed Salary Sheet / Bank Memo Proof (Image or PDF)'}
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-3 py-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 rounded-lg flex items-center gap-1.5 font-semibold">
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ফাইল আপলোড (Image/PDF)' : 'Upload File'}</span>
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
                  setReceiptFileName('standard_leedo_payroll_voucher_signed.jpg');
                }}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-[11px]"
              >
                {language === 'bn' ? 'নমুনা স্যালারি শীট যুক্ত করুন' : 'Use Sample Signed Sheet'}
              </button>
            </div>
            {receiptFileName && (
              <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>{receiptFileName} ({receiptType.toUpperCase()})</span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              {language === 'bn' ? 'মন্তব্য ও অডিট নোট' : 'Audit Notes & Remarks'}
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Month-end field duty reconciliation approved by Admin Director Kanta"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-950/50 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{language === 'bn' ? 'বেতন বিতরণ ও ভাউচার তৈরি করুন' : 'Disburse & Generate Voucher'}</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};
