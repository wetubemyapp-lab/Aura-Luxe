import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'      // Rose / Coral Accent (#D66A78)
  | 'secondary'    // Charcoal Dark Navy (#1E2433)
  | 'gold'         // Soft Gold Accent (#C89B53)
  | 'outline'      // Subtle warm border, transparent bg
  | 'ghost'        // Flat with hover tint
  | 'danger'       // Ruby red
  | 'glass';       // Frosted glass surface

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseClasses =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] cursor-pointer';

    // Sizes
    const sizeClasses: Record<ButtonSize, string> = {
      xs: 'text-xs px-2.5 py-1 rounded-md gap-1.5',
      sm: 'text-xs px-3.5 py-1.5 rounded-lg gap-2',
      md: 'text-sm px-4 py-2 rounded-xl gap-2',
      lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
    };

    // Variants
    const variantClasses: Record<ButtonVariant, string> = {
      primary:
        'bg-[#D66A78] hover:bg-[#C55866] text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-[#D66A78]',
      secondary:
        'bg-[#1E2433] hover:bg-[#2A3347] text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-[#1E2433]',
      gold:
        'bg-[#C89B53] hover:bg-[#B88942] text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 focus-visible:ring-[#C89B53]',
      outline:
        'border border-[#EAE5DF] bg-white/60 hover:bg-white text-[#1E2433] hover:border-[#D66A78] shadow-xs focus-visible:ring-[#D66A78]',
      ghost:
        'text-[#566176] hover:text-[#1E2433] hover:bg-black/5 focus-visible:ring-[#1E2433]',
      danger:
        'bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-xs hover:shadow-md focus-visible:ring-[#DC2626]',
      glass:
        'glass-card hover:bg-white/90 text-[#1E2433] border-[#EAE5DF] hover:border-[#D66A78]/50 shadow-xs focus-visible:ring-[#D66A78]',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
