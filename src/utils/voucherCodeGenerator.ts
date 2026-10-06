import { ExpenseCategory, VoucherType } from '../types';

export function getCategoryMnemonic(category?: ExpenseCategory | string, type?: VoucherType): string {
  if (type === 'ADVANCE_ADJUSTMENT') return 'ADJ';
  if (type === 'DONATION_INCOME') return 'INC';
  if (type === 'BANK_TRANSFER') return 'BNK';
  if (type === 'INTER_BRANCH_TRANSFER') return 'IBT';
  if (type === 'PETTY_CASH_FLOAT') return 'PCF';

  if (!category) return 'EXP';
  const c = category.toLowerCase();

  if (c.includes('adjustment') || c.includes('সমন্বয়') || c.includes('সমন্বয়')) return 'ADJ';
  if (c.includes('event') || c.includes('program') || c.includes('ইভেন্ট') || c.includes('প্রোগ্রাম') || c.includes('অনুষ্ঠান')) return 'EVT';
  if (c.includes('advance') || c.includes('অগ্রিম')) return 'ADV';
  if (c.includes('salary') || c.includes('বেতন') || c.includes('payroll')) return 'SAL';
  if (c.includes('bonus') || c.includes('বোনাস')) return 'BON';
  if (c.includes('conveyance') || c.includes('travel') || c.includes('যাতায়াত') || c.includes('যাতায়াত')) return 'TRV';
  if (c.includes('mobile') || c.includes('মোবাইল') || c.includes('communication')) return 'MOB';
  if (c.includes('medical') || c.includes('চিকিৎসা') || c.includes('welfare') || c.includes('কল্যাণ') || c.includes('treatment')) return 'MED';
  if (c.includes('food') || c.includes('nutrition') || c.includes('খাবার') || c.includes('পুষ্টি')) return 'FOD';
  if (c.includes('rent') || c.includes('ভাড়া') || c.includes('shelter')) return 'RNT';
  if (c.includes('electricity') || c.includes('gas') || c.includes('water') || c.includes('বিদ্যুৎ') || c.includes('গ্যাস') || c.includes('পানি') || c.includes('wasa')) return 'UTL';
  if (c.includes('procurement') || c.includes('kena-kata') || c.includes('কেনাকাটা') || c.includes('logistics')) return 'PUR';
  if (c.includes('education') || c.includes('school') || c.includes('শিক্ষা')) return 'EDU';
  if (c.includes('vocational') || c.includes('skill') || c.includes('প্রশিক্ষণ')) return 'VOC';
  if (c.includes('office') || c.includes('administration') || c.includes('প্রশাসন')) return 'ADM';

  return 'EXP';
}

export function generateVoucherCode(
  sequenceNumber: number,
  category?: ExpenseCategory | string,
  type?: VoucherType,
  year: number = new Date().getFullYear()
): string {
  const mnemonic = getCategoryMnemonic(category, type);
  const seq = String(sequenceNumber).padStart(3, '0');
  return `LEEDO-${year}-${mnemonic}-${seq}`;
}

export function generateRequisitionCode(
  sequenceNumber: number,
  category?: ExpenseCategory | string,
  year: number = new Date().getFullYear()
): string {
  const mnemonic = getCategoryMnemonic(category, 'EXPENSE_PROCUREMENT');
  const seq = String(sequenceNumber).padStart(3, '0');
  return `LEEDO-REQ-${year}-${mnemonic}-${seq}`;
}

export function getMnemonicLabel(mnemonic: string, lang: 'bn' | 'en' = 'bn'): string {
  const labels: Record<string, { bn: string; en: string }> = {
    SAL: { bn: 'কর্মীদের বেতন (Salary)', en: 'Staff Salary' },
    BON: { bn: 'উৎসব বোনাস (Bonus)', en: 'Festival Bonus' },
    EVT: { bn: 'প্রোগ্রাম ও ইভেন্ট (Event/Program)', en: 'Event / Program' },
    ADJ: { bn: 'অগ্রিম সমন্বয় (Advance Adjustment)', en: 'Advance Adjustment' },
    ADV: { bn: 'তহবিল অগ্রিম (Fund Advance)', en: 'Fund Advance' },
    PUR: { bn: 'দোকান কেনাকাটা (Purchase)', en: 'Procurement / Purchase' },
    FOD: { bn: 'খাদ্য ও পুষ্টি (Food)', en: 'Food & Nutrition' },
    RNT: { bn: 'ভাড়া বাবদ (Rent)', en: 'House / Shelter Rent' },
    UTL: { bn: 'ইউটিলিটি ও বিল (Utility)', en: 'Electricity & Utility' },
    MED: { bn: 'চিকিৎসা ও ওষুধ (Medical)', en: 'Medical & Healthcare' },
    TRV: { bn: 'যাতায়াত ও ভ্রমণ (Travel)', en: 'Travel & Conveyance' },
    MOB: { bn: 'মোবাইল ও যোগাযোগ (Mobile)', en: 'Mobile & Communication' },
    EDU: { bn: 'শিক্ষা উপকরণ (Education)', en: 'School Materials' },
    VOC: { bn: 'বৃত্তিমূলক প্রশিক্ষণ (Training)', en: 'Vocational Training' },
    ADM: { bn: 'অফিস প্রশাসন (Admin)', en: 'Office Administration' },
    INC: { bn: 'অনুদান ও জমা (Income)', en: 'Donation Income' },
    BNK: { bn: 'ব্যাংক স্থানান্তর (Bank Trf)', en: 'Bank Transfer' },
    IBT: { bn: 'শাখা স্থানান্তর (Inter-Branch)', en: 'Inter-Branch Transfer' },
    PCF: { bn: 'পেটি ক্যাশ ফ্লট (Petty Cash)', en: 'Petty Cash Float' },
    REQ: { bn: 'তহবিল রিকুইজিশন (Requisition)', en: 'Fund Requisition' },
    EXP: { bn: 'সাধারণ খরচ (General Expense)', en: 'General Expense' },
  };

  return labels[mnemonic] ? (lang === 'bn' ? labels[mnemonic].bn : labels[mnemonic].en) : mnemonic;
}
