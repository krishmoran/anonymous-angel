"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/lib/types';
import Image from 'next/image';
import { ArrowLeft, MessageSquare } from 'lucide-react';

interface MessageStepProps {
  onContinue: (message: string | undefined) => void;
  onBack: () => void;
  selectedProduct?: Product;
}

export function MessageStep({ onContinue, onBack, selectedProduct }: MessageStepProps) {
  const [message, setMessage] = useState('');
  const maxLength = 280;

  const handleContinue = () => {
    // Pass undefined if no message, otherwise pass the trimmed message
    onContinue(message.trim() === '' ? undefined : message.trim());
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Add a Personal Message <MessageSquare className="inline-block h-6 w-6 ml-1" />
        </h1>
        <p className="text-gray-600">
          Add an optional message that will be included with your gift. You can skip this step if you'd prefer to remain completely anonymous.
        </p>
      </div>
      
      {selectedProduct && (
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-500">${selectedProduct.price.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <div className="relative">
          <Textarea
            placeholder="Write your message here... (optional)"
            className="min-h-32 resize-none"
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxLength))}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {message.length}/{maxLength}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={handleContinue}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}