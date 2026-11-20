import { useEffect } from 'react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E201D]/50"
      onClick={onCancel}
    >
      <div
        className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl max-w-md w-full p-6 shadow-xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-modal-title" className="font-serif text-xl font-semibold text-[#1E201D]">
          {title}
        </h2>
        <p className="text-sm text-[#575B54] leading-relaxed">{description}</p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-[#1E201D] bg-[#EFECE4] hover:bg-[#E5DFD2] rounded-md transition-colors cursor-pointer min-h-[40px]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-[#FDFBF7] bg-[#A63A2B] hover:bg-[#8E3023] rounded-md transition-colors cursor-pointer min-h-[40px]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
