'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

type ProductImage = {
  image_url: string
  is_cover: boolean
}

type GridProduct = {
  id: string
  name: string
  slug: string
  base_price: number
  category: string
  fit: string | null
  created_at?: string
  product_images?: ProductImage[]
}

type ProductGridProps = {
  products: GridProduct[]
  showNewBadge?: boolean
}

type Variant = {
  id: string
  size: string
  color: string
  color_hex: string | null
  stock_quantity: number
  is_out_of_stock: boolean
}

const CANONICAL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

// ─────────────────────────────────────────────────────────────────────────────
// Quick Add Drawer
// ─────────────────────────────────────────────────────────────────────────────

function QuickAddDrawer({
  product,
  coverImage,
  onClose,
}: {
  product: GridProduct
  coverImage: string
  onClose: () => void
}) {
  const { addItem } = useCart()
  const [variants, setVariants] = useState<Variant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Fetch variants on mount
  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('product_variants')
        .select('id, size, color, color_hex, stock_quantity, is_out_of_stock')
        .eq('product_id', product.id)
      setVariants(data || [])
      setLoading(false)
    }
    fetch()
  }, [product.id])

  // Default size selection once variants load
  useEffect(() => {
    if (variants.length === 0) return
    const firstInStock = CANONICAL_SIZES.find(s =>
      variants.some(v => v.size === s && v.stock_quantity > 0)
    )
    const first = CANONICAL_SIZES.find(s => variants.some(v => v.size === s))
    setSelectedSize(firstInStock || first || '')
  }, [variants])

  // Default color when size changes
  useEffect(() => {
    if (!selectedSize) return
    const colorsForSize = variants.filter(v => v.size === selectedSize)
    const inStock = colorsForSize.find(v => v.stock_quantity > 0)
    setSelectedColor(inStock?.color || colorsForSize[0]?.color || '')
  }, [selectedSize, variants])

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const availableSizes = CANONICAL_SIZES.filter(s => variants.some(v => v.size === s))
  const colorsForSize = variants.filter(v => v.size === selectedSize)
  const matchedVariant = variants.find(v => v.size === selectedSize && v.color === selectedColor)
  const isOOS = !matchedVariant || matchedVariant.stock_quantity <= 0

  const handleConfirm = () => {
    if (isOOS || !matchedVariant) return
    addItem({
      id: matchedVariant.id,
      product_id: product.id,
      name: product.name,
      price: product.base_price,
      size: selectedSize,
      color: selectedColor,
      image: coverImage,
      slug: product.slug,
      quantity,
    })
    setAdded(true)
    setTimeout(() => { setAdded(false); onClose() }, 1200)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
      >
        <div className="max-w-lg mx-auto p-6">
          {/* Header row */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 border border-black flex-shrink-0 relative overflow-hidden">
              <Image
                src={coverImage}
                alt={product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-widest font-inter opacity-60">{product.category}</p>
              <h3 className="text-sm font-bebas-neue font-black uppercase tracking-wide truncate">{product.name}</h3>
              <p className="text-xs font-inter font-bold">₹{product.base_price}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {loading ? (
            <p className="text-xs font-inter opacity-60 text-center py-4">Loading variants...</p>
          ) : variants.length === 0 ? (
            <p className="text-xs font-inter opacity-60 text-center py-4">No variants available.</p>
          ) : (
            <>
              {/* Size selector */}
              {availableSizes.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest font-inter font-bold mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {availableSizes.map(s => {
                      const sizeOOS = !variants.some(v => v.size === s && v.stock_quantity > 0)
                      return (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          disabled={sizeOOS}
                          className={`w-10 h-10 border font-inter text-xs font-bold transition-all ${
                            selectedSize === s
                              ? 'bg-black text-white border-black'
                              : sizeOOS
                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                                : 'bg-white text-black border-black hover:bg-black hover:text-white'
                          }`}
                        >
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Color selector */}
              {colorsForSize.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] uppercase tracking-widest font-inter font-bold mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {colorsForSize.map(c => {
                      const colorOOS = c.stock_quantity <= 0
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedColor(c.color)}
                          disabled={colorOOS}
                          className={`w-8 h-8 border-2 transition-all relative ${
                            selectedColor === c.color ? 'border-black scale-110' : 'border-gray-300 hover:border-black'
                          } ${colorOOS ? 'opacity-40 cursor-not-allowed' : ''}`}
                          style={{ backgroundColor: c.color_hex || '#FFFFFF' }}
                          title={`${c.color}${colorOOS ? ' (OOS)' : ''}`}
                        >
                          {colorOOS && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-0.5 bg-red-600 rotate-45" />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-[10px] uppercase tracking-widest font-inter font-bold mb-2">Quantity</p>
                <div className="flex items-center gap-4 w-28 border border-black p-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="font-bold text-sm">−</button>
                  <span className="flex-1 text-center font-inter text-sm">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="font-bold text-sm">+</button>
                </div>
              </div>

              {/* Confirm button */}
              <button
                onClick={handleConfirm}
                disabled={isOOS}
                className={`w-full py-3 text-xs uppercase tracking-widest font-inter font-bold transition-all duration-200 ${
                  isOOS
                    ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                    : added
                      ? 'bg-black text-white border border-black'
                      : 'bg-white text-black border border-black hover:bg-black hover:text-white cursor-pointer'
                }`}
              >
                {isOOS ? 'OUT OF STOCK' : added ? '✓ ADDED TO CART' : 'ADD TO CART'}
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductGrid
// ─────────────────────────────────────────────────────────────────────────────

export function ProductGrid({ products, showNewBadge = false }: ProductGridProps) {
  const isNew = (dateString?: string) => {
    if (!dateString) return false
    const days = (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24)
    return days <= 7
  }

  const [drawerProduct, setDrawerProduct] = useState<GridProduct | null>(null)
  const [drawerCover, setDrawerCover] = useState<string>('')

  const openDrawer = useCallback((e: React.MouseEvent, product: GridProduct, cover: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDrawerProduct(product)
    setDrawerCover(cover)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerProduct(null)
    setDrawerCover('')
  }, [])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, idx) => {
          const pImages = product.product_images || []
          const pCover = pImages.find(img => img.is_cover) || pImages[0] || { image_url: '/placeholder-tee.png' }
          const coverUrl = pCover.image_url

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 16) * 0.05 }}
            >
              <Link href={`/products/${product.slug}`} className="group cursor-pointer block h-full">
                {/* Image */}
                <div className="relative w-full aspect-[3/4] bg-gray-200 mb-3 overflow-hidden flex items-center justify-center border border-black">
                  <Image
                    src={coverUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* NEW badge */}
                  {showNewBadge && isNew(product.created_at) && (
                    <span className="absolute top-2 left-2 text-[10px] uppercase tracking-widest font-inter font-bold bg-black text-white px-2 py-0.5">
                      NEW
                    </span>
                  )}

                  {/* Fit badge — bottom-left, glassmorphism */}
                  {product.fit && (
                    <span className="absolute bottom-2 left-2 bg-white/[0.08] backdrop-blur-md border border-white/10 text-white text-[9px] uppercase tracking-widest font-inter font-bold px-2 py-0.5">
                      {product.fit}
                    </span>
                  )}
                </div>

                {/* Info block */}
                <p className="text-[10px] uppercase tracking-widest font-inter opacity-60 mb-0.5">
                  {product.category}
                </p>
                <h3 className="text-xs uppercase tracking-widest font-inter font-bold mb-1 truncate group-hover:opacity-60 transition-opacity">
                  {product.name}
                </h3>
                <p className="text-xs font-inter opacity-60">₹{product.base_price}</p>

                {/* Quick Add button */}
                <button
                  onClick={e => openDrawer(e, product, coverUrl)}
                  className="mt-2 w-full py-2 text-[10px] uppercase tracking-widest font-inter font-bold bg-white text-black border border-black hover:bg-black hover:text-white transition-all duration-200 cursor-pointer"
                >
                  ADD TO CART
                </button>
              </Link>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Add Drawer */}
      <AnimatePresence>
        {drawerProduct && (
          <QuickAddDrawer
            key={drawerProduct.id}
            product={drawerProduct}
            coverImage={drawerCover}
            onClose={closeDrawer}
          />
        )}
      </AnimatePresence>
    </>
  )
}
