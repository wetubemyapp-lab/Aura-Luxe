import React from 'react';
import { Modal } from './Modal.tsx';
import { Button } from './Button.tsx';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'gold';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const iconConfig = {
    danger: {
      icon: AlertCircle,
      iconClass: 'bg-rose-50 text-[#DC2626] border-rose-200',
    },
    primary: {
      icon: CheckCircle2,
      iconClass: 'bg-[#FDF2F3] text-[#D66A78] border-[#D66A78]/30',
    },
    gold: {
      icon: HelpCircle,
      iconClass: 'bg-[#FAF4EB] text-[#C89B53] border-[#C89B53]/30',
    },
  };

  const { icon: Icon, iconClass } = iconConfig[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center space-y-4 pt-2">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${iconClass}`}>
          <Icon className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-serif font-bold text-[#1E2433]">{title}</h3>
          <p className="text-xs text-[#566176] leading-relaxed max-w-xs mx-auto">{message}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : variant === 'gold' ? 'gold' : 'primary'}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
