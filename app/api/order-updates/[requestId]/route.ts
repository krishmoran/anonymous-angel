import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const requestId = params.requestId;
  
  if (!requestId) {
    return NextResponse.json(
      { success: false, message: 'Missing request ID' },
      { status: 400 }
    );
  }
  
  // Set headers for SSE
  const responseHeaders = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable buffering for Nginx
  });

  // Create a new readable stream
  const stream = new ReadableStream({
    async start(controller) {
      // Track if controller is closed to prevent "Controller is already closed" errors
      let isControllerClosed = false;
      
      // Safe wrapper to enqueue data only if controller is still open
      const safeEnqueue = (data: string) => {
        if (!isControllerClosed) {
          try {
            controller.enqueue(data);
          } catch (error) {
            console.error('Error enqueueing data:', error);
            // If we get an error enqueueing, consider the controller closed
            isControllerClosed = true;
          }
        }
      };
      
      // Safe wrapper to close controller only if not already closed
      const safeClose = () => {
        if (!isControllerClosed) {
          try {
            controller.close();
            isControllerClosed = true;
          } catch (error) {
            console.error('Error closing controller:', error);
          }
        }
      };

      // Send initial message
      safeEnqueue(`data: ${JSON.stringify({ event: 'connected', requestId })}\n\n`);

      try {
        // Fetch initial order data
        const { data: orderData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('request_id', requestId)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          safeEnqueue(`data: ${JSON.stringify({ event: 'error', message: 'Order not found' })}\n\n`);
          safeClose();
          return;
        }

        // Send initial data
        safeEnqueue(`data: ${JSON.stringify({ event: 'update', order: orderData })}\n\n`);

        // Set up real-time subscription
        const subscription = supabase
          .channel(`order-${requestId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'orders',
              filter: `request_id=eq.${requestId}`,
            },
            (payload) => {
              safeEnqueue(`data: ${JSON.stringify({ event: 'update', order: payload.new })}\n\n`);
            }
          )
          .subscribe();

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          subscription.unsubscribe();
          safeClose();
        });
        
        // Keep the connection alive with heartbeats
        const heartbeatInterval = setInterval(() => {
          if (isControllerClosed) {
            clearInterval(heartbeatInterval);
            return;
          }
          safeEnqueue(`data: ${JSON.stringify({ event: 'heartbeat' })}\n\n`);
        }, 30000); // 30 seconds
        
        // Clean up on abort
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
        });
        
        // Auto-close after 10 minutes (600000ms) to prevent hanging connections
        setTimeout(() => {
          if (!isControllerClosed) {
            safeEnqueue(`data: ${JSON.stringify({ event: 'timeout', message: 'Connection timeout after 10 minutes' })}\n\n`);
            subscription.unsubscribe();
            clearInterval(heartbeatInterval);
            safeClose();
          }
        }, 600000);
      } catch (error) {
        console.error('Error in SSE stream:', error);
        safeEnqueue(`data: ${JSON.stringify({ event: 'error', message: 'Server error' })}\n\n`);
        safeClose();
      }
    }
  });

  return new Response(stream, {
    headers: responseHeaders,
  });
} 