"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Package, Truck, CheckCircle, XCircle, Info, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface OrderTrackerProps {
  initialRequestId?: string;
}

export function OrderTracker({ initialRequestId }: OrderTrackerProps = {}) {
  const [requestId, setRequestId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<any | null>(null);
  const { toast } = useToast();

  // Check for request ID in URL hash on mount
  useEffect(() => {
    // If initialRequestId is provided, use it
    if (initialRequestId) {
      setRequestId(initialRequestId);
      fetchOrderDetails(initialRequestId);
      return;
    }
    
    // Otherwise check URL hash for 'id' parameter
    if (typeof window !== 'undefined') {
      // Get the hash part without the #
      const hashPart = window.location.hash.substring(1);
      
      // Check if there's a query part after the hash
      if (hashPart.includes('?')) {
        const queryString = hashPart.split('?')[1];
        const params = new URLSearchParams(queryString);
        const idFromHash = params.get('id');
        
        if (idFromHash) {
          setRequestId(idFromHash);
          fetchOrderDetails(idFromHash);
          
          // Scroll to the track-order section after a short delay
          setTimeout(() => {
            const trackSection = document.getElementById('track-order');
            if (trackSection) {
              trackSection.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        }
      }
    }
  }, [initialRequestId]);

  const fetchOrderDetails = async (id: string) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setError(null);
    setOrderDetails(null);

    try {
      const response = await fetch(`/api/order-status/${encodeURIComponent(id.trim())}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderDetails(requestId);
  };

  // Determine the order status from Zinc API response
  const getOrderStatus = (orderDetails: any): string => {
    if (!orderDetails) return 'unknown';
    
    // Check for error responses
    if (orderDetails._type === 'error') {
      return 'failed';
    }
    
    // Check for specific status from Zinc
    if (orderDetails.tracking_number) return 'tracking';
    
    // Check the status updates
    if (orderDetails.status_updates && orderDetails.status_updates.length > 0) {
      const statusTypes = orderDetails.status_updates.map((update: any) => update.type);
      
      if (statusTypes.includes('order.delivered')) return 'delivered';
      if (statusTypes.includes('order.shipped') || statusTypes.includes('tracking.obtained')) return 'shipped';
      if (statusTypes.includes('order.confirmed')) return 'confirmed';
      // Check if the request finished with failure
      if (statusTypes.includes('request.finished')) {
        const finishedUpdate = orderDetails.status_updates.find((update: any) => update.type === 'request.finished');
        if (finishedUpdate && finishedUpdate.data && finishedUpdate.data.success === false) {
          return 'failed';
        }
        if (statusTypes.every((type: string) => !type.startsWith('order.'))) {
          return 'processing';
        }
      }
    }
    
    // Check for processing status
    if (orderDetails.is_processing) return 'processing';
    
    // Check for error code
    if (orderDetails.code) return 'failed';
    
    return orderDetails.status || 'unknown';
  };
  
  // Get status message
  const getStatusMessage = (orderDetails: any): string => {
    if (!orderDetails) return 'No information available';
    
    // Handle error cases
    if (orderDetails._type === 'error' || orderDetails.code) {
      return orderDetails.message || 'There was an error with this order';
    }
    
    // Handle processing cases
    if (orderDetails.is_processing) {
      return orderDetails.processing_message || 'Your order is being processed';
    }
    
    // Check status updates for messages
    if (orderDetails.status_updates && orderDetails.status_updates.length > 0) {
      const latestUpdate = orderDetails.status_updates[orderDetails.status_updates.length - 1];
      return latestUpdate.message || 'Order status updated';
    }
    
    return 'Order status: ' + getOrderStatus(orderDetails);
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
  
  // Convert cents to dollars
  const centsToUSD = (cents: number) => {
    return (cents / 100).toFixed(2);
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
                    getStatusColor(getOrderStatus(orderDetails)))}>
                    {getOrderStatus(orderDetails).charAt(0).toUpperCase() + getOrderStatus(orderDetails).slice(1)}
                  </div>
                </div>

                {getOrderStatus(orderDetails) === 'failed' && (
                  <div className="p-3 bg-red-50 text-red-800 rounded-md">
                    <div className="flex gap-2 items-center mb-1">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Order Failed</span>
                    </div>
                    <p className="text-sm">
                      {getStatusMessage(orderDetails)}
                    </p>
                    {orderDetails.code && (
                      <p className="text-xs mt-1 text-red-700">Error code: {orderDetails.code}</p>
                    )}
                    {orderDetails.data && orderDetails.data.max_price && orderDetails.data.price_components && (
                      <div className="mt-2 text-sm">
                        <p>Price exceeded maximum:</p>
                        <div className="mt-1 grid grid-cols-2 gap-x-4 text-xs">
                          <span>Maximum allowed:</span>
                          <span className="font-medium">${centsToUSD(orderDetails.data.max_price)}</span>
                          <span>Actual price:</span>
                          <span className="font-medium">${centsToUSD(orderDetails.data.price_components.total)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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

                {orderDetails.delivery_dates && orderDetails.delivery_dates.length > 0 && (
                  <div className="p-3 bg-blue-50 text-blue-800 rounded-md">
                    <div className="flex gap-2 items-center mb-1">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">Estimated Delivery</span>
                    </div>
                    <p className="text-sm">
                      {orderDetails.delivery_dates[0].delivery_date}
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

                {orderDetails._checkout_items && orderDetails._checkout_items.length > 0 ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ordered Items</p>
                    <div className="space-y-3">
                      {orderDetails._checkout_items.map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-md">
                          <p className="font-medium text-sm">{item.title || item.product_id}</p>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-gray-500">Quantity:</span>
                            <span>{item.quantity}</span>
                          </div>
                          {item.seller_id && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Seller:</span>
                              <span>{item.seller_id}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : orderDetails.products && orderDetails.products.length > 0 && !orderDetails.is_processing && (
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
                        <span>${orderDetails.price_components.subtotal ? centsToUSD(orderDetails.price_components.subtotal) : '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>${orderDetails.price_components.shipping ? centsToUSD(orderDetails.price_components.shipping) : '0.00'}</span>
                      </div>
                      {orderDetails.price_components.tax && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>${centsToUSD(orderDetails.price_components.tax)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold mt-1 pt-1 border-t">
                        <span>Total:</span>
                        <span>${orderDetails.price_components.total ? centsToUSD(orderDetails.price_components.total) : '0.00'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {orderDetails.status_updates && orderDetails.status_updates.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status Updates</p>
                    <div className="space-y-2">
                      {orderDetails.status_updates.map((update: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-2 rounded text-sm">
                          <div className="flex justify-between">
                            <span className="font-medium">{update.type}</span>
                            <span className="text-xs text-gray-500">
                              {update._created_at ? formatDate(update._created_at) : ''}
                            </span>
                          </div>
                          <p className="text-gray-700">{update.message}</p>
                        </div>
                      ))}
                    </div>
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