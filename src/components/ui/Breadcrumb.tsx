import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: React.ReactNode;
  onClick?: () => void;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  showHome = true,
  className = '',
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 text-xs ${className}`}>
      {showHome && (
        <span className="text-[#8491A5] flex items-center">
          <Home className="w-3.5 h-3.5" />
        </span>
      )}

      {showHome && items.length > 0 && (
        <ChevronRight className="w-3.5 h-3.5 text-[#8491A5]/60" />
      )}

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <React.Fragment key={idx}>
            {item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="text-[#566176] hover:text-[#D66A78] transition-colors"
              >
                {item.label}
              </button>
            ) : isLast ? (
              <span className="font-semibold text-[#1E2433]">{item.label}</span>
            ) : (
              <span className="text-[#566176]">{item.label}</span>
            )}

            {!isLast && <ChevronRight className="w-3.5 h-3.5 text-[#8491A5]/60" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
