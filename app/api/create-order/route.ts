import { NextResponse } from 'next/server';
import { GiftOrder } from '@/lib/types';
import { supabase } from '@/lib/supabase';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('Starting order creation...');
    const order: GiftOrder = await request.json();

    // Validate required fields
    if (!order.product || !order.shipping_address || !order.payment || !order.email) {
      console.error('Missing required fields:', {
        hasProduct: !!order.product,
        hasShipping: !!order.shipping_address,
        hasPayment: !!order.payment,
        hasEmail: !!order.email
      });
      return NextResponse.json(
        { success: false, message: 'Missing required information' },
        { status: 400 }
      );
    }

    // Validate Zinc API key
    const apiKey = process.env.ZINC_API_KEY;
    if (!apiKey) {
      console.error('ZINC_API_KEY is not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Preparing Zinc API request...');
    // Prepare the Zinc API request
    const zincUrl = 'https://api.zinc.io/v1/orders';
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };

    // Get base URL for webhooks
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}`;
    
    // Create webhook URLs
    const webhooks = {
      request_succeeded: `${baseUrl}/api/webhooks/order-status`,
      request_failed: `${baseUrl}/api/webhooks/order-status`,
      tracking_obtained: `${baseUrl}/api/webhooks/order-status`,
      tracking_updated: `${baseUrl}/api/webhooks/order-status`,
      status_updated: `${baseUrl}/api/webhooks/order-status`
    };

    // Calculate max_price - either use the API provided one or add buffer to product price
    const maxPrice = (order.product as any).max_price 
      ? Math.ceil((order.product as any).max_price * 100)
      : Math.ceil(order.product.price * 1.7 * 100);

    // Log sanitized request (excluding sensitive data)
    console.log('Zinc API request:', {
      url: zincUrl,
      method: 'POST',
      retailer: order.product.retailer,
      product_id: order.product.product_id,
      shipping_address: {
        ...order.shipping_address,
        phone_number: '[REDACTED]'
      },
      is_gift: true,
      shipping_method: 'cheapest',
      max_price: maxPrice.toString(),
      webhooks: webhooks
    });

    // Construct the Zinc API payload
    const zincData = {
      retailer: order.product.retailer,
      products: [
        {
          product_id: order.product.product_id,
          quantity: 1
        }
      ],
      shipping_address: order.shipping_address,
      shipping_method: 'cheapest',
      max_price: maxPrice.toString(), // Use calculated max price
      is_gift: true,
      gift_message: order.message || 'Anonymous Angel Gift',
      // Store client-specific data in client_notes
      client_notes: {
        customer_email: order.email,
        reveal_email: order.reveal_email || null,
        payment_collected: true
      },
      // Add webhooks for real-time status updates
      webhooks: webhooks
    };

    // Call the Zinc API
    console.log('Sending request to Zinc API...');
    const response = await fetch(zincUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(zincData)
    });

    let responseData;
    const responseText = await response.text();
    console.log('Raw Zinc API response:', responseText);
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Zinc API response:', {
        status: response.status,
        statusText: response.statusText,
        responseText,
        parseError
      });
      throw new Error('Invalid response from Zinc API');
    }

    if (!response.ok) {
      console.error('Zinc API error:', {
        status: response.status,
        statusText: response.statusText,
        responseData
      });
      throw new Error(responseData.message || 'Failed to place order');
    }

    const requestId = responseData.request_id;
    console.log('Order created successfully with request_id:', requestId);

    // Store order in Supabase
    console.log('Storing order in Supabase...');
    const { error: dbError } = await supabase.from('orders').insert({
      request_id: requestId,
      product_id: order.product.product_id,
      product_name: order.product.name,
      message: order.message,
      recipient_name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
      reveal_email: order.reveal_email,
      price: order.product.price,
      status: 'pending',
      customer_email: order.email
    });

    if (dbError) {
      console.error('Error storing order in database:', dbError);
      // Still return success since Zinc order was successful
      return NextResponse.json({
        success: true,
        request_id: requestId,
        message: 'Order placed successfully but failed to store in database',
        warning: dbError.message
      });
    }

    return NextResponse.json({
      success: true,
      request_id: requestId,
      message: 'Order placed successfully'
    });
  } catch (error) {
    console.error('Error processing order:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check if the error is from JSON parsing
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid request format'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while processing your order'
      },
      { status: 500 }
    );
  }
}