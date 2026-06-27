import { createAdminClient } from '@/lib/supabase/admin'
import { validateRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminOrdersClient from './AdminOrdersClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Orders | Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  try {
    await validateRole(['full_admin', 'order_fulfillment'])
  } catch (err) {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()
  
  const { data: initialOrders } = await supabase
    .from('orders')
    .select('id, order_ref, status, customer_name, customer_mobile, customer_email, address_line1, address_line2, city, state, pincode, payment_method, notes, subtotal, created_at, is_same_day_delivery, order_items(id, product_name, variant_label, quantity, unit_price, product_image_url)')
    .order('created_at', { ascending: false })

  return <AdminOrdersClient initialOrders={initialOrders || []} />
}
