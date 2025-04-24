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
    }

    // Determine status for our database
    let status = body.status;
    
    // Handle the 'request_processing' special status that comes as an error
    if (body._type === 'error' && body.code === 'request_processing') {
      status = 'processing';
    } else if (body._type === 'error') {
      status = 'failed';
    }

    // Update order in our database
    const { error } = await supabase
      .from('orders')
      .update({
        status: status,
        tracking_number: trackingInfo?.tracking_number,
        carrier: trackingInfo?.carrier,
        tracking_url: trackingInfo?.url,
        last_updated: new Date().toISOString(),
        raw_response: body // Store the full response for debugging
      })
      .eq('request_id', body.request_id);

    if (error) {
      console.error('Error updating order in database:', error);
      return NextResponse.json(
        { success: false, message: 'Database error' },
        { status: 500 }
      );
    }

    // Always return a 200 success to the webhook sender
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Even on error, return 200 to acknowledge receipt
    // This prevents Zinc from retrying the webhook unnecessarily
    return NextResponse.json({ success: true });
  }
} 