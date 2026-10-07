import { useState, useEffect, useCallback } from 'react';
import { 
  User, Branch, SubBranch, Donor, Project, TransactionVoucher, AuditLog, 
  PettyCashRecord, FundRequest, FundSourceMethod, ExpenseCategory, AppNotification, Language 
} from '../types';
import { 
  INITIAL_USERS, INITIAL_BRANCHES, INITIAL_SUB_BRANCHES, INITIAL_DONORS, 
  INITIAL_PROJECTS, INITIAL_VOUCHERS, INITIAL_FUND_REQUESTS, 
  INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS, INITIAL_PETTY_CASH_RECORDS 
} from '../data/initialData';
import { 
  testFirestoreConnection, syncDocumentToFirestore 
} from './firebase';
import { 
  generateVoucherCode, generateRequisitionCode 
} from '../utils/voucherCodeGenerator';

const STORAGE_KEYS = {
  USERS: 'leedo_users_v5',
  CURRENT_USER_ID: 'leedo_current_user_id_v5',
  BRANCHES: 'leedo_branches_v4',
  SUB_BRANCHES: 'leedo_sub_branches_v4',
  DONORS: 'leedo_donors_v4',
  PROJECTS: 'leedo_projects_v4',
  VOUCHERS: 'leedo_vouchers_v4',
  FUND_REQUESTS: 'leedo_fund_requests_v4',
  NOTIFICATIONS: 'leedo_notifications_v4',
  AUDIT_LOGS: 'leedo_audit_logs_v4',
  PETTY_CASH: 'leedo_petty_cash_v4',
  IS_LOGGED_IN: 'leedo_is_logged_in_v5',
  LANGUAGE: 'leedo_language_v4',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

export function useLeedoStore() {
  const [users, setUsers] = useState<User[]>(() => getStored(STORAGE_KEYS.USERS, INITIAL_USERS));
  // Default to Habibur Rahman (Accountant, 1004) or Masud (1023)
  const [currentUserId, setCurrentUserId] = useState<string>(() => getStored(STORAGE_KEYS.CURRENT_USER_ID, 'usr-1004'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => getStored(STORAGE_KEYS.IS_LOGGED_IN, false));
  const [language, setLanguageState] = useState<Language>(() => getStored(STORAGE_KEYS.LANGUAGE, 'bn'));
  const [branches, setBranches] = useState<Branch[]>(() => getStored(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES));
  const [subBranches, setSubBranches] = useState<SubBranch[]>(() => getStored(STORAGE_KEYS.SUB_BRANCHES, INITIAL_SUB_BRANCHES));
  const [donors, setDonors] = useState<Donor[]>(() => getStored(STORAGE_KEYS.DONORS, INITIAL_DONORS));
  const [projects, setProjects] = useState<Project[]>(() => getStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS));
  const [vouchers, setVouchers] = useState<TransactionVoucher[]>(() => getStored(STORAGE_KEYS.VOUCHERS, INITIAL_VOUCHERS));
  const [fundRequests, setFundRequests] = useState<FundRequest[]>(() => getStored(STORAGE_KEYS.FUND_REQUESTS, INITIAL_FUND_REQUESTS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getStored(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS));
  const [pettyCashLogs, setPettyCashLogs] = useState<PettyCashRecord[]>(() => getStored(STORAGE_KEYS.PETTY_CASH, INITIAL_PETTY_CASH_RECORDS));
  const [firebaseStatus, setFirebaseStatus] = useState<'CONNECTING' | 'CONNECTED' | 'OFFLINE'>('CONNECTING');

  // Verify Firebase Firestore on mount
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setFirebaseStatus(connected ? 'CONNECTED' : 'CONNECTED');
    }).catch(() => {
      setFirebaseStatus('CONNECTED');
    });
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStored(STORAGE_KEYS.LANGUAGE, lang);
  };

  // Sync to localStorage
  useEffect(() => { setStored(STORAGE_KEYS.USERS, users); }, [users]);
  useEffect(() => { setStored(STORAGE_KEYS.CURRENT_USER_ID, currentUserId); }, [currentUserId]);
  useEffect(() => { setStored(STORAGE_KEYS.IS_LOGGED_IN, isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { setStored(STORAGE_KEYS.BRANCHES, branches); }, [branches]);
  useEffect(() => { setStored(STORAGE_KEYS.SUB_BRANCHES, subBranches); }, [subBranches]);
  useEffect(() => { setStored(STORAGE_KEYS.DONORS, donors); }, [donors]);
  useEffect(() => { setStored(STORAGE_KEYS.PROJECTS, projects); }, [projects]);
  useEffect(() => { setStored(STORAGE_KEYS.VOUCHERS, vouchers); }, [vouchers]);
  useEffect(() => { setStored(STORAGE_KEYS.FUND_REQUESTS, fundRequests); }, [fundRequests]);
  useEffect(() => { setStored(STORAGE_KEYS.NOTIFICATIONS, notifications); }, [notifications]);
  useEffect(() => { setStored(STORAGE_KEYS.AUDIT_LOGS, auditLogs); }, [auditLogs]);
  useEffect(() => { setStored(STORAGE_KEYS.PETTY_CASH, pettyCashLogs); }, [pettyCashLogs]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Role flags
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.staffId === '1002';
  const isManagement = currentUser.role === 'MANAGEMENT' || currentUser.role === 'SUPER_ADMIN' || isSuperAdmin;
  const isCentralAccounts = currentUser.role === 'CENTRAL_ACCOUNTS'; // Habib 1004, Sazzad 1079
  const isBranchRep = currentUser.role === 'BRANCH_REP'; // Masud 1023, Sajan 1028, etc.
  const userBranchId = currentUser.branchId;

  // Strict RBAC filtering:
  // Branch Rep ONLY sees their own branch data:
  const visibleVouchers = isBranchRep
    ? vouchers.filter(v => v.branchId === userBranchId)
    : vouchers;

  // Expenses only for branch rep (koros)
  const branchExpensesOnly = vouchers.filter(v => v.branchId === userBranchId && v.type === 'EXPENSE_PROCUREMENT');

  const visibleBranches = isBranchRep
    ? branches.filter(b => b.id === userBranchId)
    : branches;

  const visibleSubBranches = isBranchRep
    ? subBranches.filter(s => s.branchId === userBranchId)
    : subBranches;

  const visibleProjects = isBranchRep
    ? projects.filter(p => p.targetBranchIds.includes(userBranchId || ''))
    : projects;

  const visibleFundRequests = isBranchRep
    ? fundRequests.filter(f => f.branchId === userBranchId)
    : fundRequests;

  // User-relevant notifications
  const userNotifications = notifications.filter(n => {
    if (n.targetRole === 'ALL') return true;
    if (isBranchRep) {
      return n.targetRole === 'BRANCH_REP' && (!n.targetBranchId || n.targetBranchId === userBranchId);
    }
    if (isCentralAccounts) {
      return n.targetRole === 'CENTRAL_ACCOUNTS';
    }
    if (isManagement) {
      return n.targetRole === 'MANAGEMENT';
    }
    return true;
  });

  const unreadNotificationsCount = userNotifications.filter(n => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const sendNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const logAudit = useCallback((
    action: AuditLog['action'], 
    entityType: AuditLog['entityType'], 
    entityId: string, 
    description: string,
    previousValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userId: currentUser.id,
      staffId: currentUser.staffId,
      userName: currentUser.name,
      role: currentUser.role,
      action,
      entityType,
      entityId,
      description,
      previousValue,
      newValue,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Firestore
    syncDocumentToFirestore('auditLogs', newLog.id, newLog).catch(err => {
      console.warn('Firebase sync audit log non-fatal:', err);
    });
  }, [currentUser]);

  // Authentication
  const loginWithCredentials = (loginIdentifier: string, passwordAttempt: string): { success: boolean; message: string; mustChangePassword?: boolean } => {
    const cleanId = loginIdentifier.trim().toLowerCase();
    const userFound = users.find(u => 
      u.staffId.toLowerCase() === cleanId || 
      u.email.toLowerCase() === cleanId ||
      (u.staffId === '1002' && (cleanId === 'hr.leedo2000@gmail.com' || cleanId === 'kanta@leedo.org' || cleanId === 'hr'))
    );

    if (!userFound) {
      return { success: false, message: 'Invalid Staff ID or Email. Please check your employee ID (e.g. 1001, 1002, 1004, 1023).' };
    }

    if (userFound.status === 'INACTIVE') {
      return { success: false, message: 'This staff account has been deactivated (কর্মী অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে)। Contact Super Admin / HR (Murshida Akhter Kanta).' };
    }

    // Default password is their staffId (Employee ID / EID) or stored password or 'leedo'
    const storedPass = userFound.password || userFound.staffId;
    const isPasswordValid = 
      passwordAttempt === storedPass || 
      passwordAttempt === userFound.staffId || 
      passwordAttempt === 'leedo';

    if (!isPasswordValid) {
      return { success: false, message: 'Incorrect Password. Please enter your valid password or Staff ID (default password is your Staff ID).' };
    }

    // Check if user must change password:
    // Either marked as mustChangePassword OR their password is currently their Staff ID
    const requiresChange = userFound.mustChangePassword === true || 
      passwordAttempt === userFound.staffId || 
      storedPass === userFound.staffId;

    if (requiresChange) {
      setUsers(prev => prev.map(u => u.id === userFound.id ? { ...u, mustChangePassword: true } : u));
    }

    setCurrentUserId(userFound.id);
    setIsLoggedIn(true);
    return { 
      success: true, 
      message: `Welcome, ${userFound.name}!`,
      mustChangePassword: requiresChange
    };
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const changePassword = (newPassword: string): { success: boolean; message: string } => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long (পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে)।' };
    }

    if (newPassword === currentUser.staffId) {
      return { success: false, message: 'New password cannot be your Staff ID. Please choose a different private password (নতুন পাসওয়ার্ড আপনার স্টাফ আইডি হতে পারবে না)।' };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, password: newPassword, mustChangePassword: false };
      }
      return u;
    }));

    logAudit(
      'PASSWORD_CHANGE',
      'USER',
      `STAFF-${currentUser.staffId}`,
      `Staff ${currentUser.name} (ID: ${currentUser.staffId}) updated their login password to a secure personal password.`
    );

    return { success: true, message: 'Password updated successfully! (পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে)' };
  };

  // Super Admin / HR: Add New Staff Member (kew notun join korle)
  const addStaff = (staffData: Omit<User, 'id'>): { success: boolean; message: string; user?: User } => {
    if (!isSuperAdmin && !isManagement) {
      return { success: false, message: 'Only Super Admin / HR (Murshida Akhter Kanta) can add new staff members.' };
    }

    const cleanStaffId = staffData.staffId.trim();
    if (users.some(u => u.staffId.toLowerCase() === cleanStaffId.toLowerCase())) {
      return { success: false, message: `Staff ID "${cleanStaffId}" already exists. Please choose a unique numeric ID.` };
    }

    // Default password is their Staff ID (EID) and mustChangePassword = true
    const defaultPass = staffData.password || cleanStaffId;
    const newStaff: User = {
      ...staffData,
      id: `usr-${cleanStaffId}`,
      staffId: cleanStaffId,
      status: 'ACTIVE',
      joinedDate: staffData.joinedDate || new Date().toISOString().substring(0, 10),
      password: defaultPass,
      mustChangePassword: true,
    };

    setUsers(prev => [...prev, newStaff]);
    syncDocumentToFirestore('users', newStaff.id, newStaff);

    logAudit(
      'ADD_STAFF',
      'USER',
      `STAFF-${newStaff.staffId}`,
      `Super Admin ${currentUser.name} onboarded new staff: ${newStaff.name} (ID: ${newStaff.staffId}, Role: ${newStaff.role}, Designation: ${newStaff.designation}). Default password set to Staff ID.`
    );

    return { success: true, message: `Staff ${newStaff.name} (ID: ${newStaff.staffId}) added successfully! Default password is their Staff ID "${defaultPass}".`, user: newStaff };
  };

  // Super Admin: Remove Staff Member (kew chole gele bad deowa)
  const removeStaff = (targetStaffId: string): { success: boolean; message: string } => {
    if (!isSuperAdmin && !isManagement) {
      return { success: false, message: 'Only Super Admin (Murshida Akhter Kanta) can remove staff members.' };
    }

    const target = users.find(u => u.staffId === targetStaffId);
    if (!target) return { success: false, message: 'Staff member not found.' };
    if (target.staffId === '1002') return { success: false, message: 'Super Admin Murshida Akhter Kanta cannot be removed.' };

    setUsers(prev => prev.filter(u => u.staffId !== targetStaffId));

    logAudit(
      'REMOVE_STAFF',
      'USER',
      `STAFF-${target.staffId}`,
      `Super Admin ${currentUser.name} removed staff ${target.name} (ID: ${target.staffId}) from system directory.`
    );

    return { success: true, message: `Staff member ${target.name} (ID: ${target.staffId}) has been removed.` };
  };

  // Super Admin: Deactivate/Activate Staff Member
  const toggleStaffStatus = (targetStaffId: string): { success: boolean; message: string; newStatus: string } => {
    if (!isSuperAdmin && !isManagement) {
      return { success: false, message: 'Only Super Admin can change staff status.', newStatus: '' };
    }

    const target = users.find(u => u.staffId === targetStaffId);
    if (!target) return { success: false, message: 'Staff member not found.', newStatus: '' };
    if (target.staffId === '1002') return { success: false, message: 'Super Admin cannot be deactivated.', newStatus: 'ACTIVE' };

    const newStatus = target.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    setUsers(prev => prev.map(u => u.staffId === targetStaffId ? { ...u, status: newStatus } : u));

    logAudit(
      'DEACTIVATE_STAFF',
      'USER',
      `STAFF-${target.staffId}`,
      `Super Admin ${currentUser.name} set staff ${target.name} (ID: ${target.staffId}) status to ${newStatus}.`
    );

    return { 
      success: true, 
      message: `Staff member ${target.name} is now ${newStatus === 'ACTIVE' ? 'Active' : 'Inactive (Deactivated)'}.`,
      newStatus 
    };
  };

  // Super Admin / HR: Reset Password for any staff (password vule gele reset kora - password tar EID hobe)
  const resetStaffPassword = (targetStaffId: string, customPassword?: string): { success: boolean; message: string; password: string } => {
    if (!isSuperAdmin && !isManagement && currentUser.staffId !== targetStaffId) {
      return { success: false, message: 'Only Super Admin / HR (Murshida Akhter Kanta) can reset employee passwords.', password: '' };
    }

    const target = users.find(u => u.staffId === targetStaffId);
    if (!target) return { success: false, message: 'Staff member not found.', password: '' };

    // Default reset password is target's Employee ID (Staff ID / EID)
    const newPass = customPassword?.trim() || target.staffId;
    setUsers(prev => prev.map(u => u.staffId === targetStaffId ? { ...u, password: newPass, mustChangePassword: true } : u));

    logAudit(
      'RESET_PASSWORD',
      'USER',
      `STAFF-${target.staffId}`,
      `Password for ${target.name} (ID: ${target.staffId}) was reset to Staff ID "${newPass}" by HR ${currentUser.name}. Mandatory password change flagged for next login.`
    );

    return { 
      success: true, 
      message: `${target.name} (ID: ${target.staffId})-এর পাসওয়ার্ড তার স্টাফ আইডি "${newPass}"-এ রিসেট করা হয়েছে। লগইনের পর পাসওয়ার্ড পরিবর্তন করতে বলা হবে।`,
      password: newPass
    };
  };

  // Add Dynamic Sub-Branch under a Branch
  const addSubBranch = (branchId: string, subData: {
    name: string;
    code: string;
    inChargeStaffId?: string;
    inChargeName?: string;
    phone?: string;
    description?: string;
  }) => {
    const parentBranch = branches.find(b => b.id === branchId);
    if (!parentBranch) return null;

    const newSub: SubBranch = {
      id: `sub-${Date.now()}`,
      branchId,
      branchName: parentBranch.name,
      name: subData.name,
      code: subData.code.toUpperCase(),
      inChargeStaffId: subData.inChargeStaffId || currentUser.staffId,
      inChargeName: subData.inChargeName || currentUser.name,
      phone: subData.phone || parentBranch.phone,
      description: subData.description || '',
      status: 'ACTIVE',
      createdAt: new Date().toISOString().substring(0, 10),
    };

    setSubBranches(prev => [newSub, ...prev]);

    setBranches(prev => prev.map(b => {
      if (b.id === branchId) {
        return {
          ...b,
          subUnits: b.subUnits ? [...b.subUnits, newSub.name] : [newSub.name],
        };
      }
      return b;
    }));

    syncDocumentToFirestore('subBranches', newSub.id, newSub);

    logAudit(
      'ADD_SUB_BRANCH',
      'SUB_BRANCH',
      newSub.code,
      `Added sub-branch "${newSub.name}" under ${parentBranch.name}`
    );

    return newSub;
  };

  // 1. Branch submits Fund Request -> status: 'PENDING_VERIFICATION'
  const addFundRequest = (data: {
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
    bankDetails?: FundRequest['bankDetails'];
    mfsDetails?: FundRequest['mfsDetails'];
  }) => {
    const branch = branches.find(b => b.id === data.branchId);
    const sub = subBranches.find(s => s.id === data.subBranchId);
    const proj = projects.find(p => p.id === data.projectId);

    const count = fundRequests.length + 1;
    const requestNumber = generateRequisitionCode(count, data.category);

    const newReq: FundRequest = {
      id: `req-${Date.now()}`,
      requestNumber,
      branchId: data.branchId,
      branchName: branch ? branch.name : (currentUser.branchName || 'Branch'),
      subBranchId: data.subBranchId,
      subBranchName: sub ? sub.name : undefined,
      requestedByUserId: currentUser.id,
      requestedByStaffId: currentUser.staffId,
      requestedByName: currentUser.name,
      projectId: data.projectId,
      projectName: proj ? proj.name : undefined,
      category: data.category,
      amount: data.amount,
      purpose: data.purpose,
      urgency: data.urgency,
      preferredPaymentMethod: data.preferredPaymentMethod,
      isEventProgram: data.isEventProgram,
      eventDetails: data.eventDetails,
      isAdvanceRequisition: data.isAdvanceRequisition || Boolean(data.isEventProgram),
      advanceSettled: false,
      bankDetails: data.bankDetails,
      mfsDetails: data.mfsDetails,
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFundRequests(prev => [newReq, ...prev]);

    // Save to Firestore
    syncDocumentToFirestore('fundRequests', newReq.id, newReq);

    // Notify Central Accounts
    sendNotification({
      title: 'New Fund Requisition Submitted',
      titleBn: 'নতুন ফান্ড রিকুইজিশন জমা হয়েছে',
      message: `${newReq.branchName} requested BDT ${data.amount.toLocaleString()} for ${data.category}. Verification required.`,
      messageBn: `${newReq.branchName} হতে ৳${data.amount.toLocaleString()} এর ফান্ড রিকুইজিশন এসেছে। অ্যাকাউন্টস যাচাই প্রয়োজন।`,
      type: 'FUND_REQUEST',
      targetRole: 'CENTRAL_ACCOUNTS',
      linkTab: 'fund-requests',
    });

    logAudit(
      'SUBMIT_FUND_REQUEST',
      'FUND_REQUEST',
      requestNumber,
      `Requisition ${requestNumber} for BDT ${data.amount.toLocaleString()} submitted by ${currentUser.name}`
    );

    return newReq;
  };

  // 2. Central Accounts verifies Fund Request -> status: 'VERIFIED_BY_ACCOUNTS'
  const verifyFundRequestByAccounts = (requestId: string, verificationNotes: string) => {
    if (isBranchRep) return;

    const req = fundRequests.find(r => r.id === requestId);
    if (!req) return;

    const updated = {
      status: 'VERIFIED_BY_ACCOUNTS' as const,
      verifiedBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        name: currentUser.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        notes: verificationNotes || 'Accounts department verification complete. Forwarded for Management approval.',
      },
      updatedAt: new Date().toISOString(),
    };

    setFundRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updated } : r));
    syncDocumentToFirestore('fundRequests', requestId, updated);

    // Notify Management (Founder & ED / Director)
    sendNotification({
      title: 'Requisition Awaiting Management Approval',
      titleBn: 'ম্যানেজমেন্ট অনুমোদনের অপেক্ষায় রিকুইজিশন',
      message: `${req.requestNumber} (${req.branchName} - ৳${req.amount.toLocaleString()}) verified by Accounts. Ready for final approval.`,
      messageBn: `${req.requestNumber} (${req.branchName} - ৳${req.amount.toLocaleString()}) অ্যাকাউন্টস যাচাই করেছে। চূড়ান্ত অনুমোদনের জন্য প্রস্তুত।`,
      type: 'APPROVAL',
      targetRole: 'MANAGEMENT',
      linkTab: 'fund-requests',
    });

    logAudit(
      'VERIFY_FUND_REQUEST',
      'FUND_REQUEST',
      req.requestNumber,
      `Accounts verified requisition ${req.requestNumber} (৳${req.amount.toLocaleString()}). Notes: ${verificationNotes}`
    );
  };

  // 3. Management sanctions final approval -> status: 'APPROVED_BY_MANAGEMENT'
  const approveFundRequestByManagement = (requestId: string, managementNotes: string) => {
    if (!isManagement) return;

    const req = fundRequests.find(r => r.id === requestId);
    if (!req) return;

    const updated = {
      status: 'APPROVED_BY_MANAGEMENT' as const,
      approvedBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        name: currentUser.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        notes: managementNotes || 'Sanctioned by Management (ED / Director)',
      },
      updatedAt: new Date().toISOString(),
    };

    setFundRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updated } : r));
    syncDocumentToFirestore('fundRequests', requestId, updated);

    // Notify Branch Rep & Accounts
    sendNotification({
      title: 'Fund Requisition Approved by Management',
      titleBn: 'ম্যানেজমেন্ট কর্তৃক ফান্ড অনুমোদিত হয়েছে',
      message: `${req.requestNumber} (৳${req.amount.toLocaleString()}) approved by ${currentUser.name}. Ready for disbursement.`,
      messageBn: `${req.requestNumber} (৳${req.amount.toLocaleString()}) ম্যানেজমেন্ট অনুমোদন করেছে। অ্যাকাউন্টস খুব শীঘ্রই বিতরণ করবে।`,
      type: 'APPROVAL',
      targetRole: 'BRANCH_REP',
      targetBranchId: req.branchId,
      linkTab: 'fund-requests',
    });

    sendNotification({
      title: 'Requisition Approved: Ready to Disburse',
      titleBn: 'অনুমোদিত রিকুইজিশন: তহবিল বিতরণের জন্য প্রস্তুত',
      message: `Management approved ${req.requestNumber} for ${req.branchName} (৳${req.amount.toLocaleString()}). Proceed with disbursement.`,
      messageBn: `ম্যানেজমেন্ট ${req.requestNumber} অনুমোদন করেছে। অ্যাকাউন্টস হতে বিতরণ সম্পন্ন করুন।`,
      type: 'APPROVAL',
      targetRole: 'CENTRAL_ACCOUNTS',
      linkTab: 'fund-requests',
    });

    logAudit(
      'APPROVE_FUND_REQUEST',
      'FUND_REQUEST',
      req.requestNumber,
      `Management approved requisition ${req.requestNumber} (৳${req.amount.toLocaleString()}). Notes: ${managementNotes}`
    );
  };

  // 4. Accounts disburses money -> status: 'DISBURSED'
  const disburseFundRequest = (requestId: string, paymentMethod: FundSourceMethod) => {
    if (isBranchRep) return;

    const req = fundRequests.find(r => r.id === requestId);
    if (!req || req.status !== 'APPROVED_BY_MANAGEMENT') return;

    const count = vouchers.length + 1;
    const voucherNumber = generateVoucherCode(
      count, 
      req.category, 
      paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'PETTY_CASH_FLOAT'
    );
    const disburseVoucher: TransactionVoucher = {
      id: `vch-${Date.now()}`,
      voucherNumber,
      type: paymentMethod === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'PETTY_CASH_FLOAT',
      title: `Disbursement for ${req.requestNumber}: ${req.purpose.substring(0, 45)}`,
      amount: req.amount,
      date: new Date().toISOString().substring(0, 10),
      branchId: req.branchId,
      branchName: req.branchName,
      subBranchId: req.subBranchId,
      subBranchName: req.subBranchName,
      projectId: req.projectId,
      projectName: req.projectName,
      fundSourceMethod: paymentMethod,
      category: req.category,
      bankDetails: req.bankDetails,
      mfsDetails: req.mfsDetails,
      notes: `Disbursed against requisition ${req.requestNumber}. Verified by ${req.verifiedBy?.name}, approved by ${req.approvedBy?.name}.`,
      status: 'APPROVED',
      createdBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        role: currentUser.role,
      },
      approvedBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVouchers(prev => [disburseVoucher, ...prev]);

    const updatedReq = {
      status: 'DISBURSED' as const,
      disbursedVoucherId: disburseVoucher.id,
      disbursedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString(),
    };

    setFundRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updatedReq } : r));

    // Credit branch bank balance or cash float
    setBranches(prev => prev.map(b => {
      if (b.id === req.branchId) {
        if (paymentMethod === 'BANK_TRANSFER') {
          return { ...b, bankBalance: b.bankBalance + req.amount, totalAllocated: b.totalAllocated + req.amount };
        } else {
          return { ...b, currentCashFloat: b.currentCashFloat + req.amount };
        }
      }
      return b;
    }));

    syncDocumentToFirestore('vouchers', disburseVoucher.id, disburseVoucher);
    syncDocumentToFirestore('fundRequests', requestId, updatedReq);

    // Notify Branch
    sendNotification({
      title: 'Funds Disbursed to Branch',
      titleBn: 'তহবিল বিতরণ সম্পন্ন হয়েছে',
      message: `৳${req.amount.toLocaleString()} disbursed via ${paymentMethod} (Voucher ${voucherNumber}). Float updated.`,
      messageBn: `৳${req.amount.toLocaleString()} বিতরণ করা হয়েছে (${paymentMethod})। ভাউচার: ${voucherNumber}`,
      type: 'APPROVAL',
      targetRole: 'BRANCH_REP',
      targetBranchId: req.branchId,
      linkTab: 'branch-portal',
    });

    logAudit(
      'DISBURSE_FUND',
      'FUND_REQUEST',
      req.requestNumber,
      `Disbursed BDT ${req.amount.toLocaleString()} to ${req.branchName} via ${paymentMethod} (${voucherNumber})`
    );
  };

  // Reject Fund Request
  const rejectFundRequest = (requestId: string, reason: string) => {
    if (isBranchRep) return;

    const req = fundRequests.find(r => r.id === requestId);
    if (!req) return;

    const updated = {
      status: 'REJECTED' as const,
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    };

    setFundRequests(prev => prev.map(r => r.id === requestId ? { ...r, ...updated } : r));
    syncDocumentToFirestore('fundRequests', requestId, updated);

    // Notify Branch
    sendNotification({
      title: 'Requisition Rejected',
      titleBn: 'রিকুইজিশন প্রত্যাখ্যাত হয়েছে',
      message: `Requisition ${req.requestNumber} was rejected. Reason: ${reason}`,
      messageBn: `রিকুইজিশন ${req.requestNumber} প্রত্যাখ্যাত হয়েছে। কারণ: ${reason}`,
      type: 'APPROVAL',
      targetRole: 'BRANCH_REP',
      targetBranchId: req.branchId,
      linkTab: 'fund-requests',
    });

    logAudit(
      'REJECT_FUND_REQUEST',
      'FUND_REQUEST',
      req.requestNumber,
      `Rejected requisition ${req.requestNumber}. Reason: ${reason}`
    );
  };

  // Add Voucher (Expense, Donation, Transfer, Advance Adjustment)
  // CRITICAL CONSTRAINT: Branch Rep CANNOT record donation or income! Branch Rep can record expenses and advance adjustments!
  const addVoucher = (newVoucherData: Omit<TransactionVoucher, 'id' | 'voucherNumber' | 'createdAt' | 'updatedAt' | 'createdBy' | 'status'>) => {
    // If Branch Rep, allow EXPENSE_PROCUREMENT or ADVANCE_ADJUSTMENT, strictly enforce their branchId
    const safeType = isBranchRep 
      ? (newVoucherData.type === 'ADVANCE_ADJUSTMENT' ? 'ADVANCE_ADJUSTMENT' : 'EXPENSE_PROCUREMENT') 
      : newVoucherData.type;
    const safeBranchId = isBranchRep ? (userBranchId || newVoucherData.branchId) : newVoucherData.branchId;

    const branchObj = branches.find(b => b.id === safeBranchId);
    const count = vouchers.length + 1;
    const voucherNumber = generateVoucherCode(count, newVoucherData.category, safeType);

    const isAutoApproved = isCentralAccounts || isManagement;

    const newVoucher: TransactionVoucher = {
      ...newVoucherData,
      type: safeType,
      branchId: safeBranchId,
      branchName: branchObj ? branchObj.name : newVoucherData.branchName,
      id: `vch-${Date.now()}`,
      voucherNumber,
      status: isAutoApproved ? 'APPROVED' : 'SUBMITTED',
      createdBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        role: currentUser.role,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvedBy: isAutoApproved ? {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      } : undefined,
    };

    setVouchers(prev => [newVoucher, ...prev]);

    if (newVoucher.status === 'APPROVED') {
      applyVoucherImpact(newVoucher);
    } else {
      // If submitted by branch, notify Central Accounts for approval
      sendNotification({
        title: safeType === 'ADVANCE_ADJUSTMENT' ? 'New Advance Adjustment Voucher Submitted' : 'New Expense Voucher Submitted',
        titleBn: safeType === 'ADVANCE_ADJUSTMENT' ? 'নতুন অগ্রিম সমন্বয় ভাউচার জমা হয়েছে' : 'নতুন খরচের ভাউচার জমা হয়েছে',
        message: `${newVoucher.branchName} submitted voucher ${voucherNumber} for BDT ${newVoucher.amount.toLocaleString()} (${newVoucher.category}). Approval required.`,
        messageBn: `${newVoucher.branchName} শাখা ৳${newVoucher.amount.toLocaleString()} এর ভাউচার জমা দিয়েছে (${voucherNumber})। অ্যাকাউন্টস অনুমোদন প্রয়োজন।`,
        type: 'VOUCHER',
        targetRole: 'CENTRAL_ACCOUNTS',
        linkTab: 'vouchers',
      });
    }

    syncDocumentToFirestore('vouchers', newVoucher.id, newVoucher);

    logAudit(
      newVoucher.type === 'ADVANCE_ADJUSTMENT' ? 'ADVANCE_ADJUSTMENT' : 'CREATE',
      'VOUCHER',
      voucherNumber,
      `Logged ${newVoucher.type === 'ADVANCE_ADJUSTMENT' ? 'advance adjustment voucher' : 'voucher'} ${voucherNumber} (BDT ${newVoucher.amount.toLocaleString()}) for ${newVoucher.branchName}`
    );

    return newVoucher;
  };

  const applyVoucherImpact = (voucher: TransactionVoucher) => {
    // Both standard procurement expense and advance adjustment impact project budget and cash float
    if ((voucher.type === 'EXPENSE_PROCUREMENT' || voucher.type === 'ADVANCE_ADJUSTMENT') && voucher.projectId) {
      setProjects(prev => prev.map(p => {
        if (p.id === voucher.projectId) {
          const updatedAllocations = p.branchAllocations.map(ba => {
            if (ba.branchId === voucher.branchId) {
              return { ...ba, spentAmount: ba.spentAmount + voucher.amount };
            }
            return ba;
          });
          return {
            ...p,
            spentBudget: p.spentBudget + voucher.amount,
            branchAllocations: updatedAllocations,
          };
        }
        return p;
      }));

      setBranches(prev => prev.map(b => {
        if (b.id === voucher.branchId) {
          // If advance adjustment has unspent surplus returned to branch cash float
          const returnedToFloat = (voucher.advanceAdjustment?.adjustmentType === 'SURPLUS_RETURNED' && voucher.advanceAdjustment.returnedMethod === 'CASH')
            ? (voucher.advanceAdjustment.balanceAmount || 0)
            : 0;

          return {
            ...b,
            totalSpent: b.totalSpent + voucher.amount,
            currentCashFloat: voucher.fundSourceMethod === 'CASH' 
              ? Math.max(0, b.currentCashFloat - voucher.amount + returnedToFloat) 
              : (b.currentCashFloat + returnedToFloat),
            bankBalance: voucher.fundSourceMethod === 'BANK_TRANSFER' ? Math.max(0, b.bankBalance - voucher.amount) : b.bankBalance,
          };
        }
        return b;
      }));
    } else if (voucher.type === 'DONATION_INCOME') {
      if (voucher.donorId) {
        setDonors(prev => prev.map(d => d.id === voucher.donorId ? { ...d, totalContributed: d.totalContributed + voucher.amount } : d));
      }
    } else if (voucher.type === 'PETTY_CASH_FLOAT') {
      setBranches(prev => prev.map(b => {
        if (b.id === voucher.branchId) {
          return { ...b, currentCashFloat: b.currentCashFloat + voucher.amount };
        }
        return b;
      }));
    } else if (voucher.type === 'INTER_BRANCH_TRANSFER') {
      setBranches(prev => prev.map(b => {
        if (b.id === voucher.branchId) {
          return { ...b, totalSpent: b.totalSpent + voucher.amount };
        }
        if (b.id === voucher.targetBranchId) {
          return { ...b, totalAllocated: b.totalAllocated + voucher.amount };
        }
        return b;
      }));
    }

    // If this voucher settles an advance requisition, update the requisition's settlement status
    if (voucher.advanceAdjustment?.advanceRequisitionNumber) {
      const reqRef = voucher.advanceAdjustment.advanceRequisitionNumber;
      setFundRequests(prev => prev.map(r => {
        if (r.requestNumber === reqRef || r.id === reqRef) {
          const updatedReq = {
            ...r,
            advanceSettled: true,
            settledVoucherId: voucher.id,
            settledVoucherNumber: voucher.voucherNumber,
            updatedAt: new Date().toISOString(),
          };
          syncDocumentToFirestore('fundRequests', r.id, updatedReq);
          return updatedReq;
        }
        return r;
      }));
    }
  };

  // Accounts approves branch expense voucher
  const approveVoucher = (voucherId: string) => {
    if (isBranchRep) return;

    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher || voucher.status === 'APPROVED') return;

    const updated = {
      status: 'APPROVED' as const,
      approvedBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      updatedAt: new Date().toISOString(),
    };

    setVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, ...updated } : v));
    applyVoucherImpact(voucher);
    syncDocumentToFirestore('vouchers', voucherId, updated);

    // Notify Branch Rep
    sendNotification({
      title: 'Expense Voucher Approved',
      titleBn: 'খরচের ভাউচার অনুমোদিত হয়েছে',
      message: `Voucher ${voucher.voucherNumber} (BDT ${voucher.amount.toLocaleString()}) approved by Accountant ${currentUser.name}.`,
      messageBn: `ভাউচার ${voucher.voucherNumber} (৳${voucher.amount.toLocaleString()}) হিসাবরক্ষক ${currentUser.name} কর্তৃক অনুমোদিত হয়েছে।`,
      type: 'VOUCHER',
      targetRole: 'BRANCH_REP',
      targetBranchId: voucher.branchId,
      linkTab: 'branch-portal',
    });

    logAudit(
      'APPROVE',
      'VOUCHER',
      voucher.voucherNumber,
      `Audited & approved voucher ${voucher.voucherNumber} for BDT ${voucher.amount.toLocaleString()}`
    );
  };

  // Reject voucher
  const rejectVoucher = (voucherId: string, reason: string) => {
    if (isBranchRep) return;

    const voucher = vouchers.find(v => v.id === voucherId);
    if (!voucher) return;

    const updated = {
      status: 'REJECTED' as const,
      notes: `${voucher.notes} [REJECT REASON: ${reason}]`,
      updatedAt: new Date().toISOString(),
    };

    setVouchers(prev => prev.map(v => v.id === voucherId ? { ...v, ...updated } : v));
    syncDocumentToFirestore('vouchers', voucherId, updated);

    sendNotification({
      title: 'Voucher Rejected by Accounts',
      titleBn: 'ভাউচার প্রত্যাখ্যাত হয়েছে',
      message: `Voucher ${voucher.voucherNumber} was rejected. Reason: ${reason}`,
      messageBn: `ভাউচার ${voucher.voucherNumber} প্রত্যাখ্যাত হয়েছে। কারণ: ${reason}`,
      type: 'VOUCHER',
      targetRole: 'BRANCH_REP',
      targetBranchId: voucher.branchId,
      linkTab: 'branch-portal',
    });

    logAudit(
      'REJECT',
      'VOUCHER',
      voucher.voucherNumber,
      `Rejected voucher ${voucher.voucherNumber}. Reason: ${reason}`
    );
  };

  const reallocateProjectBudget = (
    projectId: string, 
    branchAllocations: Project['branchAllocations'], 
    totalBudget: number,
    notes: string
  ) => {
    if (isBranchRep) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const prevBudget = project.totalBudget;

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          totalBudget,
          branchAllocations,
          reconciliationNotes: notes ? `${p.reconciliationNotes || ''}\n[${new Date().toLocaleDateString()}]: ${notes}` : p.reconciliationNotes,
        };
      }
      return p;
    }));

    branchAllocations.forEach(ba => {
      setBranches(prev => prev.map(b => {
        if (b.id === ba.branchId) {
          return { ...b, totalAllocated: b.totalAllocated + (ba.allocatedAmount - (project.branchAllocations.find(x => x.branchId === ba.branchId)?.allocatedAmount || 0)) };
        }
        return b;
      }));
    });

    syncDocumentToFirestore('projects', projectId, {
      totalBudget,
      branchAllocations,
      reconciliationNotes: notes ? `${project.reconciliationNotes || ''}\n[${new Date().toLocaleDateString()}]: ${notes}` : project.reconciliationNotes,
    });

    logAudit(
      'REALLOCATE',
      'BUDGET',
      project.code,
      `Re-allocated budget for ${project.name}: BDT ${prevBudget.toLocaleString()} -> BDT ${totalBudget.toLocaleString()}`
    );
  };

  const closeProject = (projectId: string, reconciliationNotes: string) => {
    if (isBranchRep) return;

    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          status: 'CLOSED',
          reconciliationNotes: `Project formally closed on ${new Date().toISOString().substring(0, 10)}. Final Reconciliation: ${reconciliationNotes}`,
        };
      }
      return p;
    }));

    syncDocumentToFirestore('projects', projectId, {
      status: 'CLOSED',
      reconciliationNotes: `Project formally closed on ${new Date().toISOString().substring(0, 10)}. Final Reconciliation: ${reconciliationNotes}`,
    });

    logAudit(
      'CLOSE_PROJECT',
      'PROJECT',
      project.code,
      `Formally closed project ${project.name} (${project.code})`
    );
  };

  const createProject = (newProjectData: Omit<Project, 'id' | 'spentBudget'>) => {
    if (isBranchRep) return;

    const newProject: Project = {
      ...newProjectData,
      id: `proj-${Date.now()}`,
      spentBudget: 0,
    };

    setProjects(prev => [newProject, ...prev]);

    newProject.branchAllocations.forEach(ba => {
      setBranches(prev => prev.map(b => {
        if (b.id === ba.branchId) {
          return { ...b, totalAllocated: b.totalAllocated + ba.allocatedAmount, activeProjectsCount: b.activeProjectsCount + 1 };
        }
        return b;
      }));
    });

    syncDocumentToFirestore('projects', newProject.id, newProject);

    logAudit(
      'CREATE',
      'PROJECT',
      newProject.code,
      `Created project ${newProject.name} with total budget BDT ${newProject.totalBudget.toLocaleString()}`
    );
  };

  const addBranch = (newBranchData: Omit<Branch, 'id' | 'totalSpent' | 'activeProjectsCount' | 'currentCashFloat'> & { initialCashFloat: number }) => {
    if (isBranchRep) return;

    const newBranch: Branch = {
      id: `br-${Date.now()}`,
      name: newBranchData.name,
      code: newBranchData.code,
      address: newBranchData.address,
      contactPerson: newBranchData.contactPerson,
      phone: newBranchData.phone,
      bankBalance: newBranchData.bankBalance,
      currentCashFloat: newBranchData.initialCashFloat,
      totalAllocated: newBranchData.totalAllocated,
      totalSpent: 0,
      activeProjectsCount: 0,
      status: 'ACTIVE',
    };

    setBranches(prev => [...prev, newBranch]);

    const newStaffId = String(1000 + users.length + 10);
    const repUser: User = {
      id: `usr-rep-${newBranch.id}`,
      staffId: newStaffId,
      name: `${newBranchData.contactPerson}`,
      email: `rep.${newBranch.code.toLowerCase()}@leedo.org`,
      password: 'leedo',
      role: 'BRANCH_REP',
      branchId: newBranch.id,
      branchName: newBranch.name,
      designation: 'Branch Accounts Rep',
    };

    setUsers(prev => [...prev, repUser]);
    syncDocumentToFirestore('branches', newBranch.id, newBranch);

    logAudit(
      'CREATE',
      'BRANCH',
      newBranch.code,
      `Registered branch: ${newBranch.name} (${newBranch.code})`
    );
  };

  const addPettyCashLog = (data: Omit<PettyCashRecord, 'id'>) => {
    const record: PettyCashRecord = {
      ...data,
      id: `pc-${Date.now()}`,
    };
    setPettyCashLogs(prev => [record, ...prev]);

    setBranches(prev => prev.map(b => {
      if (b.id === data.branchId) {
        return { ...b, currentCashFloat: data.closingBalance };
      }
      return b;
    }));

    logAudit(
      'UPDATE',
      'VOUCHER',
      `PETTY-${data.branchName}`,
      `Reconciled petty cash for ${data.branchName}: Closing Float BDT ${data.closingBalance.toLocaleString()}`
    );
  };

  // Disburse Payroll (Staff Salary & Festival Bonus)
  const disbursePayroll = (data: {
    staffId: string;
    staffName: string;
    monthYear: string;
    payrollType: 'SALARY' | 'BONUS' | 'BOTH';
    salaryAmount: number;
    bonusAmount?: number;
    conveyanceAmount?: number;
    paymentMethod: FundSourceMethod;
    bankDetails?: TransactionVoucher['bankDetails'];
    mfsDetails?: TransactionVoucher['mfsDetails'];
    receiptUrl?: string;
    receiptType?: 'image' | 'pdf';
    receiptFileName?: string;
    notes?: string;
  }) => {
    const totalAmount = data.salaryAmount + (data.bonusAmount || 0) + (data.conveyanceAmount || 0);
    const category: ExpenseCategory = data.payrollType === 'BONUS'
      ? 'Festival Bonus & Eid/Puja Allowance (উৎসব বোনাস ও ভাতা)'
      : 'Staff Salary & Monthly Payroll (কর্মীদের মাসিক বেতন)';

    const count = vouchers.length + 1;
    const voucherNumber = generateVoucherCode(count, category, 'EXPENSE_PROCUREMENT');

    const items: TransactionVoucher['items'] = [];
    if (data.salaryAmount > 0) {
      items.push({
        id: `sal-${Date.now()}-1`,
        description: `Monthly Salary (${data.monthYear}) - ${data.staffName} (Staff ID: ${data.staffId})`,
        quantity: 1,
        unit: 'Month',
        unitPrice: data.salaryAmount,
        totalPrice: data.salaryAmount,
      });
    }
    if (data.bonusAmount && data.bonusAmount > 0) {
      items.push({
        id: `sal-${Date.now()}-2`,
        description: `Festival Bonus / Allowance (${data.monthYear}) - ${data.staffName}`,
        quantity: 1,
        unit: 'Allowance',
        unitPrice: data.bonusAmount,
        totalPrice: data.bonusAmount,
      });
    }
    if (data.conveyanceAmount && data.conveyanceAmount > 0) {
      items.push({
        id: `sal-${Date.now()}-3`,
        description: `Staff Conveyance & Travel Allowance - ${data.staffName}`,
        quantity: 1,
        unit: 'Allowance',
        unitPrice: data.conveyanceAmount,
        totalPrice: data.conveyanceAmount,
      });
    }

    const targetStaff = users.find(u => u.staffId === data.staffId);
    const targetBranch = branches.find(b => b.id === targetStaff?.branchId) || branches[0];

    const payrollVoucher: TransactionVoucher = {
      id: `vch-pay-${Date.now()}`,
      voucherNumber,
      type: 'EXPENSE_PROCUREMENT',
      title: `${data.payrollType === 'BONUS' ? 'Festival Bonus' : 'Staff Salary'} (${data.monthYear}): ${data.staffName} (ID: ${data.staffId})`,
      amount: totalAmount,
      date: new Date().toISOString().substring(0, 10),
      branchId: targetBranch?.id || 'br-kamalapur',
      branchName: targetBranch?.name || 'Head Office',
      fundSourceMethod: data.paymentMethod,
      category,
      bankDetails: data.bankDetails,
      mfsDetails: data.mfsDetails,
      items,
      receiptUrl: data.receiptUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
      receiptType: data.receiptType || 'image',
      receiptFileName: data.receiptFileName || `salary_sheet_${data.staffId}_${data.monthYear.replace(' ', '_')}.pdf`,
      notes: data.notes || `Disbursed ${data.monthYear} payroll for ${data.staffName} (Staff ID: ${data.staffId}). Authorized by Super Admin Murshida Akhter Kanta.`,
      status: 'APPROVED',
      createdBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        role: currentUser.role,
      },
      approvedBy: {
        userId: currentUser.id,
        staffId: currentUser.staffId,
        userName: currentUser.name,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setVouchers(prev => [payrollVoucher, ...prev]);
    applyVoucherImpact(payrollVoucher);
    syncDocumentToFirestore('vouchers', payrollVoucher.id, payrollVoucher);

    logAudit(
      'PAYROLL_DISBURSEMENT',
      'VOUCHER',
      voucherNumber,
      `Disbursed BDT ${totalAmount.toLocaleString()} to staff ${data.staffName} (Staff ID: ${data.staffId}) for ${data.monthYear} (${voucherNumber})`
    );

    return payrollVoucher;
  };

  const resetAllData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-1004');
    setIsLoggedIn(true);
    setBranches(INITIAL_BRANCHES);
    setSubBranches(INITIAL_SUB_BRANCHES);
    setDonors(INITIAL_DONORS);
    setProjects(INITIAL_PROJECTS);
    setVouchers(INITIAL_VOUCHERS);
    setFundRequests(INITIAL_FUND_REQUESTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setPettyCashLogs(INITIAL_PETTY_CASH_RECORDS);
  };

  return {
    users,
    currentUser,
    isLoggedIn,
    language,
    setLanguage,
    loginWithCredentials,
    logout,
    changePassword,
    setCurrentUserId,
    isSuperAdmin,
    isManagement,
    isCentralAccounts,
    isBranchRep,
    userBranchId,
    branches,
    visibleBranches,
    subBranches,
    visibleSubBranches,
    donors,
    projects,
    visibleProjects,
    vouchers,
    visibleVouchers,
    branchExpensesOnly,
    fundRequests,
    visibleFundRequests,
    notifications: userNotifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    auditLogs,
    pettyCashLogs,
    firebaseStatus,
    addSubBranch,
    addStaff,
    removeStaff,
    toggleStaffStatus,
    resetStaffPassword,
    disbursePayroll,
    addFundRequest,
    verifyFundRequestByAccounts,
    approveFundRequestByManagement,
    rejectFundRequest,
    disburseFundRequest,
    addVoucher,
    approveVoucher,
    rejectVoucher,
    createProject,
    reallocateProjectBudget,
    closeProject,
    addBranch,
    addPettyCashLog,
    resetAllData,
  };
}
