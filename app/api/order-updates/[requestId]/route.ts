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
      // Send initial message
      controller.enqueue(
        `data: ${JSON.stringify({ event: 'connected', requestId })}\n\n`
      );

      try {
        // Fetch initial order data
        const { data: orderData, error } = await supabase
          .from('orders')
          .select('*')
          .eq('request_id', requestId)
          .single();

        if (error) {
          console.error('Error fetching order:', error);
          controller.enqueue(
            `data: ${JSON.stringify({ event: 'error', message: 'Order not found' })}\n\n`
          );
          controller.close();
          return;
        }

        // Send initial data
        controller.enqueue(
          `data: ${JSON.stringify({ event: 'update', order: orderData })}\n\n`
        );

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
              controller.enqueue(
                `data: ${JSON.stringify({ event: 'update', order: payload.new })}\n\n`
              );
            }
          )
          .subscribe();

        // Handle client disconnect
        request.signal.addEventListener('abort', () => {
          subscription.unsubscribe();
          controller.close();
        });
        
        // Keep the connection alive with heartbeats
        const heartbeatInterval = setInterval(() => {
          controller.enqueue(`data: ${JSON.stringify({ event: 'heartbeat' })}\n\n`);
        }, 30000); // 30 seconds
        
        // Clean up on abort
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeatInterval);
        });
        
        // Auto-close after 10 minutes (600000ms) to prevent hanging connections
        setTimeout(() => {
          clearInterval(heartbeatInterval);
          controller.enqueue(
            `data: ${JSON.stringify({ event: 'timeout', message: 'Connection timeout after 10 minutes' })}\n\n`
          );
          controller.close();
        }, 600000);
      } catch (error) {
        console.error('Error in SSE stream:', error);
        controller.enqueue(
          `data: ${JSON.stringify({ event: 'error', message: 'Server error' })}\n\n`
        );
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: responseHeaders,
  });
} 