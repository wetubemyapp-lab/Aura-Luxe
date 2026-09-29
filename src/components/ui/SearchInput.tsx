import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
  onClear?: () => void;
  onSearchChange?: (val: string) => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onClear, onSearchChange, onChange, placeholder = 'Search...', className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearchChange?.(e.target.value);
    };

    return (
      <div className="relative flex items-center w-full">
        <Search className="w-4 h-4 text-[#8491A5] absolute left-3.5 pointer-events-none" />

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full pl-10 pr-9 py-2 text-xs rounded-xl glass-input text-[#1E2433] placeholder-[#8491A5] focus:outline-none transition-all ${className}`}
          {...props}
        />

        {value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 text-[#8491A5] hover:text-[#1E2433] p-0.5 rounded-full hover:bg-black/5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
