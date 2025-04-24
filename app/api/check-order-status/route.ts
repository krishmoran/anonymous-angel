import { NextResponse } from 'next/server';

// Add this export to mark the route as dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Get the requestId from the URL params
    const url = new URL(request.url);
    const requestId = url.searchParams.get('requestId');
    
    if (!requestId) {
      return NextResponse.json(
        { success: false, message: 'Missing request ID' },
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

    // Prepare the Zinc API request - this uses the orders endpoint to check status
    const zincUrl = `https://api.zinc.io/v1/orders/${requestId}`;
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };

    // Call the Zinc API to check status
    console.log('Checking order status with Zinc API...');
    const response = await fetch(zincUrl, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      console.error('Failed to check order status:', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { success: false, message: 'Failed to retrieve order status' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Order status response:', {
      request_id: requestId,
      status: data._type === 'error' ? 'error' : data.status || 'unknown',
      code: data.code
    });

    // For ZMA orders, handle the response format appropriately
    return NextResponse.json({
      success: data._type !== 'error',
      request_id: requestId,
      status: data.status || 'unknown',
      code: data.code,
      message: data.message,
      _type: data._type,
      merchant_order_ids: data.merchant_order_ids,
      tracking: data.tracking
    });
  } catch (error) {
    console.error('Error checking order status:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to check order status'
      },
      { status: 500 }
    );
  }
} 