import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
  className = '',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed inset-y-0 ${
          position === 'right' ? 'right-0' : 'left-0'
        } max-w-full flex pl-10`}
      >
        <div className={`w-screen max-w-md bg-[#FAF8F5] border-${position === 'right' ? 'l' : 'r'} border-[#EAE5DF] shadow-2xl flex flex-col ${className}`}>
          <div className="p-5 border-b border-[#EAE5DF] flex items-center justify-between bg-white/70">
            {title && <h3 className="font-serif font-bold text-base text-[#1E2433]">{title}</h3>}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8491A5] hover:text-[#1E2433] hover:bg-black/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
