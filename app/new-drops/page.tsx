import { createClient } from '@/lib/supabase/server'
import NewDropsClient from './NewDropsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Drops',
  description: 'Shop the latest streetwear releases and fresh collection drops from ONYX.',
}

export const revalidate = 60

export default async function NewDropsPage() {
  const supabase = await createClient()

  // Fetch all active and live products ordered by created_at DESC
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, base_price, created_at, fit_notes, fit,
      product_images (image_url, is_cover)
    `)
    .eq('is_active', true)
    .eq('is_live', true)
    .order('created_at', { ascending: false })

  const formattedProducts = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || '',
    category: p.category,
    base_price: p.base_price,
    created_at: p.created_at,
    fit: p.fit ?? null,
    product_images: p.product_images || [],
  }))

  return <NewDropsClient products={formattedProducts} />
}
