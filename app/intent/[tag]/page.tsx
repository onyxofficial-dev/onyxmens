import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import IntentTagClient from './IntentTagClient'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const tag = resolvedParams.tag ? resolvedParams.tag.toLowerCase() : ''
  const tagData = INTENT_TAGS[tag as keyof typeof INTENT_TAGS]
  if (!tagData) return { title: 'Collection Not Found' }
  return {
    title: tagData.name,
    description: tagData.description,
  }
}

export const revalidate = 60

const INTENT_TAGS = {
  tailored: { name: 'Tailored', description: 'Structured pieces for occasions that demand precision.' },
  'off-duty': { name: 'Off-duty', description: 'Designed to move. Nothing more, nothing less.' },
  layering: { name: 'Layering', description: 'Build depth. Master proportion.' },
  'festive-minimal': { name: 'Festive Minimal', description: 'Intention without excess. Minimal form, maximum presence.' },
  essentials: { name: 'Essentials', description: 'The foundations. No compromise.' },
}

export default async function IntentTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const resolvedParams = await params
  const tag = resolvedParams.tag ? resolvedParams.tag.toLowerCase() : ''

  const tagData = INTENT_TAGS[tag as keyof typeof INTENT_TAGS]
  if (!tagData) {
    notFound()
  }

  const supabase = await createClient()

  // Fetch all active and live products containing this tag in intent_tags array
  const { data: products } = await supabase
    .from('products')
    .select(`
      id, name, slug, category, base_price, fit_notes, fit,
      product_images (image_url, is_cover)
    `)
    .eq('is_active', true)
    .eq('is_live', true)
    .contains('intent_tags', [tag])
    .order('created_at', { ascending: false })

  const formattedProducts = (products || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug || '',
    category: p.category,
    base_price: p.base_price,
    fit: p.fit ?? null,
    product_images: p.product_images || [],
  }))

  return (
    <IntentTagClient
      tagKey={tag}
      tagName={tagData.name}
      tagDescription={tagData.description}
      products={formattedProducts}
    />
  )
}
