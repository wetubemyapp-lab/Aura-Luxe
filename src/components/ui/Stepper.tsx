import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  id: string | number;
  title: string;
  description?: string;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep: number; // 0-indexed
  onStepClick?: (index: number) => void;
  className?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStep,
  onStepClick,
  className = '',
}) => {
  return (
    <div className={`w-full flex items-center justify-between ${className}`}>
      {steps.map((step, idx) => {
        const isCompleted = idx < activeStep;
        const isCurrent = idx === activeStep;
        const isClickable = Boolean(onStepClick) && (isCompleted || idx === activeStep + 1);

        return (
          <React.Fragment key={step.id}>
            <div
              onClick={() => isClickable && onStepClick?.(idx)}
              className={`flex flex-col items-center text-center gap-1.5 ${
                isClickable ? 'cursor-pointer group' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isCurrent
                    ? 'bg-[#D66A78] text-white ring-4 ring-[#D66A78]/20 shadow-xs'
                    : 'bg-stone-200 text-[#8491A5]'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>

              <span
                className={`text-[11px] font-semibold tracking-tight transition-colors ${
                  isCurrent ? 'text-[#D66A78]' : isCompleted ? 'text-[#1E2433]' : 'text-[#8491A5]'
                }`}
              >
                {step.title}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                  idx < activeStep ? 'bg-emerald-500' : 'bg-stone-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
