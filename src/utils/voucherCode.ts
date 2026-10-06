/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoucherType } from '../types';

export const BRANCH_CODE_MAP: Record<string, string> = {
  'br-kamalapur': 'KML',
  'br-kadamtali': 'KDM',
  'br-airport': 'AIR',
  'br-tejgaon': 'TEJ',
  'br-rayerbazar': 'RYR',
  'br-peacehome': 'PCH',
  'br-inclusiveschool': 'INC',
  'br-mirpur': 'MIR',
  'central': 'HO',
  'head-office': 'HO',
};

export function getBranchShortCode(branchId?: string, branchName?: string): string {
  if (!branchId) return 'HO';
  if (BRANCH_CODE_MAP[branchId]) return BRANCH_CODE_MAP[branchId];
  if (branchName) {
    if (branchName.toLowerCase().includes('kamalapur')) return 'KML';
    if (branchName.toLowerCase().includes('kadamtali')) return 'KDM';
    if (branchName.toLowerCase().includes('airport')) return 'AIR';
    if (branchName.toLowerCase().includes('tejgaon')) return 'TEJ';
    if (branchName.toLowerCase().includes('rayer')) return 'RYR';
    if (branchName.toLowerCase().includes('peace')) return 'PCH';
    if (branchName.toLowerCase().includes('inclusive')) return 'INC';
    if (branchName.toLowerCase().includes('mirpur')) return 'MIR';
    if (branchName.toLowerCase().includes('head') || branchName.toLowerCase().includes('central')) return 'HO';
  }
  return branchId.replace('br-', '').substring(0, 3).toUpperCase();
}

export function getVoucherPrefix(type: VoucherType, category?: string): string {
  if (type === 'ADVANCE_ADJUSTMENT' || (category && (category.includes('সমন্বয়') || category.includes('সমন্বয়') || category.includes('Adjustment')))) {
    return 'ADJ';
  }
  if ((type as string) === 'STAFF_SALARY' || (category && (category.includes('বেতন') || category.includes('Salary')))) {
    return 'SAL';
  }
  if ((type as string) === 'FESTIVAL_BONUS' || (category && (category.includes('বোনাস') || category.includes('Bonus')))) {
    return 'BON';
  }
  if (category && (category.includes('সম্মানী') || category.includes('Honorarium'))) {
    return 'HON';
  }
  if (category && (category.includes('কল্যাণ') || category.includes('Welfare'))) {
    return 'WEL';
  }
  if (type === 'EXPENSE_PROCUREMENT') {
    return 'EXP';
  }
  if (type === 'DONATION_INCOME') {
    return 'DON';
  }
  if (type === 'BANK_TRANSFER') {
    return 'BNK';
  }
  if (type === 'INTER_BRANCH_TRANSFER') {
    return 'TRF';
  }
  if (type === 'PETTY_CASH_FLOAT') {
    return 'PCF';
  }
  return 'EXP';
}

/**
 * Auto generates a structured, meaningful voucher code:
 * Format: {TYPE_PREFIX}-{BRANCH_CODE}-{YEAR}-{SERIAL}
 * E.g. EXP-KML-2026-0001, SAL-HO-2026-0002, BON-PCH-2026-0003
 */
export function generateVoucherCode(
  type: VoucherType,
  branchId?: string,
  branchName?: string,
  category?: string,
  sequenceNumber: number = 1
): string {
  const prefix = getVoucherPrefix(type, category);
  const branchCode = getBranchShortCode(branchId, branchName);
  const year = '2026';
  const pad = String(sequenceNumber).padStart(4, '0');
  return `${prefix}-${branchCode}-${year}-${pad}`;
}

/**
 * Auto generates a structured requisition code:
 * Format: REQ-{BRANCH_CODE}-{YEAR}-{SERIAL}
 * E.g. REQ-KML-2026-0001, REQ-AIR-2026-0002
 */
export function generateRequisitionCode(
  branchId?: string,
  branchName?: string,
  sequenceNumber: number = 1
): string {
  const branchCode = getBranchShortCode(branchId, branchName);
  const year = '2026';
  const pad = String(sequenceNumber).padStart(4, '0');
  return `REQ-${branchCode}-${year}-${pad}`;
}

/**
 * Explains what a voucher code means in Bengali and English
 */
export function explainVoucherCode(code: string): { labelBn: string; labelEn: string; color: string } {
  if (!code) return { labelBn: 'ভাউচার', labelEn: 'Voucher', color: 'slate' };
  const parts = code.split('-');
  const prefix = parts[0];

  switch (prefix) {
    case 'EXP':
      return { labelBn: 'কেনাকাটা ও খরচ', labelEn: 'Procurement / Expense', color: 'red' };
    case 'SAL':
      return { labelBn: 'স্টাফ মাসিক বেতন', labelEn: 'Staff Salary', color: 'purple' };
    case 'BON':
      return { labelBn: 'ঈদ ও উৎসব বোনাস', labelEn: 'Festival Bonus', color: 'amber' };
    case 'HON':
      return { labelBn: 'স্টাফ সম্মানী ভাতা', labelEn: 'Honorarium', color: 'indigo' };
    case 'WEL':
      return { labelBn: 'স্টাফ চিকিৎসা ও কল্যাণ', labelEn: 'Staff Welfare', color: 'teal' };
    case 'DON':
      return { labelBn: 'অনুদান ও সহায়তা', labelEn: 'Donation / Grant', color: 'emerald' };
    case 'BNK':
      return { labelBn: 'ব্যাংক ট্রান্সফার', labelEn: 'Bank Transfer', color: 'blue' };
    case 'TRF':
      return { labelBn: 'আন্তঃশাখা ট্রান্সফার', labelEn: 'Branch Transfer', color: 'cyan' };
    case 'PCF':
      return { labelBn: 'পেটি ক্যাশ ফ্লোট', labelEn: 'Petty Cash Float', color: 'orange' };
    case 'REQ':
      return { labelBn: 'ফান্ড রিকুইজিশন', labelEn: 'Fund Requisition', color: 'sky' };
    default:
      return { labelBn: 'ভাউচার', labelEn: 'Voucher', color: 'slate' };
  }
}
