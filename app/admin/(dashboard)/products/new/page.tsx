import { validateRole } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductForm from '../_components/ProductForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'New Product | Admin',
}

export default async function NewProductPage() {
  try {
    await validateRole(['full_admin'])
  } catch (err) {
    redirect('/admin/login')
  }

  return (
    <div className="space-y-6">
      <h1 className="font-bebas-neue text-4xl font-black">NEW PRODUCT</h1>
      <ProductForm />
    </div>
  )
}
