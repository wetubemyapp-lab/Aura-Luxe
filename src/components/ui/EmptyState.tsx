import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button, ButtonProps } from './Button.tsx';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
    icon?: React.ReactNode;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`glass-card rounded-3xl p-10 text-center border border-[#EAE5DF] space-y-4 max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#FAF4EB] text-[#C89B53] border border-[#C89B53]/30 flex items-center justify-center mx-auto shadow-xs">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>

      <div className="space-y-1.5">
        <h3 className="font-serif font-bold text-base text-[#1E2433]">{title}</h3>
        {description && (
          <p className="text-xs text-[#566176] leading-relaxed max-w-sm mx-auto">{description}</p>
        )}
      </div>

      {action && (
        <div className="pt-2">
          <Button
            variant={action.variant || 'primary'}
            size="sm"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};
