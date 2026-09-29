import React from 'react';

export interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'circle' | 'rounded';
  border?: boolean;
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  variant = 'circle',
  border = true,
  className = '',
}) => {
  const sizeClasses: Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string> = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const shapeClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';
  const borderClass = border ? 'border-2 border-white shadow-xs' : '';

  const getInitials = (str: string) => {
    return str
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`object-cover shrink-0 ${sizeClasses[size]} ${shapeClass} ${borderClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`bg-gradient-to-br from-[#D66A78] to-[#C89B53] text-white flex items-center justify-center font-serif font-bold shrink-0 ${sizeClasses[size]} ${shapeClass} ${borderClass} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
