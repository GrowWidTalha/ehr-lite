'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepNames?: string[];
  className?: string;
}

export function FormProgress({ currentStep, totalSteps, stepNames, className }: FormProgressProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Step Labels */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}% complete
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step Names */}
      {stepNames && stepNames.length === totalSteps && (
        <div className="flex items-center justify-between mt-3">
          {stepNames.map((name, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <div
                key={index}
                className="flex flex-col items-center gap-1.5"
                style={{ flex: '1' }}
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-colors duration-200">
                  {isCompleted ? (
                    <span className="w-full h-full rounded-full bg-green-500 text-white flex items-center justify-center">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : isCurrent ? (
                    <span className="w-full h-full rounded-full bg-primary text-white flex items-center justify-center">
                      {stepNumber}
                    </span>
                  ) : (
                    <span className="w-full h-full rounded-full bg-muted text-muted-foreground">
                      {stepNumber}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs font-medium text-center transition-colors duration-200',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-primary',
                    isUpcoming && 'text-muted-foreground'
                  )}
                >
                  {name}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
