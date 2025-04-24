import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Parse the webhook body
    const body = await request.json();
    console.log('Received Zinc webhook:', {
      request_id: body.request_id,
      status: body.status,
      _type: body._type,
      code: body.code,
      tracking: !!body.tracking,
      _webhook_type: body._webhook_type
    });

    // Validate webhook data
    if (!body.request_id) {
      console.error('Invalid webhook data: Missing request_id');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Extract tracking info if available
    let trackingInfo = null;
    if (body.tracking) {
      trackingInfo = {
        tracking_number: body.tracking.tracking_number,
        carrier: body.tracking.carrier,
        url: body.tracking.url
      };
      console.log('Tracking info received:', trackingInfo);
    }

    // Determine status for our database with improved mapping
    let status = body.status || 'pending';
    
    // Handle webhook type-specific status 
    if (body._webhook_type === 'tracking_obtained') {
      status = 'tracking';
    } else if (body._webhook_type === 'request_succeeded') {
      status = 'completed';
    } else if (body._webhook_type === 'request_failed') {
      status = 'failed';
    }
    
    // Handle the 'request_processing' special status that comes as an error
    if (body._type === 'error' && body.code === 'request_processing') {
      status = 'processing';
    } else if (body._type === 'error') {
      status = 'failed';
    }
    
    // If we have tracking, upgrade the status
    if (trackingInfo && trackingInfo.tracking_number) {
      status = status === 'failed' ? status : 'tracking';
    }

    console.log(`Setting status for order ${body.request_id} to: ${status}`);

    // Update order in our database
    const { error } = await supabase
      .from('orders')
      .update({
        status: status,
        tracking_number: trackingInfo?.tracking_number,
        carrier: trackingInfo?.carrier,
        tracking_url: trackingInfo?.url,
        last_updated: new Date().toISOString(),
        raw_webhook: JSON.stringify(body) // Store the full webhook for debugging
      })
      .eq('request_id', body.request_id);

    if (error) {
      console.error('Error updating order in database:', error);
      // Still return success to acknowledge the webhook
      return NextResponse.json({ 
        success: true,
        message: 'Webhook received, but database update failed',
        error: error.message
      });
    }

    // Always return a 200 success to the webhook sender
    return NextResponse.json({ 
      success: true,
      status: status,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Even on error, return 200 to acknowledge receipt
    // This prevents Zinc from retrying the webhook unnecessarily
    return NextResponse.json({ 
      success: true,
      message: 'Webhook received but processing failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 