import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { LeedoLogo } from './LeedoLogo';

interface ChangeLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  onSaveLogo: (logoUrl: string) => void;
  onResetLogo: () => void;
  language?: 'en' | 'bn';
}

export const ChangeLogoModal: React.FC<ChangeLogoModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl = '',
  onSaveLogo,
  onResetLogo,
  language = 'bn',
}) => {
  const [logoInput, setLogoInput] = useState(currentLogoUrl);
  const [previewUrl, setPreviewUrl] = useState(currentLogoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে একটি ছবি ফাইল (PNG, JPG, SVG, WebP) নির্বাচন করুন।' : 'Please select an image file (PNG, JPG, SVG, WebP).');
      return;
    }

    // Limit to 2MB for storage performance
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg(language === 'bn' ? 'ছবির সাইজ ২MB এর বেশি হতে পারবে না।' : 'Image size must be under 2MB.');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setLogoInput(result);
      setPreviewUrl(result);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrorMsg(language === 'bn' ? 'ছবি পড়তে সমস্যা হয়েছে।' : 'Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    setLogoInput(val);
    setPreviewUrl(val.trim());
    setErrorMsg('');
  };

  const handleSave = () => {
    if (!previewUrl.trim()) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে লোগোর ছবি আপলোড করুন বা লিংক দিন।' : 'Please upload or provide an image URL.');
      return;
    }

    onSaveLogo(previewUrl.trim());
    setSuccessMsg(language === 'bn' ? 'সংস্থার লোগো সফলভাবে পরিবর্তন ও সেভ করা হয়েছে!' : 'Organization logo updated and saved successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleReset = () => {
    onResetLogo();
    setLogoInput('');
    setPreviewUrl('');
    setSuccessMsg(language === 'bn' ? 'অফিসিয়াল ডিফল্ট লিডো লোগোতে ফেরত যাওয়া হয়েছে।' : 'Reset to default official LEEDO logo.');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-3 sm:p-4">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4">
        <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden my-auto relative">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800 flex items-center justify-center text-red-400">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {language === 'bn' ? 'সংস্থার লোগো পরিবর্তন (HR & Admin)' : 'Change Organization Logo'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'bn' ? 'মুর্শিদা আক্তার কান্তা / সুপার এডমিন নিয়ন্ত্রণ' : 'HR & Super Admin Control (Murshida Akhter Kanta)'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-5">
            {successMsg && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-xs text-rose-200">
                {errorMsg}
              </div>
            )}

            {/* Live Preview Section */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'bn' ? 'লোগো লাইভ প্রিভিউ (Preview)' : 'Live Logo Preview'}
              </label>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">Small (Navbar / Header)</div>
                  <div className="h-12 flex items-center justify-center p-2 bg-slate-950/70 rounded-lg border border-slate-800">
                    <LeedoLogo size="sm" variant="horizontal" customLogoUrl={previewUrl} />
                  </div>
                </div>
                <div className="text-center space-y-1">
                  <div className="text-[10px] text-slate-400 font-medium">Standard (Voucher / Forms)</div>
                  <div className="h-16 flex items-center justify-center p-2 bg-slate-950/70 rounded-lg border border-slate-800">
                    <LeedoLogo size="md" variant="horizontal" customLogoUrl={previewUrl} />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload from device */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload Image from Device'}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full py-3 px-4 border border-dashed border-slate-700 hover:border-red-500 rounded-xl bg-slate-950/50 hover:bg-slate-950 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-red-500" />
                <span>
                  {isUploading 
                    ? (language === 'bn' ? 'আপলোড হচ্ছে...' : 'Uploading...') 
                    : (language === 'bn' ? 'কম্পিউটার বা মোবাইল থেকে লোগো ছবি বেছে নিন' : 'Select image file (PNG, JPG, SVG)')}
                </span>
              </button>
            </div>

            {/* Or enter Image URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                {language === 'bn' ? 'অথবা লোগোর ওয়েব লিংক (Image URL)' : 'Or Enter Image URL'}
              </label>
              <input
                type="url"
                placeholder="https://example.com/logo.png"
                value={logoInput.startsWith('data:') ? 'Image uploaded from device (Base64)' : logoInput}
                onChange={e => handleUrlChange(e.target.value)}
                disabled={logoInput.startsWith('data:')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              />
              {logoInput.startsWith('data:') && (
                <button
                  type="button"
                  onClick={() => { setLogoInput(''); setPreviewUrl(''); }}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'আপলোড বাতিল করে লিংক দিন' : 'Clear uploaded image to use URL'}
                </button>
              )}
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                {language === 'bn' 
                  ? 'লোগো সেভ করার পর এটি গুগল ক্লাউড ফায়ারস্টোরে সংরক্ষিত থাকবে এবং সকল ডিভাইসে স্বয়ংক্রিয়ভাবে আপডেট হয়ে যাবে।' 
                  : 'Saved logo is stored in Google Cloud Firestore and updates in real-time across all devices.'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ডিফল্ট লিডো লোগো' : 'Reset to Default Logo'}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-red-900/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লোগো সেভ করুন' : 'Save Logo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
