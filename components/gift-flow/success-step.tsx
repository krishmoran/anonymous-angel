"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RealTimeOrderStatus } from './real-time-order-status';

// Helper function for confetti effect
function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface SuccessStepProps {
  requestId?: string;
  onSendAnother: () => void;
  onGoHome: () => void;
}

export function SuccessStep({ requestId, onSendAnother, onGoHome }: SuccessStepProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  // Handle status changes from the real-time updates
  const handleStatusChange = (status: string, isComplete: boolean) => {
    setOrderStatus(status);
    if (isComplete && !orderComplete) {
      setOrderComplete(true);
    }
  };

  useEffect(() => {
    // Only trigger confetti when order is complete
    if (orderComplete && !showConfetti) {
      setShowConfetti(true);
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, [orderComplete, showConfetti]);

  return (
    <div className="text-center space-y-8 py-12">
      <div className="mx-auto">
        <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {orderComplete 
            ? "Gift Successfully Sent! 🎉" 
            : "Gift Confirmation Received"}
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto mb-6">
          {orderComplete 
            ? "Your anonymous gift is on its way! Thanks for spreading joy and kindness through Anonymous Angel."
            : "We're processing your gift order. Please wait while we confirm all details."}
        </p>
        
        {requestId && (
          <>
            <div className="bg-gray-50 rounded-lg p-4 mb-8 max-w-sm mx-auto">
              <p className="text-sm text-gray-500 mb-2">Order Reference:</p>
              <p className="font-mono text-gray-900 font-medium">{requestId}</p>
            </div>
            
            {/* Real-time order status component */}
            <div className="max-w-md mx-auto mb-8">
              <RealTimeOrderStatus 
                requestId={requestId} 
                onStatusChange={handleStatusChange}
                className="mb-4"
              />
            </div>
          </>
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
            onClick={onSendAnother}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white gap-2"
            disabled={!orderComplete && orderStatus !== 'failed'}
          >
            <Gift className="w-4 h-4" />
            Send Another Gift
          </Button>
        </div>
      </div>
    </div>
  );
}