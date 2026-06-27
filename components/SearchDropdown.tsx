'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Search, X, Loader2 } from 'lucide-react'
import { useEffect, useRef, useCallback } from 'react'
import type { SearchResult } from '@/lib/types'

type SearchDropdownProps = {
  isOpen: boolean
  onClose: () => void
  query: string
  results: SearchResult[]
  isLoading: boolean
  onQueryChange: (q: string) => void
}

const CATEGORY_SUGGESTIONS = [
  { name: 'T-Shirts', href: '/shop/t-shirts' },
  { name: 'Shirts', href: '/shop/shirts' },
  { name: 'Jeans', href: '/shop/jeans' },
  { name: 'Outerwear', href: '/shop/outerwear' },
]

export function SearchDropdown({
  isOpen,
  onClose,
  query,
  results,
  isLoading,
  onQueryChange,
}: SearchDropdownProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Short delay to let animation start
      const timer = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // ESC to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    // Delay to prevent immediate close from the toggle click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler)
    }, 50)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handler)
    }
  }, [isOpen, onClose])

  const handleResultClick = useCallback(() => {
    onClose()
  }, [onClose])

  const showResults = query.length >= 2

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 right-0 bg-white border-b border-black shadow-xl z-50"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 md:px-8 py-3 border-b border-gray-200">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Search products..."
              className="flex-1 text-sm font-inter outline-none bg-transparent placeholder:text-gray-400"
              autoComplete="off"
              spellCheck={false}
            />
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400 flex-shrink-0" />}
            <button
              onClick={onClose}
              className="p-1 hover:opacity-60 transition-opacity flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results Area */}
          <div className="max-h-[60vh] overflow-y-auto">
            {showResults && isLoading && results.length === 0 ? (
              /* Loading skeleton */
              <div className="px-4 md:px-8 py-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-14 h-14 bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 w-3/4" />
                      <div className="h-3 bg-gray-200 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : showResults && results.length > 0 ? (
              /* Results list */
              <div>
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-4 px-4 md:px-8 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                      {item.cover_image_url ? (
                        <img
                          src={item.cover_image_url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest font-inter opacity-50">
                        {item.category}
                      </p>
                      <p className="text-xs font-inter font-bold uppercase tracking-wide truncate">
                        {item.name}
                      </p>
                      <p className="text-xs font-inter opacity-60">₹{item.base_price}</p>
                    </div>
                  </Link>
                ))}

                {/* View all link */}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  onClick={handleResultClick}
                  className="block px-4 md:px-8 py-3 text-xs uppercase tracking-widest font-inter font-bold text-center border-t border-black hover:bg-black hover:text-white transition-all"
                >
                  View all results for &lsquo;{query}&rsquo;
                </Link>
              </div>
            ) : showResults && !isLoading && results.length === 0 ? (
              /* No results — show category suggestions */
              <div className="px-4 md:px-8 py-8 text-center">
                <p className="text-xs font-inter opacity-60 mb-4">
                  No results found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[10px] uppercase tracking-widest font-inter font-bold mb-3 opacity-40">
                  Browse categories
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={handleResultClick}
                      className="px-3 py-1.5 border border-black text-[10px] uppercase tracking-widest font-inter font-bold hover:bg-black hover:text-white transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              /* Initial state — show popular categories */
              <div className="px-4 md:px-8 py-6 text-center">
                <p className="text-[10px] uppercase tracking-widest font-inter font-bold mb-3 opacity-40">
                  Popular searches
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CATEGORY_SUGGESTIONS.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={handleResultClick}
                      className="px-3 py-1.5 border border-gray-300 text-[10px] uppercase tracking-widest font-inter font-bold hover:border-black transition-all"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
