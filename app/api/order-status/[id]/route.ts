import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const requestId = params.id;

  if (!requestId) {
    return NextResponse.json(
      { success: false, message: 'Order ID is required' },
      { status: 400 }
    );
  }

  try {
    // 1. First check if the order exists in our database
    const { data: orderData, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('request_id', requestId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') {
      console.error('Database error:', dbError);
      throw new Error('Failed to retrieve order from database');
    }

    // 2. Fetch the order details from Zinc API
    const apiKey = process.env.ZINC_API_KEY;
    if (!apiKey) {
      console.error('ZINC_API_KEY is not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const zincUrl = `https://api.zinc.io/v1/orders/${requestId}`;
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };

    console.log(`Fetching Zinc order status for request_id: ${requestId}`);
    const response = await fetch(zincUrl, {
      method: 'GET',
      headers
    });

    const responseText = await response.text();
    let zincData;
    
    try {
      zincData = JSON.parse(responseText);
      console.log("Zinc API response:", JSON.stringify(zincData, null, 2));
    } catch (parseError) {
      console.error('Failed to parse Zinc API response:', {
        status: response.status,
        statusText: response.statusText,
        responseText
      });
      throw new Error('Invalid response from Zinc API');
    }

    // Handle processing status - this is actually a valid state, not an error
    if (zincData?._type === 'error' && zincData?.code === 'request_processing') {
      console.log("Processing request details:", JSON.stringify(zincData.request, null, 2));
      
      // Extract request data more comprehensively
      const { retailer, products, shipping_address, _created_at, gift_message } = zincData.request || {};
      
      const formattedDate = _created_at ? new Date(_created_at).toISOString() : new Date().toISOString();
      
      // Try to get product information from either the API or our database
      const productInfo = products && products.length > 0 
        ? products 
        : orderData?.product_id 
          ? [{ product_id: orderData.product_id, quantity: 1 }] 
          : [];

      return NextResponse.json({
        success: true,
        order: {
          status: 'processing',
          request_id: requestId,
          retailer: retailer || (orderData?.product_name ? 'Amazon' : 'Unknown'),
          products: productInfo,
          request_created: formattedDate,
          is_processing: true,
          processing_message: zincData.message || "Order is being processed",
          gift_message: gift_message || orderData?.message,
          recipient_name: shipping_address ? 
            `${shipping_address.first_name} ${shipping_address.last_name}` : 
            orderData?.recipient_name,
          request: zincData.request,
          local_details: orderData || null
        }
      });
    }

    if (!response.ok) {
      if (zincData?._type === 'error') {
        return NextResponse.json({
          success: false,
          message: zincData.message || 'Error retrieving order status',
          code: zincData.code
        }, { status: 400 });
      }
      
      throw new Error('Failed to retrieve order from Zinc API');
    }

    // 3. Combine our database data with Zinc data
    const combinedData = {
      success: true,
      order: {
        ...zincData,
        local_details: orderData || null
      }
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error retrieving order:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve order'
      },
      { status: 500 }
    );
  }
} 