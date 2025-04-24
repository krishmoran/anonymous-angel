import { useState, useEffect, useCallback } from 'react';

interface OrderUpdate {
  request_id: string;
  status: string;
  product_name: string;
  recipient_name: string;
  price: number;
  created_at: string;
  tracking_number?: string;
  carrier?: string;
  tracking_url?: string;
  last_updated?: string;
  [key: string]: any;
}

export function useOrderUpdates(requestId?: string) {
  const [order, setOrder] = useState<Partial<OrderUpdate> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!requestId) return;

    let eventSource: EventSource | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    const connectSSE = () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Close existing connection if any
        if (eventSource) {
          eventSource.close();
        }
        
        // Connect to SSE endpoint
        eventSource = new EventSource(`/api/order-updates/${requestId}`);
        
        // Connection opened
        eventSource.onopen = () => {
          setIsConnected(true);
          setIsLoading(false);
          retryCount = 0; // Reset retry count on successful connection
        };
        
        // Handle messages
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.event === 'connected') {
              console.log('SSE connected:', data);
              setIsConnected(true);
            } 
            else if (data.event === 'update' && data.order) {
              console.log('Order update received:', data.order);
              setOrder(data.order);
            }
            else if (data.event === 'error') {
              console.error('SSE error event:', data);
              setError(data.message || 'Unknown error');
            }
            else if (data.event === 'heartbeat') {
              // Just a keep-alive, no need to do anything
            }
            else if (data.event === 'timeout') {
              console.log('SSE timeout:', data);
              // Reconnect if needed and still on the same page
              connectSSE();
            }
          } catch (e) {
            console.error('Error parsing SSE message:', e, event.data);
          }
        };
        
        // Handle errors
        eventSource.onerror = (e) => {
          console.error('SSE connection error:', e);
          setIsConnected(false);
          setIsLoading(false);
          
          // Try to reconnect with exponential backoff
          if (retryCount < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
            retryCount++;
            
            console.log(`Retrying SSE connection in ${delay}ms (attempt ${retryCount}/${maxRetries})...`);
            setTimeout(connectSSE, delay);
          } else {
            setError('Failed to connect to update service after multiple attempts');
            // Close the connection after max retries
            if (eventSource) {
              eventSource.close();
              eventSource = null;
            }
          }
        };
      } catch (e) {
        console.error('Error setting up SSE:', e);
        setError('Failed to connect to update service');
        setIsLoading(false);
      }
    };
    
    // Initial connection
    connectSSE();
    
    // Cleanup
    return () => {
      if (eventSource) {
        console.log('Closing SSE connection');
        eventSource.close();
        eventSource = null;
      }
    };
  }, [requestId]);

  // For manually reconnecting if needed
  const reconnect = useCallback(() => {
    if (!requestId) return;
    
    setIsLoading(true);
    setError(null);
    
    // Fetch current status first
    fetch(`/api/check-order-status?requestId=${requestId}`)
      .then(res => res.json())
      .then(data => {
        // Update with latest data from API
        if (data.success) {
          setOrder({
            request_id: data.request_id,
            status: data.status,
            tracking_number: data.tracking?.tracking_number,
            carrier: data.tracking?.carrier,
            tracking_url: data.tracking?.url,
          });
        }
      })
      .catch(err => {
        console.error('Error fetching order status:', err);
      })
      .finally(() => {
        setIsLoading(false);
        // Force reload the page to reconnect SSE
        window.location.reload();
      });
  }, [requestId]);

  return {
    order,
    isConnected,
    isLoading,
    error,
    reconnect
  };
} 