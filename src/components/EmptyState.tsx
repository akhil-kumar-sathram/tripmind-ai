import { AlertTriangle, Compass } from 'lucide-react';

interface EmptyStateProps {
  variant?: 'empty' | 'error';
  title: string;
  description: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  variant = 'empty',
  title,
  description,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  const Icon = variant === 'error' ? AlertTriangle : Compass;
  const iconTone = variant === 'error' ? 'text-[#A63A2B] bg-[#F8ECE9]' : 'text-[#1B4332] bg-[#EFECE4]';

  return (
    <div
      role={variant === 'error' ? 'alert' : 'region'}
      className="bg-[#FDFBF7] border border-[#E3DDD2] rounded-xl px-6 py-14 text-center max-w-xl mx-auto"
    >
      <div className={`w-12 h-12 rounded-lg mx-auto mb-5 flex items-center justify-center ${iconTone}`}>
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h2 className="font-serif text-2xl font-semibold text-[#1E201D] mb-2.5">{title}</h2>
      <p className="text-sm sm:text-base text-[#575B54] leading-relaxed max-w-md mx-auto mb-7">
        {description}
      </p>

      {(primaryActionLabel || secondaryActionLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryActionLabel && onPrimaryAction && (
            <button
              type="button"
              onClick={onPrimaryAction}
              className="px-5 py-2.5 text-sm font-medium text-[#FDFBF7] bg-[#1B4332] hover:bg-[#143326] rounded-md transition-colors cursor-pointer min-h-[42px] whitespace-nowrap"
            >
              {primaryActionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-5 py-2.5 text-sm font-medium text-[#1E201D] bg-[#EFECE4] hover:bg-[#E5DFD2] rounded-md transition-colors cursor-pointer min-h-[42px] whitespace-nowrap"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
