import React, { useState } from 'react';
import { TransactionVoucher, Language } from '../types';
import { 
  X, Check, XCircle, Printer, FileText, Download, 
  ExternalLink, ZoomIn, ZoomOut, RotateCw, ShoppingCart, 
  Building, UserCheck, Calendar, ShieldCheck 
} from 'lucide-react';

interface BillInspectorModalProps {
  voucher: TransactionVoucher | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  onPrint?: (voucher: TransactionVoucher) => void;
  canVerify?: boolean;
  language?: Language;
}

export const BillInspectorModal: React.FC<BillInspectorModalProps> = ({
  voucher,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onPrint,
  canVerify = false,
  language = 'bn',
}) => {
  if (!isOpen || !voucher) return null;

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  const isPdf = voucher.receiptType === 'pdf' || 
    (voucher.receiptUrl && (voucher.receiptUrl.startsWith('data:application/pdf') || voucher.receiptUrl.toLowerCase().endsWith('.pdf')));

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleConfirmReject = () => {
    if (!rejectReason.trim() || !onReject) return;
    onReject(voucher.id, rejectReason.trim());
    setIsRejecting(false);
    setRejectReason('');
    onClose();
  };

  const handleDirectApprove = () => {
    if (onApprove) {
      onApprove(voucher.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md p-2 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-2">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] my-auto">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-700/60 text-red-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  {language === 'bn' ? 'দোকানের ক্যাশ মেমো ও বিল কপি অডিট যাচাই' : 'Physical Bill & Cash Memo Audit Inspector'}
                </h2>
                <span className="font-mono text-xs font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                  {voucher.voucherNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {language === 'bn' ? 'অ্যাকাউন্টস ও অডিট টিম বিলের সত্যতা যাচাই করে অনুমোদন নিশ্চিত করবেন' : 'Central Accounts & Internal Audit verification desk'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onPrint && (
              <button
                type="button"
                onClick={() => onPrint(voucher)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
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

        {/* Content Body: Left is Bill Document, Right is Transaction Particulars */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Document Preview Pane (7 cols) */}
          <div className="lg:col-span-7 bg-slate-950/90 border-r border-slate-800 flex flex-col p-4 relative min-h-[350px] lg:min-h-0">
            {/* Toolbar for image manipulation */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800/80 shrink-0 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <FileText className="w-4 h-4 text-red-400" />
                <span>{voucher.receiptFileName || (isPdf ? 'attached_invoice_doc.pdf' : 'shop_memo_receipt.jpg')}</span>
              </span>

              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                {!isPdf && (
                  <>
                    <button
                      type="button"
                      onClick={handleZoomOut}
                      title="Zoom Out"
                      className="p-1 hover:text-white hover:bg-slate-800 rounded"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-1 font-mono text-[11px] text-slate-400">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      type="button"
                      onClick={handleZoomIn}
                      title="Zoom In"
                      className="p-1 hover:text-white hover:bg-slate-800 rounded"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleRotate}
                      title="Rotate 90deg"
                      className="p-1 hover:text-white hover:bg-slate-800 rounded ml-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}

                {voucher.receiptUrl && (
                  <a
                    href={voucher.receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={voucher.receiptFileName || 'receipt_proof'}
                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded flex items-center gap-1 ml-1"
                    title="Download original receipt copy"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Document Render Area */}
            <div className="flex-1 overflow-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2 relative">
              {voucher.receiptUrl ? (
                isPdf ? (
                  <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center p-4">
                    <embed
                      src={voucher.receiptUrl}
                      type="application/pdf"
                      className="w-full h-full rounded-lg min-h-[450px]"
                    />
                    <div className="mt-3 text-center">
                      <a
                        href={voucher.receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'সম্পূর্ণ পিডিএফ নতুন ট্যাবে খুলুন' : 'Open Full PDF in New Tab'}</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="transition-transform duration-200 flex items-center justify-center max-w-full max-h-full overflow-auto">
                    <img
                      src={voucher.receiptUrl}
                      alt="Shop bill invoice proof"
                      style={{
                        transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                      }}
                      className="max-h-[60vh] max-w-full object-contain rounded shadow-lg transition-transform"
                    />
                  </div>
                )
              ) : (
                <div className="text-center p-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-xs">
                    {language === 'bn' ? 'কোনো রসিদ বা মেমোর ছবি আপলোড করা হয়নি।' : 'No physical receipt image attached to this voucher.'}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span>{language === 'bn' ? 'বিল যাচাই: হিসাব শাখার দায়িত্ব' : 'Physical Voucher Verification Audit'}</span>
              <span className="font-mono text-emerald-400">✓ Digital Stamp Active</span>
            </div>
          </div>

          {/* Details & Audit Action Pane (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 flex flex-col p-5 overflow-y-auto space-y-4">
            <div>
              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded border ${
                voucher.status === 'APPROVED' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                voucher.status === 'REJECTED' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {voucher.status === 'APPROVED' ? (language === 'bn' ? 'অডিট যাচাই ও অনুমোদিত' : 'Audit Verified & Approved') :
                 voucher.status === 'REJECTED' ? (language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected') :
                 (language === 'bn' ? 'অ্যাকাউন্টস যাচাইয়ের অপেক্ষায়' : 'Pending Audit Verification')}
              </span>

              <h3 className="text-base font-bold text-white mt-1.5">{voucher.title}</h3>
              <p className="text-xs text-red-400 font-semibold mt-0.5">{voucher.category}</p>
            </div>

            {/* Total Amount Box */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">{language === 'bn' ? 'মোট ভাউচার পরিমাণ:' : 'Total Amount:'}</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                ৳ {voucher.amount.toLocaleString()}
              </span>
            </div>

            {/* Advance Adjustment Details Box (এই ভাউচারে টাকা এই হলো তার সমন্বয়) */}
            {voucher.advanceAdjustment && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/70 text-xs space-y-2 shadow-sm">
                <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider flex items-center justify-between">
                  <span>অগ্রিম টাকার সমন্বয় বিবরণী</span>
                  {voucher.advanceAdjustment.advanceRequisitionNumber && (
                    <span className="font-mono text-[10px] text-amber-200 bg-amber-900/80 px-1.5 py-0.5 rounded border border-amber-700/50">
                      {voucher.advanceAdjustment.advanceRequisitionNumber}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2 rounded border border-amber-900/40">
                  <div>গৃহীত অগ্রিম: <strong className="text-amber-300 font-mono">৳{voucher.advanceAdjustment.advanceAmount.toLocaleString()}</strong></div>
                  <div>এই ভাউচারে খরচ: <strong className="text-emerald-400 font-mono">৳{voucher.amount.toLocaleString()}</strong></div>
                  {voucher.advanceAdjustment.balanceAmount > 0 && (
                    <div className="col-span-2 text-[11px]">
                      {voucher.advanceAdjustment.adjustmentType === 'SURPLUS_RETURNED' ? (
                        <span className="text-emerald-400 font-bold">✓ অবশিষ্ট উদ্বৃত্ত ফেরত: ৳{voucher.advanceAdjustment.balanceAmount.toLocaleString()} ({voucher.advanceAdjustment.returnedMethod === 'CASH' ? 'ক্যাশ ফ্লোট' : 'ব্যাংক'})</span>
                      ) : (
                        <span className="text-rose-400 font-bold">✓ অতিরিক্ত ব্যয় দাবি: ৳{voucher.advanceAdjustment.balanceAmount.toLocaleString()}</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="text-[11px] text-amber-200/90 pt-1 border-t border-amber-800/40 font-medium">
                  {voucher.advanceAdjustment.settlementNotes}
                </div>
              </div>
            )}

            {/* Event Details Box */}
            {voucher.eventDetails && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/50 text-xs space-y-1">
                <div className="text-[11px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1">
                  <span>🎪 {voucher.eventDetails.eventName}</span>
                </div>
                {voucher.eventDetails.venue && (
                  <div className="text-slate-300 text-[11px]">স্থান: {voucher.eventDetails.venue}</div>
                )}
                {voucher.eventDetails.coordinatorName && (
                  <div className="text-slate-400 text-[11px]">ইনচার্জ/সমন্বয়কারী: {voucher.eventDetails.coordinatorName}</div>
                )}
              </div>
            )}

            {/* Vendor / Shop Details */}
            {voucher.vendorDetails && (
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-900/30 text-xs space-y-1.5">
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'দোকান ও সরবরাহকারীর বিবরণ' : 'Vendor & Shop Details'}</span>
                </div>
                <div className="text-slate-200 font-bold">{voucher.vendorDetails.vendorName}</div>
                {voucher.vendorDetails.invoiceNumber && (
                  <div className="text-slate-400 font-mono text-[11px]">
                    Memo / Invoice #: <span className="text-white font-bold">{voucher.vendorDetails.invoiceNumber}</span>
                  </div>
                )}
                {voucher.vendorDetails.vendorAddress && (
                  <div className="text-slate-400 text-[11px]">{voucher.vendorDetails.vendorAddress}</div>
                )}
                {voucher.vendorDetails.contactPhone && (
                  <div className="text-slate-400 text-[11px]">Phone: {voucher.vendorDetails.contactPhone}</div>
                )}
              </div>
            )}

            {/* Itemized Breakdown Table if present */}
            {voucher.items && voucher.items.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-300">
                  {language === 'bn' ? 'কেনাকাটার আইটেম তালিকা:' : 'Purchased Items Breakdown:'}
                </div>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 max-h-40 overflow-y-auto">
                  <table className="w-full text-[11px] text-slate-300">
                    <thead className="bg-slate-950 border-b border-slate-800 text-slate-400">
                      <tr>
                        <th className="py-1.5 px-2 text-left">আইটেম</th>
                        <th className="py-1.5 px-2 text-right">পরিমাণ</th>
                        <th className="py-1.5 px-2 text-right">দর</th>
                        <th className="py-1.5 px-2 text-right">মোট (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {voucher.items.map(item => (
                        <tr key={item.id}>
                          <td className="py-1 px-2">{item.description}</td>
                          <td className="py-1 px-2 text-right font-mono">{item.quantity} {item.unit}</td>
                          <td className="py-1 px-2 text-right font-mono">{item.unitPrice}</td>
                          <td className="py-1 px-2 text-right font-mono font-bold text-emerald-400">{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Metadata summary */}
            <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-500" /> শাখা:</span>
                <span className="text-slate-200 font-medium">{voucher.branchName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500" /> খরচ তারিখ:</span>
                <span className="text-slate-200 font-mono">{voucher.date}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5"><UserCheck className="w-3.5 h-3.5 text-slate-500" /> এন্ট্রি করেছেন:</span>
                <span className="text-slate-200">{voucher.createdBy.userName} (ID: {voucher.createdBy.staffId})</span>
              </div>
              {voucher.notes && (
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300">
                  <span className="text-slate-400 font-bold block mb-0.5">নোট / অডিট রিমার্কস:</span>
                  {voucher.notes}
                </div>
              )}
            </div>

            {/* Accounts Audit Verification Actions */}
            {canVerify && voucher.status === 'SUBMITTED' && (
              <div className="mt-auto pt-4 border-t border-slate-800 space-y-2">
                {!isRejecting ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDirectApprove}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === 'bn' ? 'বিল যাচাই ও অনুমোদন' : 'Audit Verify & Approve'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="py-2.5 px-3 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>{language === 'bn' ? 'প্রত্যাখ্যান' : 'Reject'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl">
                    <label className="block text-xs font-bold text-rose-200">
                      {language === 'bn' ? 'প্রত্যাখ্যানের সুনির্দিষ্ট কারণ উল্লেখ করুন:' : 'Specify Rejection Reason:'}
                    </label>
                    <textarea
                      rows={2}
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: মেমোতে দোকানের সিল নেই / টাকার অঙ্কে গরমিল...' : 'e.g. Missing vendor seal / price mismatch'}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsRejecting(false)}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        বাতিল
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmReject}
                        className="px-3 py-1 bg-rose-600 text-white text-xs font-bold rounded hover:bg-rose-500"
                      >
                        নিশ্চিত প্রত্যাখ্যান
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
