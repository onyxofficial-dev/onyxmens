import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) {
      return false
    }
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  // Authorization check using timing-safe comparison
  const authHeader = request.headers.get('authorization') || ''
  const expectedHeader = `Bearer ${process.env.CRON_SECRET || ''}`
  if (!secureCompare(authHeader, expectedHeader) || !process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Calculate the time 2 hours ago
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()

  // Find all pending orders older than 2 hours
  const { data: expiredOrders, error: fetchError } = await supabase
    .from('orders')
    .select('id')
    .eq('status', 'pending')
    .lt('created_at', twoHoursAgo)

  if (fetchError) {
    console.error('Failed to fetch expired orders:', fetchError)
    return NextResponse.json({ error: 'Failed to fetch expired orders' }, { status: 500 })
  }

  if (!expiredOrders || expiredOrders.length === 0) {
    return NextResponse.json({ success: true, count: 0, message: 'No orders to expire.' })
  }

  const orderIds = expiredOrders.map(o => o.id)

  // Update status to 'expired'
  const { error: updateError } = await supabase
    .from('orders')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .in('id', orderIds)

  if (updateError) {
    console.error('Failed to update expired orders:', updateError)
    return NextResponse.json({ error: 'Failed to update expired orders' }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: orderIds.length, message: `Expired ${orderIds.length} orders.` })
}
