'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { AdminProduct } from './page'

type Filter = 'all' | 'live' | 'draft' | 'archived' | 'oos'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'draft', label: 'Draft' },
  { key: 'archived', label: 'Archived' },
  { key: 'oos', label: 'Out of Stock' },
]

export default function AdminProductsClient({ products }: { products: AdminProduct[] }) {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = products

    // Status filter
    switch (activeFilter) {
      case 'live':
        result = result.filter((p) => p.is_active && p.is_live)
        break
      case 'draft':
        result = result.filter((p) => p.is_active && !p.is_live)
        break
      case 'archived':
        result = result.filter((p) => !p.is_active)
        break
      case 'oos':
        result = result.filter((p) => p.isFullyOOS)
        break
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    return result
  }, [products, activeFilter, search])

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="font-bebas-neue text-4xl font-black">PRODUCTS</h1>
        <Link href="/admin/products/new">
          <span className="inline-block px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-inter font-bold hover:bg-white hover:text-black border border-black transition-all cursor-pointer">
            + NEW PRODUCT
          </span>
        </Link>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-widest font-inter font-bold border transition-all cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-black border-gray-300 hover:border-black'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 text-xs font-inter focus:border-black focus:outline-none transition-colors"
          />
        </div>
        <span className="text-[10px] text-gray-400 font-inter tracking-widest uppercase">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-black p-12 text-center text-gray-400 text-xs font-inter">
          No products match your filters.
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product }: { product: AdminProduct }) {
  const statusBadge = !product.is_active
    ? { label: 'ARCHIVED', className: 'bg-gray-200 text-gray-700' }
    : product.is_live
    ? { label: 'LIVE', className: 'bg-green-100 text-green-800' }
    : { label: 'DRAFT', className: 'bg-yellow-100 text-yellow-800' }

  return (
    <Link
      href={`/admin/products/${product.id}/edit`}
      className="block break-inside-avoid mb-3"
    >
      <div className="bg-white border border-black overflow-hidden hover:shadow-md transition-shadow group">
        {/* Image */}
        <div className="relative">
          {product.coverImage ? (
            <img
              src={product.coverImage}
              alt={product.name}
              className={`w-full h-auto object-cover transition-opacity ${
                product.isFullyOOS ? 'opacity-60' : 'opacity-100'
              }`}
            />
          ) : (
            <div className={`w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300 text-xs font-inter ${
              product.isFullyOOS ? 'opacity-60' : ''
            }`}>
              No image
            </div>
          )}
          {product.isFullyOOS && (
            <span className="absolute top-2 right-2 px-2 py-1 bg-red-600 text-white text-[9px] uppercase tracking-widest font-black">
              OUT OF STOCK
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3 border-t border-black">
          <p className="text-xs font-inter font-medium truncate group-hover:underline">
            {product.name}
          </p>
          <p className="text-xs font-inter text-gray-500 mt-0.5">
            ₹{new Intl.NumberFormat('en-IN').format(product.base_price)}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-bold bg-gray-100 text-gray-600">
              {product.category}
            </span>
            <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-bold ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
            {product.isPartialOOS && (
              <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-widest font-bold bg-amber-100 text-amber-800">
                PARTIAL STOCK
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
