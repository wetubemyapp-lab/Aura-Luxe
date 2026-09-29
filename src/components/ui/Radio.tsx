import React from 'react';

export interface RadioOption {
  value: string | number;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string | number;
  onChange: (value: any) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-semibold text-[#1E2433]">{label}</label>}

      <div className="space-y-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const optId = `${name}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#D66A78] bg-[#FDF2F3]/60 ring-1 ring-[#D66A78]'
                  : 'border-[#EAE5DF] hover:border-[#D66A78]/50 bg-white/70'
              } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="pt-0.5 relative flex items-center">
                <input
                  id={optId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  disabled={opt.disabled}
                  onChange={() => onChange(opt.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected ? 'border-[#D66A78] bg-white' : 'border-[#EAE5DF] bg-white'
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-[#D66A78]" />}
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-[#1E2433] block">{opt.label}</span>
                {opt.description && <p className="text-[11px] text-[#566176]">{opt.description}</p>}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>}
    </div>
  );
};
