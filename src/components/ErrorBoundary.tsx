import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Could not clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-red-800/60 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-red-950/80 border border-red-700 rounded-full flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-white">
              একটি সাময়িক ত্রুটি দেখা দিয়েছে
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              সিস্টেমের কোনো ডেটা লোড হতে সমস্যা হয়েছিল। নিচের বাটনে ক্লিক করে পুনরায় লোড করুন।
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-rose-300 font-mono text-left overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-950/50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>পুনরায় লোড করুন (Reload)</span>
              </button>
              <button
                type="button"
                onClick={this.handleClearCache}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ক্যাশ রিসেট করুন</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
