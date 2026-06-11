import Button from './Button';
import { X, AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'primary' | 'danger';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'primary'
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-100 p-6 shadow-2xl animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4 items-start">
          <div className={`p-2.5 rounded-xl ${variant === 'danger' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'}`}>
            <AlertCircle size={22} />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="hover:bg-slate-50"
          >
            {cancelLabel}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
