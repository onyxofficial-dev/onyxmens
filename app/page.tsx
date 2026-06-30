import { createClient } from '@/lib/supabase/server'
import HomeClient from './HomeClient'
import type { Metadata } from 'next'
import { SITE_URL, SITE_DESCRIPTION } from '@/lib/site-config'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Onyx — Urban Menswear. Quality First.',
  description: 'Trend-led, not price-led. Quality menswear at a fair price, designed for the streets — with same-day delivery across Jamnagar.',
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch both featured products and latest active products in parallel
  const [featuredRes, latestRes] = await Promise.all([
    supabase
      .from('products')
      .select(`
        id, name, slug, base_price, category, fit_notes, fit,
        product_images (image_url, is_cover)
      `)
      .eq('is_active', true)
      .eq('is_live', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('products')
      .select(`
        id, name, slug, base_price, category, fit_notes, fit,
        product_images (image_url, is_cover)
      `)
      .eq('is_active', true)
      .eq('is_live', true)
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  let featured = featuredRes.data || []
  
  if (featured.length < 8) {
    const padding = latestRes.data || []
    const existingIds = new Set(featured.map((p: any) => p.id))
    
    for (const p of padding) {
      if (featured.length >= 8) break
      if (!existingIds.has(p.id)) {
        featured.push(p)
      }
    }
  }

  // Explicit type mapping to ensure compatibility
  const formattedFeatured = featured.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || '',
    base_price: p.base_price,
    category: p.category || '',
    fit: p.fit ?? null,
    product_images: p.product_images || [],
  }))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            "name": "Onyx Menswear",
            "url": SITE_URL,
            "description": SITE_DESCRIPTION,
            "areaServed": {
              "@type": "City",
              "name": "Jamnagar",
              "containedInPlace": {
                "@type": "State",
                "name": "Gujarat",
                "containedInPlace": { "@type": "Country", "name": "India" }
              }
            },
            "priceRange": "₹₹",
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Onyx Menswear Collection",
              "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Mens T-Shirts" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Mens Shirts" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Mens Jeans" } },
                { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Mens Outerwear" } }
              ]
            }
          }),
        }}
      />
      <HomeClient featuredProducts={formattedFeatured} />
    </>
  )
}
