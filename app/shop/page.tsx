import { createClient } from '@/lib/supabase/server'
import ShopClient from './ShopClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shop Mens Clothing — T-Shirts, Shirts, Jeans, Outerwear',
  description: 'Browse the full Onyx mens clothing collection — t-shirts, shirts, jeans, outerwear. Premium Indian menswear. Same-day delivery in Jamnagar.',
  alternates: { canonical: '/shop' },
}

export const revalidate = 60

export default async function ShopPage() {
  const supabase = await createClient()

  // Fetch all active and live products
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, base_price, fit_notes, fit,
      product_images (image_url, is_cover)
    `)
    .eq('is_active', true)
    .eq('is_live', true)
    .order('created_at', { ascending: false })

  const activeProducts = products || []

  // Compute category counts dynamically
  const categoryCounts: Record<string, number> = {
    't-shirts': 0,
    'shirts': 0,
    'jeans': 0,
    'outerwear': 0,
  }

  activeProducts.forEach((p: any) => {
    const cat = p.category ? p.category.toLowerCase() : ''
    if (cat in categoryCounts) {
      categoryCounts[cat]++
    }
  })

  // Explicit type mapping to ensure compatibility
  const formattedProducts = activeProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || '',
    category: p.category,
    base_price: p.base_price,
    fit: p.fit ?? null,
    product_images: p.product_images || [],
  }))

  return (
    <ShopClient
      products={formattedProducts}
      categoryCounts={categoryCounts}
    />
  )
}
