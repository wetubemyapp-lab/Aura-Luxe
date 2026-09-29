import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from './Calendar.tsx';

export interface DatePickerProps {
  label?: string;
  value?: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select date',
  error,
  helperText,
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

  const formatDisplay = (val?: string) => {
    if (!val) return '';
    try {
      const [y, m, d] = val.split('-');
      const date = new Date(Number(y), Number(m) - 1, Number(d));
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  return (
    <div ref={containerRef} className={`w-full space-y-1.5 relative ${className}`}>
      {label && <label className="block text-xs font-semibold text-[#1E2433]">{label}</label>}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-2 pl-3.5 pr-10 text-xs rounded-xl glass-input flex items-center justify-between cursor-pointer ${
          error ? 'border-[#DC2626]' : ''
        }`}
      >
        <span className={value ? 'text-[#1E2433] font-medium' : 'text-[#8491A5]'}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        <CalendarIcon className="w-4 h-4 text-[#8491A5]" />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 shadow-2xl animate-fade-in">
          <Calendar
            selectedDate={value}
            minDate={minDate}
            maxDate={maxDate}
            onSelectDate={(d) => {
              onChange(d);
              setIsOpen(false);
            }}
          />
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
