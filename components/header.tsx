'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, Search } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { useState, useCallback, useRef, useEffect } from 'react'
import { SearchDropdown } from './SearchDropdown'
import type { SearchResult } from '@/lib/types'

export function Header() {
  const { items } = useCart()
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSearchToggle = useCallback(() => {
    setIsSearchOpen(prev => {
      if (prev) {
        // Closing — clear state
        setSearchQuery('')
        setSearchResults([])
      }
      return !prev
    })
  }, [])

  const handleSearchClose = useCallback(() => {
    setIsSearchOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }, [])

  const handleQueryChange = useCallback((q: string) => {
    setSearchQuery(q)

    // Clear previous debounce
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (q.trim().length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}&limit=8`)
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        setSearchResults(data.results || [])
      } catch (err) {
        console.error('[Search]', err)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="w-full h-8 bg-black text-white flex justify-between items-center px-4 md:px-6">
        <span className="text-[10px] md:text-xs uppercase tracking-widest font-inter font-bold truncate">
          ONYX ✦ MENS CLOTHING
        </span>
        <span className="text-[10px] md:text-xs font-inter ml-4">2026</span>
      </div>

      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-white border-b border-black flex items-center px-4 md:px-8 relative">
        <div className="flex-1">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-3 -ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-none flex justify-center">
          <Link href="/" className="font-bebas-neue text-2xl font-bold hover:opacity-60 transition-opacity flex items-center gap-2">
            <span>✦</span> ONYX <span>✦</span>
          </Link>
        </div>

        <div className="flex-1 flex justify-end items-center lg:gap-6">
          <div className="hidden lg:flex gap-6">
            {[
              { name: 'SHOP', href: '/shop' },
              { name: 'NEW DROPS', href: '/new-drops' },
              { name: 'ABOUT', href: '/about' },
              { name: 'SUPPORT', href: '/support' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs uppercase tracking-widest font-inter hover:underline transition-all duration-200"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Icon */}
          <div className="flex-1 flex justify-center lg:flex-none">
            <button
              onClick={handleSearchToggle}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] p-2 hover:opacity-60 transition-opacity cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <Link href="/cart" className="flex-none flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-inter hover:opacity-60 transition-opacity min-w-[44px] min-h-[44px] p-2 -mr-2">
            <ShoppingBag className="w-4 h-4" />
            <span>({cartCount})</span>
          </Link>
        </div>

        {/* Search Dropdown */}
        <SearchDropdown
          isOpen={isSearchOpen}
          onClose={handleSearchClose}
          query={searchQuery}
          results={searchResults}
          isLoading={isSearching}
          onQueryChange={handleQueryChange}
        />
      </nav>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="flex items-center justify-between px-4 h-16 border-b border-black">
            <span className="font-bebas-neue text-2xl font-bold">MENU</span>
            <button 
              className="p-3 -mr-3 min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col px-6 py-8 gap-8">
            {[
              { name: 'HOME', href: '/' },
              { name: 'SHOP', href: '/shop' },
              { name: 'NEW DROPS', href: '/new-drops' },
              { name: 'ABOUT', href: '/about' },
              { name: 'SUPPORT', href: '/support' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-bebas-neue text-4xl hover:opacity-60 transition-opacity border-b border-gray-100 pb-4"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
