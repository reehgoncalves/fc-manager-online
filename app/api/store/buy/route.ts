import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { item_name, item_type, price } = body;

    const mockUserId = "00000000-0000-0000-0000-000000000000"; 

    // Insert purchase into Supabase
    const { data, error } = await supabase
      .from('purchases')
      .insert([
        { 
          user_id: mockUserId,
          item_name,
          item_type,
          price
        }
      ]);

    // Update local stream state for WebSocket simulation
    // @ts-ignore
    if (!global.mockPurchases) global.mockPurchases = [];
    // @ts-ignore
    global.mockPurchases.push({ item_name, item_type, price, timestamp: new Date().toISOString() });

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ success: true, message: 'Local fallback: DB not configured', localOnly: true });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to process purchase' }, { status: 500 });
  }
}
