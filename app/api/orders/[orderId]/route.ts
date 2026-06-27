import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

import { checkRateLimit } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
    const rateLimitRes = await checkRateLimit(ip, 'order_tracking', 10, 900) // max 10 per 15 mins
    if (!rateLimitRes.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const phone = request.headers.get('x-guest-phone') || request.headers.get('X-Guest-Phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    const resolvedParams = await params
    const orderId = resolvedParams.orderId

    const supabase = createAdminClient()

    // Fetch order matching order_ref and phone
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('order_ref', orderId)
      .eq('customer_mobile', phone)
      .single()

    if (orderErr || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Fetch order items
    const { data: items, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)

    if (itemsErr) {
      return NextResponse.json(
        { error: 'Failed to retrieve order items' },
        { status: 500 }
      )
    }

    const formattedItems = (items || []).map((item: any) => {
      const size = item.variant_label ? item.variant_label.split(' / ')[0] : 'N/A'
      return {
        product_name: item.product_name,
        size,
        quantity: item.quantity,
        price_inr: item.unit_price,
      }
    })

    const orderData = {
      order_number: order.order_ref,
      status: order.status,
      created_at: order.created_at,
      estimated_delivery_date: null,
      tracking_number: null,
      items: formattedItems,
      total_inr: order.subtotal,
      shipping_address: {
        first_name: order.customer_name,
        address_line_1: order.address_line1,
        city: order.city,
        state: order.state,
        pincode: order.pincode,
      }
    }

    return NextResponse.json(orderData)
  } catch (error) {
    console.error('Order lookup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
