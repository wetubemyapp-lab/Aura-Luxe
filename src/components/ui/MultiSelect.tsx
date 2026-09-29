import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export interface MultiSelectOption {
  value: string | number;
  label: string;
  category?: string;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  error,
  helperText,
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const toggleOption = (val: string | number) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeOption = (val: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div ref={containerRef} className={`w-full space-y-1.5 relative ${className}`}>
      {label && <label className="block text-xs font-semibold text-[#1E2433]">{label}</label>}

      {/* Control Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`min-h-[42px] p-1.5 pl-3 pr-9 rounded-xl glass-input flex flex-wrap items-center gap-1.5 cursor-pointer relative ${
          error ? 'border-[#DC2626]' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-xs text-[#8491A5] py-1">{placeholder}</span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#FDF2F3] text-[#D66A78] text-xs font-medium border border-[#D66A78]/30"
            >
              <span className="truncate max-w-[120px]">{opt.label}</span>
              <button
                type="button"
                onClick={(e) => removeOption(opt.value, e)}
                className="hover:text-[#C55866] p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8491A5] pointer-events-none">
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 glass-card rounded-xl p-1.5 shadow-xl max-h-60 overflow-y-auto space-y-0.5 animate-fade-in border border-[#EAE5DF]">
          {options.length === 0 ? (
            <p className="text-xs text-[#8491A5] p-2 text-center">No options available</p>
          ) : (
            options.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOption(opt.value)}
                  className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#FDF2F3] text-[#D66A78] font-semibold'
                      : 'text-[#1E2433] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#D66A78] shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      )}

      {error ? (
        <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#8491A5]">{helperText}</p>
      ) : null}
    </div>
  );
};
