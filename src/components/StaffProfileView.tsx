import React, { useState } from 'react';
import { User, TransactionVoucher, FundRequest } from '../types';
import { 
  UserCheck, Shield, KeyRound, Building2, Mail, Phone, 
  Layers, CheckCircle2, Clock, LogOut, ArrowRight, Lock 
} from 'lucide-react';

interface StaffProfileViewProps {
  currentUser: User;
  vouchers: TransactionVoucher[];
  fundRequests: FundRequest[];
  onChangePassword: (newPassword: string) => { success: boolean; message: string };
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateToStaffManagement?: () => void;
}

export const StaffProfileView: React.FC<StaffProfileViewProps> = ({
  currentUser,
  vouchers,
  fundRequests,
  onChangePassword,
  onOpenLogin,
  onLogout,
  onNavigateToStaffManagement,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN' || currentUser.staffId === '1002';

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setMsg({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match. Please re-enter.' });
      return;
    }

    const res = onChangePassword(newPassword);
    if (res.success) {
      setMsg({ type: 'success', text: res.message });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMsg({ type: 'error', text: res.message });
    }
  };

  // Only vouchers created by THIS user
  const myVouchers = vouchers.filter(v => v.createdBy.staffId === currentUser.staffId);
  const myRequests = fundRequests.filter(r => r.requestedByStaffId === currentUser.staffId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-500/30">
              {currentUser.staffId}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                  Staff ID: {currentUser.staffId}
                </span>
              </div>
              <p className="text-xs text-red-400 font-semibold mt-0.5">{currentUser.designation}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  {currentUser.role === 'SUPER_ADMIN' ? 'Super Administrator (সর্বোচ্চ প্রশাসনিক ক্ষমতা)' :
                   currentUser.role === 'MANAGEMENT' ? 'Executive Management' :
                   currentUser.role === 'CENTRAL_ACCOUNTS' ? 'Central Accounts Department' : 'Branch Field Officer'}
                </span>
                {currentUser.branchName && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300 font-medium">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      {currentUser.branchName}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
            >
              <span>Switch Account</span>
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-xs font-semibold text-rose-300 border border-rose-800/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Assigned Units Pill if Branch Rep */}
        {currentUser.assignedUnits && currentUser.assignedUnits.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-red-400" />
              Assigned Sub-Branches & Operational Units (দায়িত্বপ্রাপ্ত ইউনিটসমূহ):
            </div>
            <div className="flex flex-wrap gap-2">
              {currentUser.assignedUnits.map((unit, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-800/80 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {unit}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Details & Official Metadata */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-400" />
            Official Contact & Record (অফিসিয়াল তথ্য)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" /> Email Address:
              </span>
              <span className="text-slate-200 font-mono font-medium">{currentUser.email}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" /> Official Phone:
              </span>
              <span className="text-slate-200 font-mono font-medium">{currentUser.phone || '+880 1711-XXXXXX'}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-500" /> System Role:
              </span>
              <span className="text-red-400 font-bold font-mono">{currentUser.role}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Total Vouchers Logged:</span>
              <span className="text-white font-mono font-bold">{myVouchers.length}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400">Total Requisitions Submitted:</span>
              <span className="text-white font-mono font-bold">{myRequests.length}</span>
            </div>
          </div>
        </div>

        {/* Change Account Password */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
              <Lock className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Change Account Password (পাসওয়ার্ড পরিবর্তন)</h3>
              <p className="text-[11px] text-slate-400">You can customize your login password anytime</p>
            </div>
          </div>

          {msg && (
            <div className={`p-3 rounded-xl text-xs font-semibold ${
              msg.type === 'success' 
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' 
                : 'bg-rose-950/60 text-rose-300 border border-rose-800'
            }`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">New Password (নতুন পাসওয়ার্ড)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new secure password (min 4 chars)"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-red-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Confirm New Password (পুনরায় লিখুন)</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-1 focus:ring-red-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-md shadow-red-950/50 transition-all cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>

      {/* Strictly Logged In Staff's Recent Activity */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>My Recent Submitted Entries ({currentUser.name})</span>
          <span className="text-xs text-slate-400 font-normal">Strictly your logged-in actions only</span>
        </h3>

        {myVouchers.length === 0 && myRequests.length === 0 ? (
          <div className="text-xs text-slate-500 py-6 text-center">No recent vouchers or requisitions submitted yet.</div>
        ) : (
          <div className="space-y-2">
            {myRequests.slice(0, 3).map(r => (
              <div key={r.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-red-400 font-bold mr-2">{r.requestNumber}</span>
                  <span className="text-slate-200 font-medium">{r.purpose.substring(0, 45)}...</span>
                  <span className="text-[10px] text-slate-500 ml-2">({r.category})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white font-bold">৳ {r.amount.toLocaleString()}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    r.status === 'APPROVED_BY_MANAGEMENT' || r.status === 'DISBURSED' ? 'bg-emerald-500/20 text-emerald-400' : 
                    r.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
            {myVouchers.slice(0, 3).map(v => (
              <div key={v.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-slate-400 font-bold mr-2">{v.voucherNumber}</span>
                  <span className="text-slate-300">{v.title}</span>
                  <span className="text-[10px] text-slate-500 ml-2">({v.category})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-white font-bold">৳ {v.amount.toLocaleString()}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                    {v.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
