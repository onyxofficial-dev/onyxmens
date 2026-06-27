import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryClient from './CategoryClient'
import { Metadata } from 'next'
import { SITE_DESCRIPTION } from '@/lib/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const category = resolvedParams.category ? resolvedParams.category.toLowerCase() : ''
  const map: Record<string, Metadata> = {
    't-shirts': {
      title: 'Mens T-Shirts',
      description: 'Shop premium mens t-shirts from Onyx. Minimalist urban designs, quality fabric. Same-day delivery in Jamnagar, Gujarat.',
      alternates: { canonical: '/shop/t-shirts' },
    },
    shirts: {
      title: 'Mens Shirts',
      description: 'Shop premium mens shirts from Onyx. Minimalist cuts, quality fabric. Same-day delivery in Jamnagar, Gujarat.',
      alternates: { canonical: '/shop/shirts' },
    },
    jeans: {
      title: 'Mens Jeans',
      description: 'Shop premium mens jeans from Onyx. Clean silhouettes, quality denim. Same-day delivery in Jamnagar, Gujarat.',
      alternates: { canonical: '/shop/jeans' },
    },
    outerwear: {
      title: 'Mens Outerwear & Jackets',
      description: 'Shop premium mens outerwear and jackets from Onyx. Urban Indian menswear. Same-day delivery in Jamnagar, Gujarat.',
      alternates: { canonical: '/shop/outerwear' },
    },
  }
  return (
    map[category] ?? {
      title: 'Shop Mens Clothing',
      description: SITE_DESCRIPTION,
      alternates: { canonical: '/shop' },
    }
  )
}

export const revalidate = 60

const categoryData: Record<string, { name: string }> = {
  't-shirts': { name: 'T-Shirts' },
  'shirts':   { name: 'Shirts' },
  'jeans':    { name: 'Jeans' },
  'outerwear':{ name: 'Outerwear' },
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params
  const category = resolvedParams.category ? resolvedParams.category.toLowerCase() : ''

  const categoryInfo = categoryData[category]
  if (!categoryInfo) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch all active and live products for this category
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, base_price, created_at, fit_notes, fit,
      product_images (image_url, is_cover)
    `)
    .eq('category', category)
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

  return (
    <CategoryClient
      categorySlug={category}
      categoryName={categoryInfo.name}
      products={formattedProducts}
    />
  )
}
