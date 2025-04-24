"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GiftSelectionStep } from '@/components/gift-flow/gift-selection-step';
import { MessageStep } from '@/components/gift-flow/message-step';
import { ShippingStep } from '@/components/gift-flow/shipping-step';
import { PaymentStep } from '@/components/gift-flow/payment-step';
import { ConfirmationStep } from '@/components/gift-flow/confirmation-step';
import { SuccessStep } from '@/components/gift-flow/success-step';
import { ErrorStep } from '@/components/gift-flow/error-step';
import { Product, GiftOrder, ShippingAddress, PaymentInfo } from '@/lib/types';
import { StepIndicator } from '@/components/gift-flow/step-indicator';
import { Container } from '@/components/container';

const steps = ["Choose Gift", "Add Message", "Shipping Details", "Payment", "Confirm Order"];

export default function GiftsPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [order, setOrder] = useState<Partial<GiftOrder>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [orderError, setOrderError] = useState(false);

  const handleSelectProduct = (product: Product) => {
    setOrder({ ...order, product });
    setCurrentStep(1);
  };

  const handleAddMessage = (message: string | undefined) => {
    setOrder({ ...order, message });
    setCurrentStep(2);
  };

  const handleAddShipping = (shippingAddress: ShippingAddress) => {
    setOrder({ ...order, shipping_address: shippingAddress });
    setCurrentStep(3);
  };

  const handleAddPayment = (payment: PaymentInfo, email: string) => {
    setOrder({ ...order, payment, email });
    setCurrentStep(4);
  };

  const handleAddRevealEmail = (revealEmail: string | undefined) => {
    setOrder({ ...order, reveal_email: revealEmail });
  };

  const handleConfirmOrder = async () => {
    if (!order.product || !order.shipping_address || !order.payment || !order.email) {
      setError("Missing required information");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setErrorDetails(null);

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (data._type === 'error' || !data.success) {
        setOrderError(true);
        setError(data.message || 'Error processing order');
        setErrorDetails(JSON.stringify(data, null, 2));
        setCurrentStep(6);
        return;
      }

      setOrder({ ...order, request_id: data.request_id });
      setSuccess(true);
      setCurrentStep(5);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err instanceof Error ? err.message : 'Failed to place order');
      setOrderError(true);
      setCurrentStep(6);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setOrder({});
    setCurrentStep(0);
    setSuccess(false);
    setOrderError(false);
    setError(null);
    setErrorDetails(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-10">
      <Container>
        {!success && !orderError && (
          <StepIndicator 
            steps={steps} 
            currentStep={currentStep} 
            className="mb-8" 
          />
        )}

        {currentStep === 0 && (
          <GiftSelectionStep onSelect={handleSelectProduct} />
        )}

        {currentStep === 1 && (
          <MessageStep 
            onContinue={handleAddMessage} 
            onBack={handleGoBack}
            selectedProduct={order.product}
          />
        )}

        {currentStep === 2 && (
          <ShippingStep 
            onContinue={handleAddShipping} 
            onBack={handleGoBack}
          />
        )}

        {currentStep === 3 && (
          <PaymentStep
            onContinue={handleAddPayment}
            onBack={handleGoBack}
          />
        )}

        {currentStep === 4 && (
          <ConfirmationStep
            order={order as GiftOrder}
            onConfirm={handleConfirmOrder}
            onUpdateRevealEmail={handleAddRevealEmail}
            onBack={handleGoBack}
            isSubmitting={isSubmitting}
            error={error}
          />
        )}

        {success && (
          <SuccessStep 
            requestId={order.request_id} 
            onSendAnother={handleRestart}
            onGoHome={() => router.push('/')}
          />
        )}

        {orderError && (
          <ErrorStep
            message={error || "There was an error processing your order"}
            details={errorDetails || undefined}
            onTryAgain={handleRestart}
            onGoHome={() => router.push('/')}
          />
        )}
      </Container>
    </main>
  );
}