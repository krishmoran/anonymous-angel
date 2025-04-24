"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Container } from '@/components/container';
import { Package, Truck, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Order {
  request_id: string;
  product_name: string;
  recipient_name: string;
  price: number;
  created_at: string;
  zinc_status: string;
  tracking_number?: string;
  carrier?: string;
}

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { toast } = useToast();

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }

      setOrders(data.orders);
      setVerified(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch orders',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'tracking':
        return <Truck className="w-6 h-6 text-blue-500" />;
      default:
        return <Package className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-rose-50 py-10">
      <Container>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Track Your Orders</h1>
          
          {!verified ? (
            <Card>
              <CardHeader>
                <CardTitle>Verify Your Email</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'View Orders'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No orders found for this email.</p>
                  </CardContent>
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.request_id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg mb-2">{order.product_name}</h3>
                          <p className="text-gray-500 text-sm mb-1">To: {order.recipient_name}</p>
                          <p className="text-gray-500 text-sm mb-2">
                            Order ID: {order.request_id}
                          </p>
                          <p className="text-gray-500 text-sm">
                            Placed on: {new Date(order.created_at).toLocaleDateString()}
                          </p>
                          {order.tracking_number && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <p className="text-sm font-medium">Tracking Info:</p>
                              <p className="text-sm text-gray-600">
                                {order.carrier}: {order.tracking_number}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          {getStatusIcon(order.zinc_status)}
                          <p className="text-lg font-medium mt-2">
                            ${order.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setVerified(false)}
              >
                Check Different Email
              </Button>
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}