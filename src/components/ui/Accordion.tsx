import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpenIds?: string[];
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div
            key={item.id}
            className="glass-card rounded-2xl border border-[#EAE5DF] overflow-hidden transition-all"
          >
            <button
              type="button"
              onClick={() => toggleItem(item.id)}
              className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/60 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                {item.icon && <span className="text-[#C89B53] shrink-0">{item.icon}</span>}
                <span className="font-serif font-bold text-sm text-[#1E2433]">{item.title}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#8491A5] transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#D66A78]' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-4 pb-4 pt-1 border-t border-[#EAE5DF]/60 text-xs text-[#566176] leading-relaxed animate-fade-in">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
