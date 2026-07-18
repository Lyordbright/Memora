import { AlertCircle, RefreshCw } from 'lucide-react';

export default function ErrorBanner({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 mb-6">
      <div className="flex items-center gap-2.5 text-sm text-red-300">
        <AlertCircle size={16} className="shrink-0" />
        <span>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs font-medium text-red-300 hover:text-red-200 shrink-0"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  );
}
