import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/rate-limit'
import { orderLookupSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'

  // DB-backed rate limiter (5 queries per IP per hour)
  const rateLimitRes = await checkRateLimit(ip, 'address_lookup', 5, 3600)
  if (!rateLimitRes.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const searchParams = request.nextUrl.searchParams
  const mobileParam = searchParams.get('mobile')

  const parsed = orderLookupSchema.safeParse({ mobile: mobileParam })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid mobile number' }, { status: 400 })
  }

  const mobile = parsed.data.mobile

  const supabase = createAdminClient()

  // Find customer by mobile number
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('mobile', mobile)
    .maybeSingle()

  if (!customer) {
    return NextResponse.json({ found: false })
  }

  // Find their most recent order to get the address
  const { data: order } = await supabase
    .from('orders')
    .select('address_line1, address_line2, city, state, pincode')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!order) {
    return NextResponse.json({ found: false })
  }

  // Masking address
  const maskedPincode = order.pincode.slice(-4)

  return NextResponse.json({
    found: true,
    maskedIdentifier: maskedPincode,
  })
}
