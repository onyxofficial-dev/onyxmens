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
import { CATEGORY_FIT_MAP } from '@/lib/search-config'

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
  created_at: string
  fit: string | null
  product_images?: ProductImage[]
}

type CategoryClientProps = {
  categorySlug: string
  categoryName: string
  products: Product[]
}

export default function CategoryClient({ categorySlug, categoryName, products }: CategoryClientProps) {
  const [filter, setFilter] = useState<'all' | 'new'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')
  const [fitFilter, setFitFilter] = useState<string | null>(null)

  // Get valid fit values for this category
  const availableFits = useMemo(() => {
    return CATEGORY_FIT_MAP[categorySlug] || []
  }, [categorySlug])

  // Only show fit chips that have at least one product
  const activeFits = useMemo(() => {
    return availableFits.filter(f => products.some(p => p.fit === f))
  }, [availableFits, products])

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (filter === 'new') {
        const days = (Date.now() - new Date(p.created_at).getTime()) / (1000 * 60 * 60 * 24)
        if (days > 7) return false
      }
      if (fitFilter && p.fit !== fitFilter) return false
      return true
    })
  }, [products, filter, fitFilter])

  // Sort products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (sortBy === 'price-low') {
      return list.sort((a, b) => a.base_price - b.base_price)
    }
    if (sortBy === 'price-high') {
      return list.sort((a, b) => b.base_price - a.base_price)
    }
    // 'newest'
    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [filteredProducts, sortBy])

  return (
    <>
      <Header />
      
      <main className="bg-white">
        {/* Hero */}
        <section className="w-full h-48 bg-black text-white flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-bebas-neue text-5xl font-black mb-2">{categoryName.toUpperCase()}</h1>
            <p className="text-xs font-inter">{products.length} items in collection</p>
          </motion.div>
        </section>

        {/* Filters & Grid */}
        <section className="w-full px-6 md:px-16 py-12">
          {/* Filter & Sort Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-black">
            <div className="flex gap-4">
              <button 
                onClick={() => setFilter('all')}
                className={`text-xs uppercase tracking-widest font-inter font-bold cursor-pointer transition-all ${
                  filter === 'all' ? 'opacity-100 underline decoration-2' : 'opacity-60 hover:opacity-100'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('new')}
                className={`text-xs uppercase tracking-widest font-inter font-bold cursor-pointer transition-all ${
                  filter === 'new' ? 'opacity-100 underline decoration-2' : 'opacity-60 hover:opacity-100'
                }`}
              >
                New
              </button>
            </div>
            
            <div>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="border border-black p-2 text-xs uppercase tracking-widest font-inter font-bold bg-white focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Fit Filter Chips */}
          {activeFits.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setFitFilter(null)}
                className={`px-3 py-1.5 border text-[10px] uppercase tracking-widest font-inter font-bold transition-all ${
                  fitFilter === null
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black border-gray-300 hover:border-black'
                }`}
              >
                All Fits
              </button>
              {activeFits.map(f => (
                <button
                  key={f}
                  onClick={() => setFitFilter(fitFilter === f ? null : f)}
                  className={`px-3 py-1.5 border text-[10px] uppercase tracking-widest font-inter font-bold transition-all ${
                    fitFilter === f
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Product Grid */}
          <ProductGrid products={sortedProducts} showNewBadge={true} />

          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-sm font-inter opacity-60 mb-4">No products found with this filter.</p>
              <button
                onClick={() => { setFilter('all'); setSortBy('newest'); setFitFilter(null); }}
                className="text-xs uppercase tracking-widest font-inter hover:underline font-bold"
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
