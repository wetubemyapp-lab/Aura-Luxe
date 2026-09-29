import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  isGlass?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      isGlass = true,
      className = '',
      id,
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

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
          <label htmlFor={textareaId} className="block text-xs font-semibold text-[#1E2433]">
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={`w-full p-3 text-sm rounded-xl transition-all duration-200 focus:outline-none resize-y ${surfaceClass} ${errorClass} ${disabledClass} ${className}`}
          {...props}
        />

        {error ? (
          <p className="text-[11px] text-[#DC2626] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[#8491A5]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
