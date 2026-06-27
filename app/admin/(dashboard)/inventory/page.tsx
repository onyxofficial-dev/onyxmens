import { createAdminClient } from '@/lib/supabase/admin'
import { validateRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminInventoryClient from './AdminInventoryClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inventory | Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminInventoryPage() {
  try {
    await validateRole(['full_admin', 'inventory_editor'])
  } catch (err) {
    redirect('/admin/login')
  }

  const supabase = createAdminClient()
  
  const { data } = await supabase
    .from('product_variants')
    .select(`
      id, product_id, size, color, stock_quantity, is_out_of_stock,
      products (
        name,
        product_images (image_url, is_cover)
      )
    `)
    .order('stock_quantity', { ascending: true })
  
  const formatted = data?.map(d => ({
    ...d,
    products: d.products
  })) || []

  return <AdminInventoryClient variants={formatted as any[]} />
}
