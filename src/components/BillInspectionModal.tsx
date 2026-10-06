/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  X, Check, AlertCircle, FileText, Download, ZoomIn, ZoomOut, RotateCw, 
  Store, Phone, MapPin, Receipt, ShieldCheck, Printer, ExternalLink 
} from 'lucide-react';
import { TransactionVoucher, User } from '../types';
import { explainVoucherCode } from '../utils/voucherCode';

interface BillInspectionModalProps {
  voucher: TransactionVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onApproveVoucher?: (voucherId: string, auditNote?: string) => void;
  onRejectVoucher?: (voucherId: string, reason: string) => void;
  onSelectPrintVoucher?: (voucher: TransactionVoucher) => void;
  language?: 'en' | 'bn';
}

export const BillInspectionModal: React.FC<BillInspectionModalProps> = ({
  voucher,
  isOpen,
  onClose,
  currentUser,
  onApproveVoucher,
  onRejectVoucher,
  onSelectPrintVoucher,
  language = 'bn',
}) => {
  if (!isOpen || !voucher) return null;

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [auditNote, setAuditNote] = useState<string>('দোকানের ক্যাশ মেমো ও হিসাব যাচাই সম্পন্ন হয়েছে।');
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const isAccountsOrManagement = currentUser.role === 'CENTRAL_ACCOUNTS' || currentUser.role === 'MANAGEMENT';
  const isPdf = voucher.receiptFileType === 'pdf' || (voucher.receiptUrl && voucher.receiptUrl.toLowerCase().includes('.pdf'));
  const voucherCodeInfo = explainVoucherCode(voucher.voucherNumber);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.75));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleApprove = () => {
    if (onApproveVoucher) {
      onApproveVoucher(voucher.id, auditNote);
      onClose();
    }
  };

  const handleReject = () => {
    if (!rejectReason) {
      alert(language === 'bn' ? 'অনুগ্রহ করে বাতিলের কারণ লিখুন।' : 'Please enter rejection reason.');
      return;
    }
    if (onRejectVoucher) {
      onRejectVoucher(voucher.id, rejectReason);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-950/60 border border-red-800/60 text-red-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-white text-base tracking-wide">
                  {voucher.voucherNumber}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-red-900/60 border border-red-700/60 text-red-200">
                  {voucherCodeInfo.labelBn}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  voucher.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  voucher.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {voucher.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {language === 'bn' 
                  ? 'দোকানের ক্যাশ মেমো / বিল কপি অডিট ও ভেরিফিকেশন প্যানেল' 
                  : 'Shop Bill / Cash Memo Audit & Verification Inspector'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSelectPrintVoucher && (
              <button
                type="button"
                onClick={() => onSelectPrintVoucher(voucher)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ভাউচার প্রিন্ট' : 'Print Voucher'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Details & Right Document Inspector */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          
          {/* Left Panel: Voucher, Vendor & Audit Summary (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 bg-slate-950/60 overflow-y-auto">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'মোট ভাউচার টাকার পরিমাণ' : 'Total Voucher Amount'}
                </span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ৳ {voucher.amount.toLocaleString()}
                </span>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-400 block">{voucher.date}</span>
                <span className="font-semibold text-white">{voucher.branchName}</span>
              </div>
            </div>

            {/* Shop / Vendor Info Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
                <Store className="w-4 h-4 text-red-400" />
                <span>{language === 'bn' ? 'দোকানদার / ভেন্ডরের ক্যাশ মেমো তথ্য' : 'Vendor / Shop Memo Information'}</span>
              </div>

              {voucher.vendorDetails?.isVendorPayment ? (
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{language === 'bn' ? 'দোকানের নাম:' : 'Shop/Vendor:'}</span>
                    <span className="font-semibold text-white text-right">{voucher.vendorDetails.vendorName}</span>
                  </div>
                  {voucher.vendorDetails.invoiceNumber && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{language === 'bn' ? 'ক্যাশ মেমো / বিল #:' : 'Cash Memo / Bill #:'}</span>
                      <span className="font-mono font-bold text-amber-400">{voucher.vendorDetails.invoiceNumber}</span>
                    </div>
                  )}
                  {voucher.vendorDetails.contactPhone && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">{language === 'bn' ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                      <span className="font-mono text-slate-200 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        {voucher.vendorDetails.contactPhone}
                      </span>
                    </div>
                  )}
                  {voucher.vendorDetails.vendorAddress && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-slate-400 flex-shrink-0">{language === 'bn' ? 'দোকানের ঠিকানা:' : 'Address:'}</span>
                      <span className="text-right text-slate-300">{voucher.vendorDetails.vendorAddress}</span>
                    </div>
                  )}
                  {voucher.vendorDetails.tradeLicenseOrTin && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">{language === 'bn' ? 'ট্রেড লাইসেন্স / টিন:' : 'TIN / Trade License:'}</span>
                      <span className="font-mono text-[11px] text-slate-400">{voucher.vendorDetails.tradeLicenseOrTin}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-1">
                  {language === 'bn' ? 'সাধারণ পরিচালন ব্যয় বা স্টাফ ভাউচার।' : 'General operational or internal staff voucher.'}
                </div>
              )}
            </div>

            {/* Particulars & Category */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1.5">
              <div className="text-slate-400 font-semibold">{language === 'bn' ? 'খরচের বিবরণ ও খাত:' : 'Particulars & Category:'}</div>
              <div className="font-medium text-white">{voucher.title}</div>
              <div className="text-[11px] text-red-300 font-mono">{voucher.category}</div>
              {voucher.projectName && (
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  {language === 'bn' ? 'প্রকল্প:' : 'Project:'} <span className="text-slate-300">{voucher.projectName}</span>
                </div>
              )}
            </div>

            {/* Itemized Table if exists */}
            {voucher.items && voucher.items.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-200 block">
                  {language === 'bn' ? 'কেনাকাটার আইটেম তালিকা (মেমোর সাথে মিলিয়ে দেখুন)' : 'Itemized Purchase Breakdown'}
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="py-1.5 px-2">{language === 'bn' ? 'বিবরণ' : 'Item'}</th>
                        <th className="py-1.5 px-1 w-12 text-center">{language === 'bn' ? 'পরিমাণ' : 'Qty'}</th>
                        <th className="py-1.5 px-2 w-16 text-right">{language === 'bn' ? 'দর' : 'Rate'}</th>
                        <th className="py-1.5 px-2 w-20 text-right">{language === 'bn' ? 'মোট' : 'Total'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {voucher.items.map(item => (
                        <tr key={item.id}>
                          <td className="py-1.5 px-2 text-white">{item.description}</td>
                          <td className="py-1.5 px-1 text-center font-mono">{item.quantity} {item.unit}</td>
                          <td className="py-1.5 px-2 text-right font-mono">৳{item.unitPrice.toLocaleString()}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-semibold text-emerald-400">
                            ৳{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Audit Notes / Recorded By */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>{language === 'bn' ? 'এন্ট্রি করেছেন:' : 'Created By:'}</span>
                <span className="text-white font-medium">{voucher.createdBy.userName} (ID: {voucher.createdBy.staffId})</span>
              </div>
              {voucher.approvedBy && (
                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>{language === 'bn' ? 'অডিট ও অনুমোদনকারী:' : 'Approved By:'}</span>
                  <span className="text-emerald-400 font-medium">{voucher.approvedBy.userName} ({voucher.approvedBy.date})</span>
                </div>
              )}
              {voucher.notes && (
                <div className="text-slate-400 pt-1">
                  <span className="font-semibold text-slate-300">{language === 'bn' ? 'মন্তব্য:' : 'Notes:'}</span> {voucher.notes}
                </div>
              )}
            </div>

            {/* Central Accounts Verification & Approval Panel */}
            {isAccountsOrManagement && voucher.status === 'SUBMITTED' && (
              <div className="p-4 rounded-xl bg-slate-900 border border-emerald-900/60 shadow-lg space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{language === 'bn' ? 'অ্যাকাউন্টস ডিপার্টমেন্ট অডিট অ্যাকশন' : 'Accounts Audit Action'}</span>
                </div>

                {!isRejecting ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-300 mb-1">
                        {language === 'bn' ? 'অডিট যাচাইকরণ মন্তব্য / নোট (Audit Verification Note):' : 'Audit Verification Note:'}
                      </label>
                      <input
                        type="text"
                        value={auditNote}
                        onChange={e => setAuditNote(e.target.value)}
                        placeholder="e.g. ক্যাশ মেমো এবং দোকানদার যাচাই সম্পন্ন।"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleApprove}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{language === 'bn' ? 'বিল যাচাই ও অনুমোদন করুন' : 'Verify & Approve Voucher'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRejecting(true)}
                        className="py-2 px-3 bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {language === 'bn' ? 'বাতিল' : 'Reject'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[11px] font-medium text-rose-300">
                      {language === 'bn' ? 'ভাউচার বাতিলের সুনির্দিষ্ট কারণ লিখুন:' : 'Rejection Justification:'}
                    </label>
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="e.g. দোকানের ক্যাশ মেমো অস্পষ্ট অথবা অনুমোদিত দরের সাথে মিল নেই।"
                      className="w-full bg-slate-950 border border-rose-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleReject}
                        className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
                      >
                        {language === 'bn' ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded-lg"
                      >
                        {language === 'bn' ? 'পিছনে' : 'Back'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel: High-Resolution Proof & Document Viewer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col bg-slate-950 min-h-[450px]">
            {/* Document Controls Bar */}
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <FileText className="w-4 h-4 text-red-400" />
                <span>
                  {isPdf 
                    ? (language === 'bn' ? 'সংযুক্ত পিডিএফ ডকুমেন্ট (PDF Proof)' : 'Attached PDF Document') 
                    : (language === 'bn' ? 'দোকানের ক্যাশ মেমোর ছবি (Image Proof)' : 'Shop Cash Memo Photo')}
                </span>
                {voucher.receiptFileName && (
                  <span className="font-mono text-[11px] text-slate-500">({voucher.receiptFileName})</span>
                )}
              </div>

              {!isPdf && voucher.receiptUrl && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleRotate}
                    title="Rotate 90deg"
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleResetView}
                    className="px-2 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>

            {/* Document Display Canvas */}
            <div className="flex-1 p-4 flex items-center justify-center overflow-auto bg-black/60 relative">
              {voucher.receiptUrl ? (
                isPdf ? (
                  /* PDF Document Viewer Container */
                  <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl p-6 text-center space-y-4 shadow-xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shadow-inner">
                      <FileText className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">
                        {voucher.receiptFileName || 'Vendor_Invoice_Receipt.pdf'}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {language === 'bn' 
                          ? 'অফিসিয়াল ক্যাশ মেমো / বিল কপি (PDF ফরম্যাটে সংরক্ষিত)' 
                          : 'Official vendor cash memo / bill copy stored in PDF format'}
                      </p>
                      {voucher.receiptFileSize && (
                        <span className="text-[11px] font-mono text-slate-500 block mt-1">
                          File Size: {voucher.receiptFileSize}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-left text-xs space-y-1.5">
                      <div className="flex justify-between text-slate-400">
                        <span>{language === 'bn' ? 'ভাউচার নম্বর:' : 'Voucher:'}</span>
                        <span className="font-mono text-white font-bold">{voucher.voucherNumber}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{language === 'bn' ? 'দোকান / প্রতিষ্ঠান:' : 'Vendor:'}</span>
                        <span className="text-slate-200">{voucher.vendorDetails?.vendorName || voucher.branchName}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>{language === 'bn' ? 'বিল অ্যামাউন্ট:' : 'Amount:'}</span>
                        <span className="font-mono text-emerald-400 font-bold">৳ {voucher.amount.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-center gap-3">
                      <a
                        href={voucher.receiptUrl}
                        download={voucher.receiptFileName || `LEEDO_BILL_${voucher.voucherNumber}.pdf`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg shadow-lg transition-all"
                      >
                        <Download className="w-4 h-4" />
                        <span>{language === 'bn' ? 'পিডিএফ বিল ডাউনলোড / ওপেন করুন' : 'Open / Download PDF'}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  /* High-Resolution Image Viewer */
                  <div className="relative max-w-full max-h-[70vh] flex items-center justify-center overflow-hidden">
                    <img
                      src={voucher.receiptUrl}
                      alt="Shop Cash Memo / Bill"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transition: 'transform 0.2s ease',
                      }}
                      className="max-h-[68vh] max-w-full object-contain rounded-lg border border-slate-800 shadow-2xl select-none"
                    />
                  </div>
                )
              ) : (
                /* No Receipt Warning */
                <div className="text-center p-8 text-slate-500 space-y-2">
                  <AlertCircle className="w-10 h-10 text-amber-500/60 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    {language === 'bn' ? 'কোনো ক্যাশ মেমো বা বিল কপি আপলোড করা হয়নি।' : 'No receipt or cash memo uploaded.'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'bn' 
                      ? 'অডিট সুষ্ঠুভাবে সম্পন্ন করতে বিল কপি আপলোড করা বাধ্যতামূলক।' 
                      : 'Auditors require physical or digital shop bill attachment.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Bar: Action & Download */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'bn' ? 'এনজিও বিষয়ক ব্যুরো ও সিএ অডিট উপযোগী ডিজিটাল রেকর্ড' : 'NGO Affairs Bureau & External Audit Compliant'}</span>
              </span>

              {voucher.receiptUrl && (
                <a
                  href={voucher.receiptUrl}
                  download={voucher.receiptFileName || `LEEDO_MEMO_${voucher.voucherNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মেমো ডাউনলোড' : 'Download Memo'}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
