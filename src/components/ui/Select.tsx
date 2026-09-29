import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  helperText?: string;
  error?: string;
  isGlass?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options = [],
      helperText,
      error,
      isGlass = true,
      className = '',
      id,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const surfaceClass = isGlass
      ? 'glass-input text-[#1E2433]'
      : 'bg-white border border-[#EAE5DF] text-[#1E2433] focus:border-[#D66A78] focus:ring-2 focus:ring-[#D66A78]/20';

    const errorClass = error
      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
      : '';

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : '';

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-semibold text-[#1E2433]">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full py-2 pl-3.5 pr-10 text-sm rounded-xl appearance-none transition-all duration-200 focus:outline-none cursor-pointer ${surfaceClass} ${errorClass} ${disabledClass} ${className}`}
            {...props}
          >
            {children ||
              options.map((opt) => (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-[#8491A5] flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error ? (
          <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#8491A5]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
