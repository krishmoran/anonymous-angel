import { useEffect, useState } from 'react';
import { useOrderUpdates } from '@/hooks/use-order-updates';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface RealTimeOrderStatusProps {
  requestId: string;
  className?: string;
  onStatusChange?: (status: string, isComplete: boolean) => void;
}

export function RealTimeOrderStatus({
  requestId,
  className,
  onStatusChange,
}: RealTimeOrderStatusProps) {
  const { order, isConnected, isLoading, error, reconnect } = useOrderUpdates(requestId);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);

  // Determine if the order process is complete based on status
  const isComplete = !!(order?.status && 
    !['processing', 'request_processing', 'pending'].includes(order.status));

  useEffect(() => {
    if (order?.status && order.status !== currentStatus) {
      setCurrentStatus(order.status);
      
      // Notify parent component if status changed
      if (onStatusChange) {
        onStatusChange(order.status, isComplete);
      }
    }
  }, [order?.status, currentStatus, isComplete, onStatusChange]);

  // Get message based on status
  const getMessage = () => {
    if (error) return error;
    if (isLoading && !order) return "Connecting to order system...";
    if (!isConnected) return "Waiting for connection to order system...";
    
    if (!order) return "Waiting for order information...";
    
    // Status-based messages
    if (order.status === 'processing' || order.status === 'request_processing' || order.status === 'pending') {
      return "Processing your order... this may take a moment";
    }
    
    if (order.status === 'shipped') return "Your gift has shipped!";
    if (order.status === 'tracking') return "Tracking information available!";
    if (order.status === 'completed') return "Order complete!";
    if (order.status === 'failed') return "Order processing failed";
    
    return `Order status: ${order.status}`;
  };

  // Get icon based on status
  const getStatusIcon = () => {
    if (isLoading || !order?.status || 
        ['processing', 'request_processing', 'pending'].includes(order.status)) {
      return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
    }
    
    if (error || !isConnected) {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
    
    if (['completed', 'shipped', 'tracking'].includes(order.status)) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    
    if (order.status === 'failed') {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    
    return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
  };
  
  // Progress percentage for visual indication
  const getProgressPercentage = () => {
    if (isComplete) return 100;
    if (!order) return 10;
    
    // Status-based progress
    switch (order.status) {
      case 'pending': return 20;
      case 'processing': return 40;
      case 'request_processing': return 40;
      default: return 60;
    }
  };

  // Show tracking information if available
  const hasTracking = !!(order?.tracking_number && order?.carrier);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <span className="text-sm font-medium">{getMessage()}</span>
        
        {(!isConnected || error) && (
          <Button 
            variant="outline" 
            size="sm"
            className="ml-auto gap-1"
            onClick={reconnect}
          >
            <RefreshCcw className="w-3 h-3" />
            Reconnect
          </Button>
        )}
      </div>
      
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            isComplete ? "bg-green-500" : "bg-blue-500"
          )}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      {hasTracking && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
          <p className="font-medium mb-1">Tracking Information:</p>
          <p className="text-gray-600">
            {order.carrier}: {order.tracking_number}
          </p>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline mt-1 inline-block"
            >
              Track Package
            </a>
          )}
        </div>
      )}
      
      {(order?.status === 'processing' || order?.status === 'request_processing') && (
        <p className="text-xs text-gray-500 italic">
          This may take up to a minute to complete
        </p>
      )}
    </div>
  );
} 