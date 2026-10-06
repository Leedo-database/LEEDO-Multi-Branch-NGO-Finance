import React, { useState } from 'react';
import { X, Printer, Receipt, FileText, CheckCircle2, Building, Smartphone } from 'lucide-react';
import { TransactionVoucher } from '../types';
import { LeedoLogo } from './LeedoLogo';

interface PrintableVoucherModalProps {
  voucher: TransactionVoucher | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableVoucherModal: React.FC<PrintableVoucherModalProps> = ({
  voucher,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !voucher) return null;

  const [printFormat, setPrintFormat] = useState<'A4_OFFICIAL' | 'THERMAL_POS'>('A4_OFFICIAL');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm p-2 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-auto">
        {/* Top Control Bar (Non-Printable) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setPrintFormat('A4_OFFICIAL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printFormat === 'A4_OFFICIAL' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                A4 Official Letterhead
              </button>
              <button
                type="button"
                onClick={() => setPrintFormat('THERMAL_POS')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  printFormat === 'THERMAL_POS' ? 'bg-red-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                80mm Thermal POS Receipt
              </button>
            </div>
            <span className="text-xs text-slate-400 font-mono">{voucher.voucherNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Document / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 max-h-[82vh] overflow-y-auto bg-slate-950 flex justify-center">
          {printFormat === 'A4_OFFICIAL' ? (
            /* A4 OFFICIAL FORMAT */
            <div className="w-full max-w-[760px] bg-white text-slate-900 p-10 rounded-sm shadow-xl border border-slate-200 printable-area">
              {/* Header with Official Logo */}
              <div className="flex items-start justify-between border-b-2 border-red-700 pb-5 mb-6">
                <div className="flex items-start gap-4">
                  <LeedoLogo size="lg" variant="stacked" />
                  <div>
                    <h1 className="text-2xl font-black text-red-600 tracking-tight leading-none mt-1">LEEDO</h1>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mt-1">
                      Local Education and Economic Development Organization
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Govt. Reg No: DHA-09281 | NGO Affairs Bureau FD-4 Approved
                    </p>
                    <p className="text-xs text-slate-500">
                      Head Office: 24/1 Ring Road, Mohammadpur, Dhaka-1207, Bangladesh
                    </p>
                    <p className="text-xs text-slate-500 font-mono">finance@leedo.org | +880 2 8192301</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-block bg-red-50 border border-red-200 rounded px-3 py-1 mb-2">
                    <span className="text-xs font-black text-red-700 uppercase tracking-widest">
                      {voucher.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 font-mono">VOUCHER NO: {voucher.voucherNumber}</p>
                  <p className="text-xs text-slate-600">Date: {voucher.date}</p>
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>STATUS: {voucher.status}</span>
                  </div>
                </div>
              </div>

              {/* Meta Context */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Branch Center (শাখা):</p>
                  <p className="font-bold text-slate-900 text-sm">{voucher.branchName}</p>
                  {voucher.targetBranchName && (
                    <p className="text-slate-700 mt-1">
                      <span className="font-medium">Target Destination:</span> {voucher.targetBranchName}
                    </p>
                  )}
                  <p className="text-slate-700 mt-1">
                    <span className="font-medium">Expense Category:</span> <strong className="text-red-700">{voucher.category}</strong>
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Assigned Project & Donor:</p>
                  <p className="font-bold text-slate-900 text-sm">{voucher.projectName || 'LEEDO General Operational Fund'}</p>
                  <p className="text-slate-700 mt-1">
                    <span className="font-medium">Donor Source:</span> {voucher.donorName || 'Central Grant Fund'}
                  </p>
                  <p className="text-slate-700 mt-1">
                    <span className="font-medium">Disbursement Method:</span> {voucher.fundSourceMethod}
                  </p>
                </div>
              </div>

              {/* Title / Description */}
              <div className="mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Particulars / Details</h3>
                <p className="text-sm font-semibold text-slate-900 bg-red-50/40 p-3 rounded border border-red-100">
                  {voucher.title}
                </p>
              </div>

              {/* Event / Program Particulars Box (if applicable) */}
              {(voucher.isEventProgram || voucher.eventDetails) && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200 text-xs text-slate-800">
                  <div className="flex items-center justify-between border-b border-purple-200 pb-2 mb-2.5">
                    <span className="font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                      Program & Event Information (কর্মসূচি ও ইভেন্ট বিবরণ):
                    </span>
                    <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded text-[11px]">
                      EVENT RECORD
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div className="col-span-2">
                      <span className="font-medium text-slate-500">Event Name (নাম): </span>
                      <strong className="text-purple-950 font-bold">{voucher.eventDetails?.eventName || voucher.title}</strong>
                    </div>
                    {voucher.eventDetails?.venue && (
                      <div>
                        <span className="font-medium text-slate-500">Venue (স্থান): </span>
                        <span>{voucher.eventDetails.venue}</span>
                      </div>
                    )}
                    {voucher.eventDetails?.eventDate && (
                      <div>
                        <span className="font-medium text-slate-500">Date (তারিখ): </span>
                        <span>{voucher.eventDetails.eventDate}</span>
                      </div>
                    )}
                    {voucher.eventDetails?.coordinatorName && (
                      <div>
                        <span className="font-medium text-slate-500">Coordinator (সমন্বয়কারী): </span>
                        <span>{voucher.eventDetails.coordinatorName} {voucher.eventDetails.coordinatorPhone ? `(${voucher.eventDetails.coordinatorPhone})` : ''}</span>
                      </div>
                    )}
                    {voucher.eventDetails?.expectedParticipants && (
                      <div>
                        <span className="font-medium text-slate-500">Beneficiary Count (সুবিধাভোগী শিশু): </span>
                        <span>{voucher.eventDetails.expectedParticipants} জন</span>
                      </div>
                    )}
                    {voucher.eventDetails?.programSummary && (
                      <div className="col-span-2 mt-1 pt-1 border-t border-purple-150 text-[11px] text-slate-600">
                        <span className="font-medium text-slate-500">Activities Summary: </span>
                        <span>{voucher.eventDetails.programSummary}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Advance Adjustment Settlement Box ("এই ভাউচারে টাকা এই হলো তার সমন্বয়") */}
              {(voucher.type === 'ADVANCE_ADJUSTMENT' || voucher.isAdvanceAdjustment || voucher.advanceAdjustment) && (
                <div className="mb-6 p-4 bg-amber-50/80 rounded-lg border-2 border-amber-300 text-xs text-slate-900">
                  <div className="flex items-center justify-between border-b border-amber-300 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                      <span className="font-black text-amber-950 uppercase tracking-wider text-[13px]">
                        অগ্রিম সমন্বয় বিবরণী (Advance Settlement Statement)
                      </span>
                    </div>
                    {voucher.advanceAdjustment?.advanceRequisitionNumber && (
                      <span className="font-mono font-bold text-[11px] text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                        REF: {voucher.advanceAdjustment.advanceRequisitionNumber}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3 text-center">
                    <div className="bg-white p-2.5 rounded border border-amber-200 shadow-sm">
                      <span className="text-[11px] text-slate-500 font-medium block">গৃহীত অগ্রিম (Advance Given)</span>
                      <strong className="text-sm font-mono font-black text-amber-900">
                        ৳ {(voucher.advanceAdjustment?.advanceAmount || voucher.amount).toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-amber-200 shadow-sm">
                      <span className="text-[11px] text-slate-500 font-medium block">প্রকৃত খরচ (Actual Spent)</span>
                      <strong className="text-sm font-mono font-black text-emerald-800">
                        ৳ {voucher.amount.toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-amber-200 shadow-sm">
                      <span className="text-[11px] text-slate-500 font-medium block">
                        {voucher.advanceAdjustment?.adjustmentType === 'SURPLUS_RETURNED' 
                          ? 'উদ্বৃত্ত ফেরত (Returned)' 
                          : (voucher.advanceAdjustment?.adjustmentType === 'EXCESS_CLAIMED' ? 'অতিরিক্ত দাবি (Claimed)' : 'সমন্বয় ব্যালেন্স')}
                      </span>
                      <strong className={`text-sm font-mono font-black ${
                        voucher.advanceAdjustment?.adjustmentType === 'SURPLUS_RETURNED' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        ৳ {(voucher.advanceAdjustment?.balanceAmount ?? 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>

                  {/* Certified Audit Settlement Note */}
                  <div className="bg-amber-100/70 p-2.5 rounded border border-amber-300/80 text-[11px] leading-relaxed text-amber-950 font-medium">
                    <p className="font-bold text-amber-900 mb-0.5">
                      ✓ এই ভাউচারে টাকা এই হলো তার সমন্বয় (Audited Advance Settlement Note):
                    </p>
                    <p>
                      {voucher.advanceAdjustment?.settlementNotes || 
                        `গৃহীত অগ্রিমের বিপরীতে মোট ৳${voucher.amount.toLocaleString()} টাকার অনুমোদিত রসিদ ও ভাউচার জমা দেওয়া হয়েছে এবং চূড়ান্ত সমন্বয় লিপিবদ্ধ করা হলো।`}
                    </p>
                  </div>
                </div>
              )}

              {/* Dynamic Bank Transfer Breakdown in Voucher */}
              {voucher.bankDetails && (
                <div className="mb-6 p-4 bg-sky-50 rounded-lg border border-sky-200 text-xs">
                  <h4 className="font-bold text-sky-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-sky-700" />
                    <span>Bank Transfer Particulars:</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="font-medium">Bank Name:</span> {voucher.bankDetails.bankName}</div>
                    <div><span className="font-medium">Branch:</span> {voucher.bankDetails.branchName}</div>
                    <div><span className="font-medium">Account Holder:</span> <strong>{voucher.bankDetails.accountHolderName}</strong></div>
                    <div><span className="font-medium">Account Number:</span> <span className="font-mono">{voucher.bankDetails.accountNumber}</span></div>
                    {voucher.bankDetails.routingNumber && (
                      <div><span className="font-medium">Routing Number:</span> {voucher.bankDetails.routingNumber}</div>
                    )}
                    {voucher.bankDetails.chequeOrTransactionRef && (
                      <div><span className="font-medium">Cheque / Trx Ref:</span> {voucher.bankDetails.chequeOrTransactionRef}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Mobile Banking (MFS) Breakdown */}
              {voucher.mfsDetails && (
                <div className="mb-6 p-4 bg-pink-50 rounded-lg border border-pink-200 text-xs">
                  <h4 className="font-bold text-pink-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-pink-700" />
                    <span>Mobile Financial Service ({voucher.mfsDetails.provider}) Details:</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div><span className="font-medium">Provider:</span> {voucher.mfsDetails.provider}</div>
                    <div><span className="font-medium">Account Number:</span> <strong className="font-mono">{voucher.mfsDetails.accountNumber}</strong></div>
                    <div><span className="font-medium">Account Holder:</span> {voucher.mfsDetails.accountHolderName}</div>
                    <div><span className="font-medium">Account Type:</span> {voucher.mfsDetails.accountType}</div>
                    {voucher.mfsDetails.trxId && (
                      <div><span className="font-medium">Transaction ID (TrxID):</span> <span className="font-mono font-bold text-pink-800">{voucher.mfsDetails.trxId}</span></div>
                    )}
                  </div>
                </div>
              )}

              {/* Dynamic Vendor Details */}
              {voucher.vendorDetails && (
                <div className="mb-6 p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                  <span className="font-bold text-amber-900">Vendor / Supplier: </span>
                  <span className="font-semibold text-slate-900">{voucher.vendorDetails.vendorName}</span>
                  {voucher.vendorDetails.contactPhone && <span> · Phone: {voucher.vendorDetails.contactPhone}</span>}
                  {voucher.vendorDetails.invoiceNumber && <span> · Bill/Inv #: {voucher.vendorDetails.invoiceNumber}</span>}
                  {voucher.vendorDetails.vendorAddress && <p className="text-slate-600 mt-1">Address: {voucher.vendorDetails.vendorAddress}</p>}
                </div>
              )}

              {/* Itemized Table if available */}
              {voucher.items && voucher.items.length > 0 ? (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Itemized Breakdown</h3>
                  <table className="w-full text-left text-xs border border-slate-300">
                    <thead className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                      <tr>
                        <th className="p-2 border-r border-slate-300">#</th>
                        <th className="p-2 border-r border-slate-300">Description</th>
                        <th className="p-2 border-r border-slate-300 text-right">Qty</th>
                        <th className="p-2 border-r border-slate-300">Unit</th>
                        <th className="p-2 border-r border-slate-300 text-right">Unit Price (BDT)</th>
                        <th className="p-2 text-right">Total (BDT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {voucher.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="p-2 border-r border-slate-200 text-slate-500 font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-200 font-medium text-slate-800">{item.description}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">{item.quantity}</td>
                          <td className="p-2 border-r border-slate-200 text-slate-600">{item.unit}</td>
                          <td className="p-2 border-r border-slate-200 text-right font-mono">৳ {item.unitPrice.toLocaleString()}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">৳ {item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {/* Grand Total */}
              <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-lg mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Verified Amount</span>
                  <p className="text-xs text-red-300 italic mt-0.5">
                    Taka in Words: {voucher.amount.toLocaleString()} Bangladeshi Taka Only
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono tracking-tight text-red-400">
                    ৳ {voucher.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Notes */}
              {voucher.notes && (
                <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">Operational Notes: </span>
                  {voucher.notes}
                </div>
              )}

              {/* Attached Receipt Proof */}
              {voucher.receiptUrl && (
                <div className="mb-8 p-3 border border-dashed border-slate-300 rounded-lg text-xs">
                  <span className="font-bold text-slate-700 block mb-2">Verified Digital Receipt Proof Attached:</span>
                  <div className="w-48 h-28 border border-slate-200 rounded overflow-hidden">
                    <img src={voucher.receiptUrl} alt="Receipt proof" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Signatures with staff IDs */}
              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                    {voucher.createdBy.userName}
                  </div>
                  <p className="text-slate-500 font-medium">Prepared By (Staff ID: {voucher.createdBy.staffId})</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                    {voucher.approvedBy?.userName || 'Md. Habibur Rahman'}
                  </div>
                  <p className="text-slate-500 font-medium">Audited & Verified (Central Accounts)</p>
                </div>
                <div>
                  <div className="border-b border-slate-400 pb-1 mb-1 font-semibold text-slate-800">
                    Forhad Hossain (ED, ID: 1001)
                  </div>
                  <p className="text-slate-500 font-medium">Executive Sanction / Director</p>
                </div>
              </div>
            </div>
          ) : (
            /* 80MM THERMAL RECEIPT FORMAT */
            <div className="w-[340px] bg-white text-slate-950 p-6 rounded-none shadow-2xl font-mono text-xs border border-slate-300 printable-area">
              <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3">
                <LeedoLogo size="sm" variant="stacked" />
                <h2 className="text-base font-black tracking-tight text-slate-950 mt-1">LEEDO NGO</h2>
                <p className="text-[10px] text-slate-600">Local Education & Economic Dev. Org</p>
                <p className="text-[10px] text-slate-500">Dhaka, Bangladesh | Reg # DHA-09281</p>
                <p className="text-[11px] font-bold mt-1 text-red-600 uppercase">*** {voucher.type.replace('_', ' ')} ***</p>
              </div>

              <div className="space-y-1 text-[11px] border-b border-dashed border-slate-400 pb-3 mb-3">
                <div className="flex justify-between">
                  <span className="text-slate-500">VCH NO:</span>
                  <span className="font-bold">{voucher.voucherNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DATE:</span>
                  <span>{voucher.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BRANCH:</span>
                  <span className="font-bold">{voucher.branchName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CATEGORY:</span>
                  <span className="truncate max-w-[170px] font-semibold">{voucher.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">METHOD:</span>
                  <span>{voucher.fundSourceMethod}</span>
                </div>
                {voucher.bankDetails && (
                  <div className="text-[10px] text-slate-600 pt-1 border-t border-dotted border-slate-300">
                    Bank: {voucher.bankDetails.bankName} ({voucher.bankDetails.accountHolderName})
                  </div>
                )}
                {voucher.mfsDetails && (
                  <div className="text-[10px] text-slate-600 pt-1 border-t border-dotted border-slate-300">
                    MFS: {voucher.mfsDetails.provider} - {voucher.mfsDetails.accountNumber} ({voucher.mfsDetails.accountHolderName})
                  </div>
                )}
                {voucher.eventDetails?.eventName && (
                  <div className="text-[10px] text-purple-900 pt-1 border-t border-dotted border-slate-300 font-semibold">
                    EVENT: {voucher.eventDetails.eventName} {voucher.eventDetails.venue ? `(${voucher.eventDetails.venue})` : ''}
                  </div>
                )}
                {(voucher.type === 'ADVANCE_ADJUSTMENT' || voucher.isAdvanceAdjustment) && (
                  <div className="text-[10px] text-amber-950 pt-1 border-t border-dotted border-slate-300 font-bold">
                    ADJUSTMENT: Adv ৳{(voucher.advanceAdjustment?.advanceAmount || voucher.amount).toLocaleString()} | Spent ৳{voucher.amount.toLocaleString()} | Bal ৳{(voucher.advanceAdjustment?.balanceAmount || 0).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Items List */}
              {voucher.items && voucher.items.length > 0 && (
                <div className="border-b border-dashed border-slate-400 pb-3 mb-3 text-[11px]">
                  <div className="font-bold text-slate-700 mb-1">PURCHASE PARTICULARS:</div>
                  {voucher.items.map((it, i) => (
                    <div key={i} className="mb-1">
                      <div className="text-slate-800">{it.description}</div>
                      <div className="flex justify-between text-slate-600 pl-2">
                        <span>{it.quantity} {it.unit} @ {it.unitPrice}</span>
                        <span className="font-bold">৳{it.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total */}
              <div className="border-b-2 border-slate-900 pb-2 mb-3">
                <div className="flex justify-between text-sm font-black">
                  <span>TOTAL TAKA:</span>
                  <span className="text-red-700">৳ {voucher.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                  <span>STATUS:</span>
                  <span className="font-bold uppercase text-emerald-800">{voucher.status}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-3 text-[10px] space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Prep: {voucher.createdBy.userName} (ID: {voucher.createdBy.staffId})</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Audit: {voucher.approvedBy?.userName || 'Md. Habibur Rahman (1004)'}</span>
                </div>
                <div className="text-center pt-2 text-[9px] text-slate-400 border-t border-dashed border-slate-300">
                  *** VERIFIED LEEDO CENTRAL ACCOUNTS ***
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};
