import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, checked, className = '', id, disabled, ...props }, ref) => {
    const inputId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="flex items-start gap-2.5">
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-md border transition-all duration-150 flex items-center justify-center cursor-pointer ${
              checked
                ? 'bg-[#D66A78] border-[#D66A78] text-white shadow-xs'
                : 'bg-white border-[#EAE5DF] hover:border-[#D66A78]/60'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <label htmlFor={inputId} className="text-xs font-semibold text-[#1E2433] cursor-pointer select-none">
                {label}
              </label>
            )}
            {description && <p className="text-[11px] text-[#566176]">{description}</p>}
            {error && <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
