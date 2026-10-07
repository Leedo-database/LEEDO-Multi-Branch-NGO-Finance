export type UserRole = 'SUPER_ADMIN' | 'MANAGEMENT' | 'CENTRAL_ACCOUNTS' | 'BRANCH_REP';

export type Language = 'en' | 'bn';

export interface User {
  id: string;
  staffId: string; // e.g. "1001", "1002", "1004", "1079", "1023", etc.
  name: string;
  email: string;
  password?: string; // Stored securely for authentication
  mustChangePassword?: boolean; // Flag indicating the user must change their password after login
  role: UserRole;
  branchId?: string; // For BRANCH_REP
  branchName?: string;
  designation: string;
  assignedUnits?: string[]; // e.g. Kamalapur: ["SUS (School Under the Sky)", "Shelter"]
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  joinedDate?: string;
}

export interface SubBranch {
  id: string;
  branchId: string; // Parent Branch ID
  branchName: string;
  name: string; // e.g., "SUS (School Under the Sky)", "Kamalapur Night Shelter", "Vocational Training Center"
  code: string;
  inChargeStaffId?: string;
  inChargeName?: string;
  phone?: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  contactPerson: string;
  contactStaffId?: string;
  phone: string;
  currentCashFloat: number; // Petty cash in hand
  bankBalance: number;
  totalAllocated: number;
  totalSpent: number;
  activeProjectsCount: number;
  status: 'ACTIVE' | 'INACTIVE';
  subUnits?: string[]; // legacy quick list
  subBranches?: SubBranch[]; // dynamic sub-branches
}

export type FundSourceMethod = 'BANK_TRANSFER' | 'MOBILE_BANKING' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'UPAY' | 'CASH' | 'DONOR_DIRECT';

export type MfsProvider = 'bKash' | 'Nagad' | 'Rocket' | 'Upay' | 'Cellfin';

export interface BankDetails {
  bankName: string;
  branchName: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber?: string;
  chequeOrTransactionRef?: string;
}

export interface MfsDetails {
  provider: MfsProvider;
  accountNumber: string; // 11 digits
  accountHolderName: string;
  accountType: 'PERSONAL' | 'MERCHANT' | 'AGENT';
  trxId?: string;
}

export interface VendorDetails {
  isVendorPayment: boolean;
  vendorName: string;
  contactPerson?: string;
  contactPhone?: string;
  vendorAddress?: string;
  invoiceNumber?: string;
  tradeLicenseOrTin?: string;
}

export type ExpenseCategory =
  | 'Program & Event Advance / Requisition (প্রোগ্রাম বা ইভেন্ট অগ্রিম / রিকুইজিশন)'
  | 'Program & Event Expense & Adjustment (প্রোগ্রাম বা ইভেন্ট খরচ ও সমন্বয়)'
  | 'Staff Salary & Monthly Payroll (কর্মীদের মাসিক বেতন)' // কর্মীদের মাসিক বেতন
  | 'Festival Bonus & Eid/Puja Allowance (উৎসব বোনাস ও ভাতা)' // উৎসব বোনাস ও ভাতা
  | 'Staff Travel & Field Conveyance (ফিল্ড যাতায়াত ও কনভেন্স)' // ফিল্ড যাতায়াত
  | 'Staff Mobile & Communication Allowance (মোবাইল বিল ও যোগাযোগ ভাতা)' // মোবাইল বিল
  | 'Staff Emergency Medical & Welfare Fund (স্টাফ কল্যাণ ও চিকিৎসা ভাতা)' // স্টাফ কল্যাণ
  | 'Rent (House / Shelter / Office)' // ভাড়া বাবদ খরচ
  | 'Food & Nutrition (Rice, Dal, Oil, Vegetables)' // খাবার ও পুষ্টি
  | 'Electricity / Current Bill' // বিদ্যুৎ / কারেন্ট বিল
  | 'Gas Bill / Cylinder' // গ্যাস বিল / সিলিন্ডার
  | 'Water & WASA' // পানি খরচ
  | 'Logistics & Procurement (Kena-kata)' // লজিস্টিক কেনাকাটা
  | 'Office & Administration Expenses' // অফিস খরচ ও প্রশাসন
  | 'Education & SUS School Materials' // শিক্ষা ও স্কুল উপকরণ
  | 'Medical & Emergency Child Treatment' // চিকিৎসা ও ওষুধ
  | 'Vocational Training & Skill Development' // বৃত্তিমূলক প্রশিক্ষণ
  | 'General Operational Expense';

export interface EventProgramDetails {
  isEventProgram: boolean;
  eventName: string; // যেমন: "আন্তর্জাতিক পথশিশু দিবস উৎসব ও সমাবেশ ২০২৬"
  eventDate?: string;
  venue?: string; // ভেন্যু বা অনুষ্ঠানের স্থান
  coordinatorName?: string; // সমন্বয়কারী / ইনচার্জ
  coordinatorPhone?: string;
  totalEventBudget?: number; // মোট আনুমানিক বাজেট
  programSummary?: string; // কর্মসূচির রূপরেখা ও বিবরণ
  expectedParticipants?: number; // অংশগ্রহণকারী পথশিশুর সংখ্যা
}

export interface AdvanceAdjustmentDetails {
  isAdvanceAdjustment: boolean;
  advanceRequisitionNumber?: string; // e.g. "LEEDO-REQ-2026-EVT-001"
  advanceVoucherNumber?: string; // e.g. "LEEDO-2026-EVT-002"
  advanceAmount: number; // গৃহীত অগ্রিম টাকা (Advance Given / Sanctioned)
  actualExpenseAmount: number; // এই ভাউচারে মোট খরচ (Actual Expense Incurred)
  adjustmentType: 'SETTLED' | 'SURPLUS_RETURNED' | 'EXCESS_CLAIMED'; // সমতা | উদ্বৃত্ত ফেরত | অতিরিক্ত দাবি
  balanceAmount: number; // উদ্বৃত্ত বা অতিরিক্ত পরিমাণ (|advanceAmount - actualExpenseAmount|)
  settlementNotes?: string; // সমন্বয় সংক্রান্ত অডিট নোট ("এই ভাউচারে টাকা এই হলো তার সমন্বয়")
  returnedMethod?: FundSourceMethod; // ফেরত দেওয়ার মাধ্যম (ক্যাশ / ব্যাংক / বিকাশ)
  refundStatus?: 'RETURNED_TO_OFFICE' | 'CLAIMED_FROM_OFFICE' | 'EXACT_MATCH';
}

export interface Donor {
  id: string;
  name: string;
  category: 'INSTITUTIONAL' | 'INDIVIDUAL' | 'CSR' | 'CLUB';
  country: string;
  contactEmail?: string;
  phone?: string;
  totalContributed: number;
}

export type ProjectStatus = 'ACTIVE' | 'CLOSING_SOON' | 'CLOSED';

export interface ProjectBranchAllocation {
  branchId: string;
  branchName: string;
  allocatedAmount: number;
  spentAmount: number;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description: string;
  donorId: string;
  donorName: string;
  primaryCategory: 'FOOD_SHELTER' | 'CLOTHES_FOOD' | 'EDUCATION' | 'EMERGENCY' | 'HEALTHCARE';
  targetBranchIds: string[];
  totalBudget: number;
  spentBudget: number;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  branchAllocations: ProjectBranchAllocation[];
  reconciliationNotes?: string;
}

export type VoucherType = 
  | 'EXPENSE_PROCUREMENT' 
  | 'ADVANCE_ADJUSTMENT' // অগ্রিম সমন্বয় ভাউচার
  | 'DONATION_INCOME' 
  | 'BANK_TRANSFER' 
  | 'INTER_BRANCH_TRANSFER' 
  | 'PETTY_CASH_FLOAT';

export type VoucherStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface VoucherItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

export interface TransactionVoucher {
  id: string;
  voucherNumber: string; // e.g. LEEDO-VCH-2026-001
  type: VoucherType;
  title: string;
  amount: number;
  date: string;
  branchId: string;
  branchName: string;
  subBranchId?: string;
  subBranchName?: string;
  targetBranchId?: string;
  targetBranchName?: string;
  projectId?: string;
  projectName?: string;
  donorId?: string;
  donorName?: string;
  fundSourceMethod: FundSourceMethod;
  category: ExpenseCategory | string;
  isEventProgram?: boolean;
  eventDetails?: EventProgramDetails;
  isAdvanceAdjustment?: boolean;
  advanceAdjustment?: AdvanceAdjustmentDetails;
  bankDetails?: BankDetails;
  mfsDetails?: MfsDetails;
  vendorDetails?: VendorDetails;
  paymentReference?: string;
  items?: VoucherItem[];
  receiptUrl?: string; // Digital proof photo / invoice scan
  receiptType?: 'image' | 'pdf'; // Type of attached physical proof
  receiptFileType?: 'image' | 'pdf' | string;
  receiptFileName?: string;
  receiptFileSize?: string;
  notes: string;
  status: VoucherStatus;
  createdBy: {
    userId: string;
    staffId: string;
    userName: string;
    role: UserRole;
  };
  approvedBy?: {
    userId: string;
    staffId: string;
    userName: string;
    date: string;
  };
  createdAt: string;
  updatedAt: string;
}

// 2-Step Approval Lifecycle for Branch Fund Requests:
// 1. Branch submits -> 'PENDING_VERIFICATION'
// 2. Accounts verifies & checks -> 'VERIFIED_BY_ACCOUNTS'
// 3. Management sanctions final approval -> 'APPROVED_BY_MANAGEMENT'
// 4. Accounts disburses money -> 'DISBURSED'
// Or 'REJECTED'
export type FundRequestStatus = 
  | 'PENDING_VERIFICATION' 
  | 'VERIFIED_BY_ACCOUNTS' 
  | 'APPROVED_BY_MANAGEMENT' 
  | 'DISBURSED' 
  | 'REJECTED';

export interface FundRequest {
  id: string;
  requestNumber: string; // e.g. LEEDO-REQ-2026-001
  branchId: string;
  branchName: string;
  subBranchId?: string;
  subBranchName?: string;
  requestedByUserId: string;
  requestedByStaffId: string;
  requestedByName: string;
  projectId?: string;
  projectName?: string;
  category: ExpenseCategory | string;
  amount: number;
  purpose: string;
  urgency: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  preferredPaymentMethod: FundSourceMethod;
  isEventProgram?: boolean;
  eventDetails?: EventProgramDetails;
  isAdvanceRequisition?: boolean;
  advanceSettled?: boolean;
  settledVoucherId?: string;
  settledVoucherNumber?: string;
  bankDetails?: BankDetails;
  mfsDetails?: MfsDetails;
  status: FundRequestStatus;
  verifiedBy?: {
    userId: string;
    staffId: string;
    name: string;
    date: string;
    notes?: string;
  };
  approvedBy?: {
    userId: string;
    staffId: string;
    name: string;
    date: string;
    notes?: string;
  };
  rejectionReason?: string;
  disbursedVoucherId?: string;
  disbursedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  type: 'FUND_REQUEST' | 'VOUCHER' | 'APPROVAL' | 'SYSTEM';
  timestamp: string;
  read: boolean;
  targetRole?: UserRole | 'ALL';
  targetBranchId?: string;
  linkTab?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  staffId: string;
  userName: string;
  role: UserRole;
  action: 
    | 'CREATE' 
    | 'UPDATE' 
    | 'APPROVE' 
    | 'REJECT' 
    | 'REALLOCATE' 
    | 'CLOSE_PROJECT' 
    | 'PASSWORD_CHANGE' 
    | 'SUBMIT_FUND_REQUEST'
    | 'VERIFY_FUND_REQUEST'
    | 'APPROVE_FUND_REQUEST' 
    | 'REJECT_FUND_REQUEST' 
    | 'DISBURSE_FUND' 
    | 'ADD_SUB_BRANCH'
    | 'ADD_STAFF'
    | 'REMOVE_STAFF'
    | 'DEACTIVATE_STAFF'
    | 'RESET_PASSWORD'
    | 'ADVANCE_ADJUSTMENT'
    | 'PAYROLL_DISBURSEMENT';
  entityType: 'VOUCHER' | 'PROJECT' | 'BRANCH' | 'BUDGET' | 'USER' | 'SUB_BRANCH' | 'FUND_REQUEST';
  entityId: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface PettyCashRecord {
  id: string;
  branchId: string;
  branchName: string;
  date: string;
  openingBalance: number;
  totalReceived: number;
  totalSpent: number;
  closingBalance: number;
  reconciledBy: string;
  notes: string;
}
