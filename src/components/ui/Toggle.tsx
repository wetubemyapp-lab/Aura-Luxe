import React from 'react';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const switchWidth = size === 'sm' ? 'w-8 h-4.5' : 'w-11 h-6';
  const knobSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5';
  const translateDistance = size === 'sm' ? 'translate-x-3.5' : 'translate-x-5';

  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <span className="text-xs font-semibold text-[#1E2433] block">{label}</span>}
          {description && <p className="text-[11px] text-[#566176]">{description}</p>}
        </div>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D66A78] ${switchWidth} ${
          checked ? 'bg-[#D66A78]' : 'bg-[#EAE5DF]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${knobSize} ${
            checked ? translateDistance : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
