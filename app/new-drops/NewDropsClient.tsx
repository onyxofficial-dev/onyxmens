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
  created_at: string
  fit: string | null
  product_images?: ProductImage[]
}

type NewDropsClientProps = {
  products: Product[]
}

const CATEGORIES = ['All', 'T-Shirts', 'Shirts', 'Jeans']

const isNew = (dateString: string) => {
  const days = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
  return days <= 7
}

export default function NewDropsClient({ products }: NewDropsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return selectedCategory === 'All'
      ? products
      : products.filter(p => {
          // Compare case insensitively
          const cat = p.category ? p.category.toLowerCase() : ''
          const sel = selectedCategory.toLowerCase()
          if (sel === 't-shirts') return cat === 't-shirts'
          if (sel === 'shirts') return cat === 'shirts'
          if (sel === 'jeans') return cat === 'jeans'
          return cat === sel
        })
  }, [products, selectedCategory])

  const pageSize = 16
  const paged = filtered.slice(0, page * pageSize)

  return (
    <>
      <Header />

      <main className="w-full bg-white">
        {/* Page Header */}
        <section className="w-full px-8 py-20 border-b border-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="font-bebas-neue font-black text-black uppercase tracking-wide text-balance mb-4"
              style={{ fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 1 }}
            >
              NEW DROPS
            </h1>
            <p className="text-sm font-inter max-w-md opacity-80">
              Latest arrivals from ONYX. Curated with precision, released with intention.
            </p>
          </motion.div>
        </section>

        {/* Filter Bar */}
        <section className="w-full px-8 py-6 border-b border-black flex gap-4 overflow-x-auto sticky top-16 bg-white z-40">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat)
                setPage(1)
              }}
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
          <ProductGrid products={paged} showNewBadge={true} />

          {filtered.length === 0 && (
            <div className="text-center py-12 text-xs opacity-50 font-inter">
              No new arrivals in this category.
            </div>
          )}

          {/* Load More Button */}
          {paged.length < filtered.length && (
            <motion.button
              onClick={() => setPage(p => p + 1)}
              className="w-full mt-12 px-6 py-3 border border-black text-black text-xs uppercase tracking-widest font-inter hover:bg-black hover:text-white transition-all duration-200 cursor-pointer font-bold"
              whileHover={{ scale: 1.02 }}
            >
              LOAD MORE
            </motion.button>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
