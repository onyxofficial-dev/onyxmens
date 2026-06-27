import { createClient, validateRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminProductsClient from './AdminProductsClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Products | Admin',
}

export type AdminProduct = {
  id: string
  name: string
  slug: string
  category: string
  base_price: number
  is_active: boolean
  is_live: boolean
  coverImage: string | null
  isFullyOOS: boolean
  isPartialOOS: boolean
}

export default async function AdminProductsPage() {
  try {
    await validateRole(['full_admin', 'inventory_editor'])
  } catch (err) {
    redirect('/admin/login')
  }

  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, base_price, is_active, is_live,
      product_images(image_url, is_cover),
      product_variants(stock_quantity, is_out_of_stock)
    `)
    .order('created_at', { ascending: false })

  const products: AdminProduct[] = (data || []).map((p: any) => {
    const images = p.product_images || []
    const variants = p.product_variants || []

    const coverImage =
      images.find((i: any) => i.is_cover)?.image_url ??
      images[0]?.image_url ??
      null

    const isFullyOOS =
      variants.length === 0 ||
      variants.every((v: any) => v.is_out_of_stock || v.stock_quantity === 0)

    const isPartialOOS =
      !isFullyOOS &&
      variants.some((v: any) => v.is_out_of_stock || v.stock_quantity === 0)

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      base_price: p.base_price,
      is_active: p.is_active,
      is_live: p.is_live,
      coverImage,
      isFullyOOS,
      isPartialOOS,
    }
  })

  return <AdminProductsClient products={products} />
}
