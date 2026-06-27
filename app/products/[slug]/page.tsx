import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './ProductDetailClient'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_live', true)
    .single()

  if (!product) return { title: 'Product Not Found' }
  return {
    title: product.name,
    description: product.description || `Buy ${product.name} from ONYX.`,
  }
}

export const revalidate = 60

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const slug = resolvedParams.slug

  const supabase = await createClient()

  // Fetch product, images and variants
  const { data: product, error } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, description,
      fabric_details, fit_notes, fit, design_tags, care_instructions, base_price,
      product_images (id, image_url, sort_order, is_cover),
      product_variants (id, size, color, color_hex, stock_quantity, is_out_of_stock)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_live', true)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch related products and count qualifying orders in parallel
  const [relatedRes, qualifyingItemsRes] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name, slug, base_price, category,
        product_images (id, image_url, sort_order, is_cover)
      `)
      .eq('category', product.category)
      .eq('is_active', true)
      .eq('is_live', true)
      .neq('id', product.id)
      .order('created_at', { ascending: false })
      .limit(4),
    supabase
      .from('order_items')
      .select('id, orders!inner(status)')
      .eq('product_id', product.id)
      .not('orders.status', 'in', '(cancelled,expired)')
  ])

  const related = relatedRes.data || []
  const qualifyingItems = qualifyingItemsRes.data || []

  // Explicit type mapping to ensure compatibility
  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug || '',
    category: product.category,
    description: product.description || '',
    fabric_details: product.fabric_details || '',
    fit_notes: product.fit_notes || '',
    fit: product.fit || null,
    design_tags: product.design_tags || [],
    care_instructions: product.care_instructions || '',
    base_price: product.base_price,
    product_images: product.product_images || [],
    product_variants: product.product_variants || [],
  }

  const formattedRelated = (related || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || '',
    category: p.category,
    description: '',
    fabric_details: '',
    fit_notes: '',
    fit: null,
    design_tags: [],
    care_instructions: '',
    base_price: p.base_price,
    product_images: p.product_images || [],
  }))

  const orderCount = qualifyingItems?.length ?? 0

  return (
    <ProductDetailClient
      product={formattedProduct}
      relatedProducts={formattedRelated}
      orderCount={orderCount}
    />
  )
}
