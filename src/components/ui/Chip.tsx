import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onSelect,
  onRemove,
  disabled = false,
  icon,
  className = '',
}) => {
  const isClickable = Boolean(onSelect) && !disabled;

  return (
    <span
      onClick={isClickable ? onSelect : undefined}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all select-none ${
        selected
          ? 'bg-[#D66A78] text-white shadow-xs'
          : 'bg-white/80 border border-[#EAE5DF] text-[#1E2433] hover:border-[#D66A78]/50 hover:bg-[#FDF2F3]/40'
      } ${isClickable ? 'cursor-pointer active:scale-95' : ''} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span className="truncate max-w-[140px]">{label}</span>
      {onRemove && (
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={`p-0.5 rounded-full hover:bg-black/10 transition-colors ${
            selected ? 'text-white' : 'text-[#8491A5] hover:text-[#1E2433]'
          }`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
