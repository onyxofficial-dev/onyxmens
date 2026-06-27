import { notFound, redirect } from 'next/navigation'
import { validateRole } from '@/lib/supabase/server'
import ProductForm from '../../_components/ProductForm'
import { getProductForEdit } from '../../actions'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const product = await getProductForEdit(resolvedParams.id)
  if (!product) return { title: 'Edit Product | Admin' }
  return {
    title: `Edit ${product.name} | Admin`,
  }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  try {
    await validateRole(['full_admin'])
  } catch (err) {
    redirect('/admin/login')
  }

  const resolvedParams = await params
  const product = await getProductForEdit(resolvedParams.id)

  if (!product) {
    notFound()
  }

  // Format initial variants and images
  const initialProduct = {
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
    intent_tags: product.intent_tags || [],
    is_featured: product.is_featured || false,
    is_live: product.is_live || false,
    is_active: product.is_active ?? true,
  }

  const initialVariants = (product.product_variants || []).map((v: any) => ({
    id: v.id,
    size: v.size,
    color: v.color,
    color_hex: v.color_hex || '',
    stock_quantity: v.stock_quantity,
  }))

  const initialImages = (product.product_images || []).map((img: any) => ({
    id: img.id,
    image_url: img.image_url,
    sort_order: img.sort_order || 0,
    is_cover: img.is_cover || false,
  })).sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-6">
      <h1 className="font-bebas-neue text-4xl font-black">EDIT PRODUCT</h1>
      <ProductForm
        initialProduct={initialProduct}
        initialVariants={initialVariants}
        initialImages={initialImages}
      />
    </div>
  )
}
