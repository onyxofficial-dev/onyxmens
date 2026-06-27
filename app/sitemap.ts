import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-config'
import { getAllPosts } from '@/lib/blog-data'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/new-drops`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/shop/t-shirts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/shop/shirts`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/shop/jeans`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/shop/outerwear`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  let productRoutes: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: products } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('is_active', true)
      .eq('is_live', true)

    if (products) {
      productRoutes = products.map((p) => ({
        url: `${SITE_URL}/products/${p.slug}`,
        lastModified: p.created_at ? new Date(p.created_at) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }))
    }
  } catch (error) {
    console.error('Sitemap product query error:', error)
  }

  const posts = getAllPosts()
  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [...staticRoutes, ...productRoutes, ...blogRoutes]
}
