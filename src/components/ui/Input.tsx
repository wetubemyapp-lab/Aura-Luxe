import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isGlass?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      isGlass = true,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const surfaceClass = isGlass
      ? 'glass-input text-[#1E2433] placeholder-[#8491A5]'
      : 'bg-white border border-[#EAE5DF] text-[#1E2433] placeholder-[#8491A5] focus:border-[#D66A78] focus:ring-2 focus:ring-[#D66A78]/20';

    const errorClass = error
      ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/20'
      : '';

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed bg-stone-100' : '';

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-[#1E2433]">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#8491A5] flex items-center justify-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full py-2 text-sm rounded-xl transition-all duration-200 focus:outline-none ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${surfaceClass} ${errorClass} ${disabledClass} ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-[#8491A5] flex items-center justify-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-[11px] text-[#DC2626] font-medium animate-fade-in">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#8491A5]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
