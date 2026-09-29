import React from 'react';
import { Clock } from 'lucide-react';

export interface TimeSlot {
  time: string;
  available?: boolean;
  period?: 'morning' | 'afternoon' | 'evening';
}

export interface TimeSlotPickerProps {
  slots?: (string | TimeSlot)[];
  selectedSlot?: string;
  onSelectSlot: (slot: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots = [
    '09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM',
    '12:30 PM', '02:00 PM', '02:45 PM', '03:30 PM',
    '04:15 PM', '05:00 PM', '05:45 PM', '06:30 PM',
    '07:15 PM', '08:00 PM'
  ],
  selectedSlot,
  onSelectSlot,
  label,
  error,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1E2433]">
          <Clock className="w-3.5 h-3.5 text-[#C89B53]" />
          <span>{label}</span>
        </div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
        {slots.map((item) => {
          const timeStr = typeof item === 'string' ? item : item.time;
          const isAvailable = typeof item === 'string' ? true : item.available !== false;
          const isSelected = selectedSlot === timeStr;

          return (
            <button
              key={timeStr}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelectSlot(timeStr)}
              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all duration-150 border text-center ${
                isSelected
                  ? 'bg-[#D66A78] border-[#D66A78] text-white shadow-xs scale-[1.02]'
                  : isAvailable
                  ? 'border-[#EAE5DF] bg-white text-[#1E2433] hover:border-[#D66A78]/60 hover:bg-[#FDF2F3]/50'
                  : 'opacity-40 cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400'
              }`}
            >
              {timeStr}
            </button>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>}
    </div>
  );
};
