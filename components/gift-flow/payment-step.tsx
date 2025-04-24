"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { PaymentInfo } from '@/lib/types';
import { z } from 'zod';

interface PaymentStepProps {
  onContinue: (payment: PaymentInfo, email: string) => void;
  onBack: () => void;
}

const paymentSchema = z.object({
  name: z.string().min(1, { message: "Cardholder name is required" }),
  number: z.string().regex(/^\d{16}$/, { message: "Invalid card number" }),
  cvv: z.string().regex(/^\d{3,4}$/, { message: "Invalid CVV" }),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, { message: "Invalid month" }),
  expiryYear: z.string().regex(/^20\d{2}$/, { message: "Invalid year" }),
});

export function PaymentStep({ onContinue, onBack }: PaymentStepProps) {
  const [payment, setPayment] = useState<PaymentInfo>({
    name: '',
    number: '',
    cvv: '',
    expiryMonth: '',
    expiryYear: '',
  });
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof PaymentInfo | 'email', value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else {
      setPayment(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    try {
      paymentSchema.parse(payment);
      
      // Validate email
      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setErrors({ email: 'Valid email is required' });
        return false;
      }
      
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onContinue(payment, email);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Details 💳
        </h1>
        <p className="text-gray-600">
          Enter your payment information to complete the gift order.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Your Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="Your email address"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          <p className="text-xs text-gray-500">
            We'll send your order confirmation and tracking updates to this email.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Cardholder Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            value={payment.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Name on card"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Card Number <span className="text-red-500">*</span></Label>
          <Input
            id="number"
            value={payment.number}
            onChange={(e) => updateField('number', e.target.value.replace(/\D/g, ''))}
            placeholder="1234 5678 9012 3456"
            maxLength={16}
            className={errors.number ? "border-red-500" : ""}
          />
          {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date <span className="text-red-500">*</span></Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                id="expiryMonth"
                value={payment.expiryMonth}
                onChange={(e) => updateField('expiryMonth', e.target.value.replace(/\D/g, ''))}
                placeholder="MM"
                maxLength={2}
                className={errors.expiryMonth ? "border-red-500" : ""}
              />
              <Input
                id="expiryYear"
                value={payment.expiryYear}
                onChange={(e) => updateField('expiryYear', e.target.value.replace(/\D/g, ''))}
                placeholder="YYYY"
                maxLength={4}
                className={errors.expiryYear ? "border-red-500" : ""}
              />
            </div>
            {(errors.expiryMonth || errors.expiryYear) && (
              <p className="text-red-500 text-sm">{errors.expiryMonth || errors.expiryYear}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cvv">CVV <span className="text-red-500">*</span></Label>
            <Input
              id="cvv"
              value={payment.cvv}
              onChange={(e) => updateField('cvv', e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              maxLength={4}
              className={errors.cvv ? "border-red-500" : ""}
            />
            {errors.cvv && <p className="text-red-500 text-sm">{errors.cvv}</p>}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            Continue to Review
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Demo Note:</strong> This application uses Zinc Managed Accounts (ZMA) for fulfillment. 
            While we collect payment information for a complete checkout experience, 
            no actual payment processing occurs in this demo. In a production environment, 
            these details would be securely stored and processed.
          </p>
        </div>
      </form>
    </div>
  );
}