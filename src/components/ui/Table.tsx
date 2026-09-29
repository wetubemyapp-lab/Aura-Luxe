import React from 'react';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-[#EAE5DF] glass-card">
    <table className={`w-full text-left border-collapse text-xs ${className}`}>{children}</table>
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <thead className={`bg-stone-100/70 border-b border-[#EAE5DF] text-[#566176] uppercase tracking-wider text-[10px] font-bold ${className}`}>
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <tbody className={`divide-y divide-[#EAE5DF] text-[#1E2433] ${className}`}>{children}</tbody>;

export const TableRow: React.FC<{ children: React.ReactNode; className?: string; hover?: boolean; onClick?: () => void }> = ({
  children,
  className = '',
  hover = true,
  onClick,
}) => (
  <tr
    onClick={onClick}
    className={`transition-colors ${hover ? 'hover:bg-white/80' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <th className={`p-3.5 font-bold ${className}`}>{children}</th>;

export const TableCell: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <td className={`p-3.5 ${className}`}>{children}</td>;
