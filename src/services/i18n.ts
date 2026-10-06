import { Language } from '../types';

export const translations = {
  en: {
    // App Brand
    appName: 'LEEDO NGO',
    appSubName: 'Project Finance & Multi-Branch Accounts',
    liveDb: 'Cloud Database',
    connected: 'Connected',

    // Nav Items
    navDashboard: 'Executive Dashboard',
    navFundRequests: 'Fund Requisitions',
    navVouchers: 'Vouchers & Ledger',
    navBranchPortal: 'Branch Expenses (Koros)',
    navProjects: 'Project Budgets',
    navSubBranches: 'Sub-Branches & Units',
    navReports: 'Audit & Reports',
    navProfile: 'My Profile',

    // Role Badges
    roleManagement: 'Executive Management',
    roleAccounts: 'Central Accounts Dept',
    roleBranchRep: 'Branch Incharge',

    // Quick Actions
    actionRecordExpense: 'Record Expense',
    actionNewVoucher: 'New Voucher',
    actionNewFundRequest: 'New Requisition',
    actionPettyCash: 'Reconcile Petty Cash',
    actionApprove: 'Approve',
    actionVerify: 'Verify & Forward',
    actionReject: 'Reject',
    actionDisburse: 'Disburse Funds',
    actionPrint: 'Print Voucher',
    actionDownloadCsv: 'Export CSV',
    actionChangePassword: 'Change Password',
    actionSignOut: 'Sign Out',
    actionLogin: 'Staff Login',
    actionSwitchAccount: 'Switch Staff Account',

    // Statuses
    statusPendingVerification: 'Pending Accounts Verification',
    statusVerifiedByAccounts: 'Verified by Accounts (Awaiting Management)',
    statusApprovedByManagement: 'Approved by Management (Ready for Disburse)',
    statusDisbursed: 'Disbursed',
    statusRejected: 'Rejected',
    statusDraft: 'Draft',
    statusSubmitted: 'Submitted (Awaiting Accounts)',
    statusApproved: 'Approved',

    // Headings
    summaryTitle: 'Financial Overview',
    totalIncome: 'Total Income / Grants',
    totalExpenses: 'Total Operating Expenses',
    netCashBalance: 'Mother Account Balance',
    branchPettyCash: 'Branch Cash Float',
    recentExpenses: 'Recent Expense Records',
    pendingRequisitions: 'Pending Requisitions Queue',
    branchExpenseLedger: 'Branch Expense Ledger',
    requisitionsSubtitle: 'Branch cash requisitions with 2-step verification & management approval',

    // Notifications
    notifications: 'Notifications',
    noNotifications: 'No new notifications',
    markAllRead: 'Mark all as read',

    // Form labels
    staffId: 'Staff ID',
    password: 'Password',
    branch: 'Branch',
    subBranch: 'Sub-Branch / Unit',
    category: 'Expense Category',
    amount: 'Amount (BDT)',
    purpose: 'Purpose & Description',
    urgency: 'Urgency Level',
    paymentMethod: 'Payment Channel',
    bankName: 'Bank Name',
    branchName: 'Bank Branch',
    accountNumber: 'Account Number',
    accountHolder: 'Account Holder Name',
    mfsProvider: 'Mobile Financial Service',
    mobileNumber: 'Mobile Number',
    vendorName: 'Vendor / Supplier Name',
    invoiceNumber: 'Invoice / Bill No',
    date: 'Date',
    voucherNo: 'Voucher No',
    project: 'Project',
    cancel: 'Cancel',
    submit: 'Submit',
    save: 'Save',
    mandatoryNotice: 'Fields marked with * are mandatory.',
  },
  bn: {
    // App Brand
    appName: 'লিডো (LEEDO)',
    appSubName: 'মাল্টি-ব্রাঞ্চ অ্যাকাউন্টিং ও ফিন্যান্স সিস্টেম',
    liveDb: 'ক্লাউড ডাটাবেজ',
    connected: 'কানেক্টেড',

    // Nav Items
    navDashboard: 'এক্সিকিউটিভ ড্যাশবোর্ড',
    navFundRequests: 'ফান্ড রিকুইজিশন',
    navVouchers: 'ভাউচার ও লেজার',
    navBranchPortal: 'শাখার খরচ (খরচ ও ক্যাশ)',
    navProjects: 'প্রজেক্ট বাজেট বণ্টন',
    navSubBranches: 'শাখা ও উপ-শাখা',
    navReports: 'অডিট ও স্টেটমেন্ট',
    navProfile: 'আমার প্রোফাইল',

    // Role Badges
    roleManagement: 'এক্সিকিউটিভ ম্যানেজমেন্ট',
    roleAccounts: 'সেন্ট্রাল অ্যাকাউন্টস বিভাগ',
    roleBranchRep: 'শাখা ইনচার্জ',

    // Quick Actions
    actionRecordExpense: 'খরচ এন্ট্রি করুন',
    actionNewVoucher: 'নতুন ভাউচার',
    actionNewFundRequest: 'নতুন ফান্ড রিকুইজিশন',
    actionPettyCash: 'পেটি ক্যাশ আপডেট',
    actionApprove: 'অনুমোদন দিন',
    actionVerify: 'যাচাই ও ফরওয়ার্ড করুন',
    actionReject: 'প্রত্যাখ্যান',
    actionDisburse: 'তহবিল বিতরণ করুন',
    actionPrint: 'ভাউচার প্রিন্ট',
    actionDownloadCsv: 'CSV ডাউনলোড',
    actionChangePassword: 'পাসওয়ার্ড পরিবর্তন',
    actionSignOut: 'লগ আউট',
    actionLogin: 'স্টাফ লগইন',
    actionSwitchAccount: 'অ্যাকাউন্ট পরিবর্তন',

    // Statuses
    statusPendingVerification: 'অ্যাকাউন্টস যাচাইয়ের অপেক্ষায়',
    statusVerifiedByAccounts: 'অ্যাকাউন্টস যাচাইকৃত (ম্যানেজমেন্টের অপেক্ষায়)',
    statusApprovedByManagement: 'ম্যানেজমেন্ট অনুমোদিত (বিতরণের জন্য প্রস্তুত)',
    statusDisbursed: 'তহবিল বিতরণ সম্পন্ন',
    statusRejected: 'প্রত্যাখ্যাত',
    statusDraft: 'খসড়া',
    statusSubmitted: 'জমা দেওয়া হয়েছে (অ্যাকাউন্টস অনুমোদনের অপেক্ষায়)',
    statusApproved: 'অনুমোদিত',

    // Headings
    summaryTitle: 'আর্থিক সারসংক্ষেপ',
    totalIncome: 'মোট অনুদান / আয়',
    totalExpenses: 'মোট পরিচালন ব্যয় (খরচ)',
    netCashBalance: 'মাদার অ্যাকাউন্ট ব্যালেন্স',
    branchPettyCash: 'শাখাসমূহের ক্যাশ ফ্লোট',
    recentExpenses: 'সাম্প্রতিক খরচের বিবরণ',
    pendingRequisitions: 'অপেক্ষমাণ রিকুইজিশন তালিকা',
    branchExpenseLedger: 'শাখার খরচের লেজার',
    requisitionsSubtitle: '২-ধাপ ভেরিফিকেশন (অ্যাকাউন্টস যাচাই ও ম্যানেজমেন্ট অনুমোদন)',

    // Notifications
    notifications: 'নোটিফিকেশন',
    noNotifications: 'কোনো নতুন নোটিফিকেশন নেই',
    markAllRead: 'সবগুলো পড়া হয়েছে চিহ্নিত করুন',

    // Form labels
    staffId: 'স্টাফ আইডি',
    password: 'পাসওয়ার্ড',
    branch: 'শাখা',
    subBranch: 'উপ-শাখা / ফিল্ড ইউনিট',
    category: 'খরচের খাত',
    amount: 'টাকার পরিমাণ (BDT)',
    purpose: 'খরচের কারণ ও বিবরণ',
    urgency: 'জরুরি মাত্রা',
    paymentMethod: 'টাকা প্রাপ্তির মাধ্যম',
    bankName: 'ব্যাংকের নাম',
    branchName: 'ব্যাংক শাখার নাম',
    accountNumber: 'হিসাব নম্বর',
    accountHolder: 'হিসাবধারীর নাম',
    mfsProvider: 'মোবাইল ব্যাংকিং (বিকাশ/নগদ)',
    mobileNumber: 'মোবাইল নম্বর',
    vendorName: 'ভেন্ডর / সরবরাহকারীর নাম',
    invoiceNumber: 'ইনভয়েস / বিল নম্বর',
    date: 'তারিখ',
    voucherNo: 'ভাউচার নম্বর',
    project: 'প্রজেক্ট',
    cancel: 'বাতিল',
    submit: 'জমা দিন',
    save: 'সংরক্ষণ করুন',
    mandatoryNotice: '* চিহ্নিত ঘরগুলো অবশ্যই পূরণ করতে হবে।',
  },
};

export function getTranslation(lang: Language, key: keyof typeof translations['en']): string {
  return translations[lang]?.[key] || translations['en'][key] || key;
}
