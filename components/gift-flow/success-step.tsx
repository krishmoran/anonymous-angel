"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Home, ExternalLink, Copy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

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
  const [confettiPlayed, setConfettiPlayed] = useState(false);
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Play confetti effect once
  useState(() => {
    if (!confettiPlayed) {
      setConfettiPlayed(true);
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
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
  });

  // Handle tracking link click with clipboard copy
  const handleTrackClick = () => {
    if (requestId) {
      // Copy order ID to clipboard
      navigator.clipboard.writeText(requestId)
        .then(() => {
          setCopied(true);
          toast({
            title: "Order reference copied",
            description: "For your convenience, it's also in the tracking form"
          });
          
          // Reset copied state after 2 seconds
          setTimeout(() => setCopied(false), 2000);
          
          // Navigate to tracking section with request ID in hash params
          router.push(`/#track-order?id=${requestId}`);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          // If copying fails, just navigate
          router.push(`/#track-order?id=${requestId}`);
        });
    }
  };

  return (
    <div className="text-center space-y-8 py-12">
      <div className="mx-auto">
        <div className="w-24 h-24 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Gift Confirmation Received
        </h1>
        <p className="text-gray-600 max-w-lg mx-auto mb-6">
          We're processing your gift order. Please wait while we confirm all details.
        </p>
        
        {requestId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-8 max-w-sm mx-auto">
            <p className="text-sm text-gray-500 mb-2">Order Reference:</p>
            <p className="font-mono text-gray-900 font-medium">{requestId}</p>
            <div className="mt-3 flex justify-center gap-2">
              <button
                onClick={handleTrackClick}
                className="text-pink-600 hover:text-pink-700 text-sm flex items-center justify-center gap-1"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5" />
                )}
                Track order status anytime
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(requestId);
                  setCopied(true);
                  toast({
                    title: "Copied!",
                    description: "Order reference copied to clipboard"
                  });
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-gray-500 hover:text-gray-700"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        )}
        
        <div className="px-4 py-3 bg-blue-50 rounded-lg text-sm text-blue-700 max-w-md mx-auto mb-6">
          <p>Processing your order... this may take a few minutes</p>
          <div className="w-full h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-1/4 animate-pulse"></div>
          </div>
        </div>
        
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
          >
            <Gift className="w-4 h-4" />
            Send Another Gift
          </Button>
        </div>
      </div>
    </div>
  );
}