"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { GiftOrder } from '@/lib/types';
import Image from 'next/image';
import { ArrowLeft, Check, Gift } from 'lucide-react';

interface ConfirmationStepProps {
  order: GiftOrder;
  onConfirm: () => void;
  onUpdateRevealEmail: (email: string | undefined) => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export function ConfirmationStep({ 
  order, 
  onConfirm, 
  onUpdateRevealEmail,
  onBack, 
  isSubmitting,
  error 
}: ConfirmationStepProps) {
  const [wantToReveal, setWantToReveal] = useState(false);
  const [revealEmail, setRevealEmail] = useState(order.reveal_email || '');
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleToggleReveal = (checked: boolean) => {
    setWantToReveal(checked);
    if (!checked) {
      setRevealEmail('');
      onUpdateRevealEmail(undefined);
      setEmailError(null);
    }
  };

  const handleUpdateEmail = (email: string) => {
    setRevealEmail(email);
    setEmailError(null);
    
    if (email.trim() === '') {
      onUpdateRevealEmail(undefined);
    } else {
      onUpdateRevealEmail(email);
    }
  };

  const validateEmail = () => {
    if (wantToReveal) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(revealEmail)) {
        setEmailError('Please enter a valid email address');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = () => {
    if (validateEmail()) {
      onConfirm();
    }
  };

  if (!order.product || !order.shipping_address) {
    return <div>Missing order information</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Review Your Gift Order 🎁
        </h1>
        <p className="text-gray-600">
          Please review your gift details below before finalizing your order.
        </p>
      </div>
      
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="bg-pink-50 pb-2">
            <CardTitle className="text-lg">Gift Selection</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={order.product.image}
                  alt={order.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{order.product.name}</h3>
                <p className="text-gray-500">${order.product.price.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {order.message && (
          <Card>
            <CardHeader className="bg-pink-50 pb-2">
              <CardTitle className="text-lg">Personal Message</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-gray-600 italic">"{order.message}"</p>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="bg-pink-50 pb-2">
            <CardTitle className="text-lg">Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="font-medium">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
            <p>{order.shipping_address.address_line1}</p>
            {order.shipping_address.address_line2 && <p>{order.shipping_address.address_line2}</p>}
            <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}</p>
            <p className="text-gray-500 text-sm pt-2">Phone: {order.shipping_address.phone_number}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="bg-pink-50 pb-2">
            <CardTitle className="text-lg">Reveal Your Identity (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reveal">Want to reveal your identity later?</Label>
                  <p className="text-sm text-gray-500">We'll send you a link to reveal yourself later if you choose.</p>
                </div>
                <Switch
                  id="reveal"
                  checked={wantToReveal}
                  onCheckedChange={handleToggleReveal}
                />
              </div>
              
              {wantToReveal && (
                <div className="space-y-2 pt-2">
                  <Label htmlFor="email">Your Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={revealEmail}
                    onChange={(e) => handleUpdateEmail(e.target.value)}
                    placeholder="Enter your email"
                    className={emailError ? "border-red-500" : ""}
                  />
                  {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
                  <p className="text-xs text-gray-500">
                    We'll send you a link to reveal your identity to the recipient at any time after they receive the gift.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="rounded-lg bg-pink-50 p-4">
          <div className="flex justify-between items-center">
            <p className="font-medium text-gray-900">Total:</p>
            <p className="font-bold text-xl text-gray-900">${order.product.price.toFixed(2)}</p>
          </div>
          <p className="text-sm text-gray-500 mt-1">Including shipping and handling</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="gap-2"
            disabled={isSubmitting}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Gift className="w-4 h-4" />
                Confirm & Send Gift
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}