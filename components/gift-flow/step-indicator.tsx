import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="hidden sm:flex items-center justify-between relative">
        {/* Continuous background line */}
        <div className="absolute h-0.5 bg-gray-200 top-4 left-0 right-0 -translate-y-1/2 z-0"></div>
        
        {/* Active line overlay */}
        <div 
          className="absolute h-0.5 bg-pink-500 top-4 left-0 -translate-y-1/2 z-0"
          style={{ 
            width: `${currentStep === 0 ? 0 : (currentStep / (steps.length - 1)) * 100}%` 
          }}
        ></div>
        
        {/* Steps */}
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center relative z-10">
            <div 
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 bg-white",
                index < currentStep 
                  ? "bg-pink-500 border-pink-500 text-white" 
                  : index === currentStep 
                    ? "border-pink-500 text-pink-500" 
                    : "border-gray-200 text-gray-400"
              )}
            >
              {index < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            <span 
              className={cn(
                "text-sm", 
                index <= currentStep ? "text-gray-900 font-medium" : "text-gray-500"
              )}
            >
              {step}
            </span>
          </div>
        ))}
      </div>
      
      {/* Mobile version */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-pink-500">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-sm font-medium">
            {steps[currentStep]}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-pink-500 h-1.5 rounded-full" 
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}