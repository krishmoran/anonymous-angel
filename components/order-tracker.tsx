"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Truck, CheckCircle, XCircle, Info, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function OrderTracker() {
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestId.trim()) {
      setError('Please enter an order reference');
      return;
    }

    setLoading(true);
    setError(null);
    setOrderDetails(null);

    try {
      const response = await fetch(`/api/order-status/${encodeURIComponent(requestId.trim())}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to retrieve order');
      }

      console.log("Order details:", data.order);
      setOrderDetails(data.order);
    } catch (err) {
      console.error('Error fetching order:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to retrieve order';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'tracking':
      case 'shipped':
        return <Truck className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <Clock className="w-6 h-6 text-amber-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'delivered':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'tracking':
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-amber-100 text-amber-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date safely
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Track Your Order</CardTitle>
          <CardDescription>Enter your order reference to check its status</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                placeholder="Enter order reference"
                className={error ? "border-red-500" : ""}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Track'}
              </Button>
            </div>
            
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {orderDetails && (
              <div className="mt-6 space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Order Status</h3>
                  <div className={cn("px-3 py-1 rounded-full text-xs", 
                    getStatusColor(orderDetails.status || (orderDetails.is_processing ? 'processing' : 'unknown')))}>
                    {orderDetails.is_processing ? 'Processing' : (orderDetails.status || 'Unknown')}
                  </div>
                </div>

                {orderDetails.is_processing && (
                  <div className="p-3 bg-amber-50 text-amber-800 rounded-md">
                    <div className="flex gap-2 items-center mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Order Processing</span>
                    </div>
                    <p className="text-sm">
                      {orderDetails.processing_message || "Your order is currently being processed."}
                    </p>
                    <p className="text-sm mt-1">
                      <strong>Product:</strong> {orderDetails.products && orderDetails.products.length > 0 
                        ? `${orderDetails.products[0].quantity}x ${orderDetails.products[0].product_id}`
                        : 'No product information available'}
                    </p>
                  </div>
                )}

                {orderDetails.tracking_number && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <div className="flex gap-2 items-center mb-1">
                      <Truck className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Tracking Information</span>
                    </div>
                    <p className="text-sm">
                      {orderDetails.tracking_carrier || 'Carrier'}: {orderDetails.tracking_number}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Retailer</p>
                    <p className="font-medium">{orderDetails.retailer || (orderDetails.request && orderDetails.request.retailer) || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {formatDate(orderDetails.request_created || (orderDetails.request && orderDetails.request._created_at))}
                    </p>
                  </div>
                </div>

                {orderDetails.products && orderDetails.products.length > 0 && !orderDetails.is_processing && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Products</p>
                    <ul className="space-y-2">
                      {orderDetails.products.map((product: any, index: number) => (
                        <li key={index} className="text-sm">
                          {product.quantity}x {product.product_id || 'Product'}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {orderDetails.price_components && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Price Details</p>
                    <div className="text-sm">
                      <div className="flex justify-between">
                        <span>Products:</span>
                        <span>${orderDetails.price_components.products.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${orderDetails.price_components.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold mt-1 pt-1 border-t">
                        <span>Total:</span>
                        <span>${orderDetails.price_components.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {orderDetails.merchant_order_ids && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Merchant Order IDs</p>
                    <p className="text-sm font-mono">{orderDetails.merchant_order_ids.join(', ')}</p>
                  </div>
                )}

                {orderDetails.error && (
                  <div className="p-3 bg-red-50 text-red-800 rounded-md">
                    <div className="flex gap-2 items-center mb-1">
                      <Info className="h-4 w-4" />
                      <span className="font-medium">Error Information</span>
                    </div>
                    <p className="text-sm">{orderDetails.error.message || orderDetails.error}</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 