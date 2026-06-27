'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import dynamic from 'next/dynamic'

const ProductGrid = dynamic(() => import('@/components/ProductGrid').then(mod => mod.ProductGrid), {
  ssr: true,
  loading: () => <div className="h-96 w-full bg-neutral-200/10 animate-pulse" />
})
import { Search } from 'lucide-react'
import type { SearchResult } from '@/lib/types'

type SearchResultsClientProps = {
  query: string
  initialResults: SearchResult[]
}

const CATEGORY_SUGGESTIONS = [
  { name: 'T-Shirts', href: '/shop/t-shirts' },
  { name: 'Shirts', href: '/shop/shirts' },
  { name: 'Jeans', href: '/shop/jeans' },
  { name: 'Outerwear', href: '/shop/outerwear' },
]

export default function SearchResultsClient({ query, initialResults }: SearchResultsClientProps) {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState(query)

  const handleReSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  // Transform SearchResult to match ProductGrid's GridProduct shape
  const gridProducts = initialResults.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    base_price: r.base_price,
    category: r.category,
    fit: r.fit,
    product_images: r.cover_image_url
      ? [{ image_url: r.cover_image_url, is_cover: true }]
      : [],
  }))

  return (
    <>
      <Header />

      <main className="bg-white">
        {/* Hero */}
        <section className="w-full bg-black text-white px-6 md:px-16 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {query ? (
              <>
                <p className="text-[10px] uppercase tracking-widest font-inter opacity-60 mb-2">
                  {initialResults.length} result{initialResults.length !== 1 ? 's' : ''} for
                </p>
                <h1 className="font-bebas-neue text-5xl md:text-6xl font-black mb-6">
                  &ldquo;{query.toUpperCase()}&rdquo;
                </h1>
              </>
            ) : (
              <h1 className="font-bebas-neue text-5xl md:text-6xl font-black mb-6">
                SEARCH
              </h1>
            )}

            {/* Re-search input */}
            <form onSubmit={handleReSearch} className="max-w-md">
              <div className="flex items-center border border-white/30 bg-white/[0.05] backdrop-blur-sm">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-white text-sm font-inter px-4 py-3 outline-none placeholder:text-white/40"
                />
                <button
                  type="submit"
                  className="px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </section>

        {/* Results */}
        <section className="w-full px-6 md:px-16 py-12">
          {gridProducts.length > 0 ? (
            <ProductGrid products={gridProducts} />
          ) : query ? (
            /* Empty results */
            <div className="text-center py-20">
              <p className="font-bebas-neue text-2xl font-black mb-2">NO RESULTS FOUND</p>
              <p className="text-sm font-inter opacity-60 mb-8 max-w-md mx-auto">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;.
                Try a different search term or browse our categories.
              </p>

              <div className="flex flex-wrap justify-center gap-3 mb-8">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="px-4 py-2 border border-black text-xs uppercase tracking-widest font-inter font-bold hover:bg-black hover:text-white transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <Link
                href="/shop"
                className="text-xs uppercase tracking-widest font-inter font-bold hover:underline"
              >
                ← BROWSE ALL PRODUCTS
              </Link>
            </div>
          ) : (
            /* No query — prompt */
            <div className="text-center py-20">
              <p className="font-bebas-neue text-2xl font-black mb-2">SEARCH OUR COLLECTION</p>
              <p className="text-sm font-inter opacity-60 mb-8">
                Enter a search term above to find products.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    className="px-4 py-2 border border-black text-xs uppercase tracking-widest font-inter font-bold hover:bg-black hover:text-white transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
