import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'glass' | 'solid' | 'warm';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, variant = 'glass', children, className = '', ...props }, ref) => {
    const variantClasses = {
      glass: 'glass-card border-[#EAE5DF]',
      solid: 'bg-white border border-[#EAE5DF] shadow-sm',
      warm: 'glass-card-warm',
    };

    const hoverClass = hover ? 'hover-lift cursor-pointer' : '';

    return (
      <div
        ref={ref}
        className={`rounded-3xl p-6 transition-all ${variantClasses[variant]} ${hoverClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<{
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}> = ({ title, subtitle, action, className = '', children }) => {
  if (children) return <div className={`mb-4 ${className}`}>{children}</div>;
  return (
    <div className={`flex items-center justify-between gap-4 mb-4 ${className}`}>
      <div>
        {title && <h3 className="font-serif font-bold text-base text-[#1E2433]">{title}</h3>}
        {subtitle && <p className="text-xs text-[#566176] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={className}>{children}</div>;

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`mt-4 pt-4 border-t border-[#EAE5DF] flex items-center justify-between ${className}`}>{children}</div>;
