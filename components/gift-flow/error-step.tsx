"use client";

import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

interface ErrorStepProps {
  message: string;
  details?: string;
  onTryAgain: () => void;
  onGoHome: () => void;
}

export function ErrorStep({ message, details, onTryAgain, onGoHome }: ErrorStepProps) {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="mx-auto">
        <div className="w-24 h-24 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Order Processing Error
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto mb-6">
          {message || "We encountered an error while processing your order. Please try again or contact support."}
        </p>
        
        {details && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-8 max-w-md mx-auto text-left">
            <p className="text-sm text-gray-700 mb-2 font-medium">Error Details:</p>
            <p className="text-sm text-gray-600 font-mono whitespace-pre-wrap">{details}</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <Button 
            variant="outline"
            onClick={onGoHome}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Button>
          <Button 
            onClick={onTryAgain}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
} 