'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

const ProductGrid = dynamic(() => import('@/components/ProductGrid').then(mod => mod.ProductGrid), {
  ssr: true,
  loading: () => <div className="h-96 w-full bg-neutral-200/10 animate-pulse" />
})

type ProductImage = {
  image_url: string
  is_cover: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  category: string
  base_price: number
  fit: string | null
  product_images?: ProductImage[]
}

type IntentTagClientProps = {
  tagKey: string
  tagName: string
  tagDescription: string
  products: Product[]
}

const CATEGORIES = ['All', 'T-Shirts', 'Shirts', 'Jeans']

export default function IntentTagClient({ tagKey, tagName, tagDescription, products }: IntentTagClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return products
    return products.filter(p => {
      const cat = p.category ? p.category.toLowerCase() : ''
      const sel = selectedCategory.toLowerCase()
      if (sel === 't-shirts') return cat === 't-shirts'
      if (sel === 'shirts') return cat === 'shirts'
      if (sel === 'jeans') return cat === 'jeans'
      return cat === sel
    })
  }, [products, selectedCategory])

  return (
    <>
      <Header />

      <main className="w-full bg-white">
        {/* Page Header */}
        <section className="w-full px-8 py-20 border-b border-black bg-black text-white">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="font-bebas-neue font-black text-white uppercase tracking-wide text-balance mb-4"
              style={{ fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 1 }}
            >
              {tagName}
            </h1>
            <p className="text-sm font-inter max-w-md opacity-80">{tagDescription}</p>
          </motion.div>
        </section>

        {/* Filter Bar */}
        <section className="w-full px-8 py-6 border-b border-black flex gap-4 overflow-x-auto sticky top-16 bg-white z-40">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs uppercase tracking-widest font-inter whitespace-nowrap px-4 py-2 transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-black text-white'
                  : 'bg-white text-black border border-black hover:bg-black hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Product Grid */}
        <section className="w-full px-8 py-12">
          {filtered.length > 0 ? (
            <ProductGrid products={filtered} />
          ) : (
            <div className="text-center py-12">
              <p className="text-sm font-inter opacity-60 mb-4">No products found with this combination.</p>
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-xs uppercase tracking-widest font-inter hover:underline font-bold cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
