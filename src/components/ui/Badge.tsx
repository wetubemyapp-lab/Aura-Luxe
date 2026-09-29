import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'gold' | 'outline';
export type BadgeSize = 'xs' | 'sm' | 'md';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    default: {
      container: 'bg-stone-100 text-[#1E2433] border border-stone-200/80',
      dot: 'bg-[#566176]',
    },
    success: {
      container: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      dot: 'bg-emerald-500',
    },
    warning: {
      container: 'bg-amber-50 text-amber-700 border border-amber-200',
      dot: 'bg-amber-500',
    },
    error: {
      container: 'bg-rose-50 text-rose-700 border border-rose-200',
      dot: 'bg-rose-500',
    },
    info: {
      container: 'bg-blue-50 text-blue-700 border border-blue-200',
      dot: 'bg-blue-500',
    },
    accent: {
      container: 'bg-[#FDF2F3] text-[#D66A78] border border-[#D66A78]/30',
      dot: 'bg-[#D66A78]',
    },
    gold: {
      container: 'bg-[#FAF4EB] text-[#C89B53] border border-[#C89B53]/30',
      dot: 'bg-[#C89B53]',
    },
    outline: {
      container: 'bg-transparent text-[#566176] border border-[#EAE5DF]',
      dot: 'bg-[#8491A5]',
    },
  };

  const sizeStyles: Record<BadgeSize, string> = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded gap-1',
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1.5',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5',
  };

  const { container, dot: dotColor } = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center font-semibold tracking-wide capitalize ${container} ${sizeStyles[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span>{children}</span>
    </span>
  );
};
