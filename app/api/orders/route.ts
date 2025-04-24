import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    // Get orders from Supabase where reveal_email matches
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('reveal_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // For each order, fetch status from Zinc API
    const zincUrl = 'https://api.zinc.io/v1/orders';
    const apiKey = process.env.ZINC_API_KEY || '987874333B1513ED144E0E53';
    const headers = {
      'Authorization': `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json'
    };

    const ordersWithStatus = await Promise.all(
      orders.map(async (order) => {
        try {
          const response = await fetch(`${zincUrl}/${order.request_id}`, {
            headers
          });
          
          if (!response.ok) {
            return { ...order, zinc_status: 'unknown' };
          }

          const zincData = await response.json();
          return {
            ...order,
            zinc_status: zincData.status,
            tracking_number: zincData.tracking_number,
            carrier: zincData.tracking_carrier
          };
        } catch (error) {
          console.error(`Error fetching Zinc status for order ${order.request_id}:`, error);
          return { ...order, zinc_status: 'unknown' };
        }
      })
    );

    return NextResponse.json({ orders: ordersWithStatus });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}