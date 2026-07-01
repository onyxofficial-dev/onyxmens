'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Banknote, RotateCcw, ShieldCheck, MapPin, Star, Layers, Ruler, Droplets, Truck, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { submitReview } from './actions'
import Link from 'next/link'
import { reviewFormSchema } from '@/lib/validations'

type DBImage = {
  id: string
  image_url: string
  sort_order: number
  is_cover: boolean
}

type DBVariant = {
  id: string
  size: string
  color: string
  color_hex: string
  stock_quantity: number
  is_out_of_stock: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  category: string
  description: string
  fabric_details: string
  fit_notes: string
  fit: string | null
  design_tags: string[]
  care_instructions: string
  base_price: number
  product_images?: DBImage[]
  product_variants?: DBVariant[]
}

type ProductDetailClientProps = {
  product: Product
  relatedProducts: Product[]
  orderCount: number
}

const CANONICAL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function ProductDetailClient({ product, relatedProducts, orderCount }: ProductDetailClientProps) {
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  
  // Extract variants and images
  const variants = product.product_variants || []
  const images = (product.product_images || []).sort((a, b) => a.sort_order - b.sort_order)
  const coverImage = images.find(img => img.is_cover) || images[0] || { image_url: '/placeholder-tee.png' }

  // Product-level OOS gate
  const allVariantsOOS = variants.length === 0 || variants.every(
    v => v.is_out_of_stock || v.stock_quantity === 0
  )

  // Unique sizes available
  const availableSizes = CANONICAL_SIZES.filter(s => variants.some(v => v.size === s))
  const [selectedSize, setSelectedSize] = useState(() => {
    // Select first size that has in-stock variant
    const inStockSize = CANONICAL_SIZES.find(s => 
      variants.some(v => v.size === s && v.stock_quantity > 0)
    )
    return inStockSize || availableSizes[0] || 'M'
  })

  // Colors available for selected size
  const colorsForSize = variants.filter(v => v.size === selectedSize)
  const [selectedColor, setSelectedColor] = useState(() => {
    const inStockColor = colorsForSize.find(v => v.stock_quantity > 0)
    return inStockColor?.color || colorsForSize[0]?.color || 'black'
  })

  // Update selected color if we change size and it is not available
  useEffect(() => {
    const availableColors = variants.filter(v => v.size === selectedSize)
    const exists = availableColors.some(v => v.color === selectedColor)
    if (!exists && availableColors.length > 0) {
      const inStockColor = availableColors.find(v => v.stock_quantity > 0)
      setSelectedColor(inStockColor?.color || availableColors[0].color)
    }
  }, [selectedSize, variants, selectedColor])

  const [activeImage, setActiveImage] = useState(coverImage.image_url)
  useEffect(() => {
    if (coverImage.image_url) {
      setActiveImage(coverImage.image_url)
    }
  }, [coverImage.image_url])

  const [added, setAdded] = useState(false)

  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  const fetchReviews = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    
    if (data) setReviews(data)
    setLoadingReviews(false)
  }, [product.id])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const avgRating = reviews.length > 0
    ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    : 0

  const [showStickyBar, setShowStickyBar] = useState(false)
  const addToCartRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    if (addToCartRef.current) {
      observer.observe(addToCartRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Find variant matching selection
  const matchedVariant = variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  )

  const isOOS = !matchedVariant || matchedVariant.stock_quantity <= 0

  const handleAddToCart = () => {
    if (isOOS || !matchedVariant) return

    addItem({
      id: matchedVariant.id,
      product_id: product.id,
      name: product.name,
      price: product.base_price,
      quantity,
      size: selectedSize,
      color: selectedColor,
      image: coverImage.image_url,
      slug: product.slug,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }


  return (
    <>
      <Header />
      
      <main className="bg-white">
        <section className="px-6 md:px-16 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-gray-100 aspect-square flex items-center justify-center border border-black overflow-hidden"
              >
                <img 
                  src={activeImage} 
                  alt={product.name} 
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-700" 
                />
              </motion.div>
              
              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={img.id || idx}
                      onClick={() => setActiveImage(img.image_url)}
                      className={`aspect-square border relative bg-gray-50 overflow-hidden ${
                        activeImage === img.image_url ? 'border-black border-2' : 'border-gray-300 hover:border-black'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} gallery ${idx + 1}`}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="font-bebas-neue text-4xl font-black mb-2">{product.name}</h1>
              {!loadingReviews && reviews.length > 0 && (
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starNum = i + 1
                    if (starNum <= Math.floor(avgRating)) {
                      return <Star key={i} className="w-3.5 h-3.5 text-black fill-black" />
                    } else if (starNum === Math.ceil(avgRating) && avgRating % 1 !== 0) {
                      return <Star key={i} className="w-3.5 h-3.5 text-black fill-black opacity-50" />
                    } else {
                      return <Star key={i} className="w-3.5 h-3.5 text-gray-300" />
                    }
                  })}
                  <span className="text-xs font-inter text-gray-500 ml-1">
                    {avgRating.toFixed(1)} / 5.0
                  </span>
                </div>
              )}
              <div className="flex items-center gap-4 mb-6">
                <p className="font-bebas-neue text-2xl font-black">₹{product.base_price}</p>
                {!loadingReviews && reviews.length > 0 && (
                  <a href="#reviews" className="text-xs uppercase tracking-widest font-bold font-inter text-gray-500 hover:text-black hover:underline">
                    ({reviews.length} reviews)
                  </a>
                )}
              </div>
              {orderCount >= 10 && (
                <p className="text-xs font-inter opacity-60 mb-6">{orderCount} customers ordered this</p>
              )}
              <p className="font-inter text-sm mb-8 leading-relaxed">{product.description}</p>

              {allVariantsOOS ? (
                /* ── Product-level OOS: hide selectors, show single disabled button ── */
                <button
                  ref={addToCartRef}
                  disabled
                  className="w-full py-4 text-xs uppercase tracking-widest font-inter font-bold bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                >
                  OUT OF STOCK
                </button>
              ) : (
                /* ── Normal variant selection flow ── */
                <>
                  {/* Size Selector */}
                  {availableSizes.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-widest font-inter font-bold mb-3">Size</p>
                      <div className="flex gap-2">
                        {availableSizes.map((s) => {
                          // Check if all variants for this size are OOS
                          const isSizeOOS = !variants.some(v => v.size === s && v.stock_quantity > 0)

                          return (
                            <button
                              key={s}
                              onClick={() => setSelectedSize(s)}
                              disabled={isSizeOOS}
                              className={`w-12 h-12 border font-inter text-xs font-bold transition-all ${
                                selectedSize === s 
                                  ? 'bg-black text-white border-black' 
                                  : isSizeOOS
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

                  {/* Color Selector */}
                  {colorsForSize.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs uppercase tracking-widest font-inter font-bold mb-3">Color</p>
                      <div className="flex gap-3">
                        {colorsForSize.map((c) => {
                          const isColorOOS = c.stock_quantity <= 0

                          return (
                            <button
                              key={c.id}
                              onClick={() => setSelectedColor(c.color)}
                              disabled={isColorOOS}
                              className={`w-8 h-8 border-2 transition-all relative ${
                                selectedColor === c.color ? 'border-black scale-110' : 'border-gray-300 hover:border-black'
                              } ${isColorOOS ? 'opacity-40 cursor-not-allowed' : ''}`}
                              style={{ backgroundColor: c.color_hex || '#FFFFFF' }}
                              title={`${c.color} ${isColorOOS ? '(Out of Stock)' : ''}`}
                            >
                              {isColorOOS && (
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
                  <div className="mb-8">
                    <p className="text-xs uppercase tracking-widest font-inter font-bold mb-3">Quantity</p>
                    <div className="flex items-center gap-4 w-32 border border-black p-2">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="font-bold">−</button>
                      <span className="flex-1 text-center font-inter">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="font-bold">+</button>
                    </div>
                  </div>

                  {/* Attribute Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    {product.fabric_details && (
                      <div className="bg-gray-50 border border-black p-3 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <Layers className="w-4 h-4 text-black" />
                          <span className="text-[10px] uppercase font-bold tracking-widest font-inter">Fabric</span>
                        </div>
                        <p className="text-[11px] font-inter opacity-80 leading-relaxed">
                          {product.fabric_details}
                        </p>
                      </div>
                    )}
                    {(product.fit || product.fit_notes) && (
                      <div className="bg-gray-50 border border-black p-3 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <Ruler className="w-4 h-4 text-black" />
                          <span className="text-[10px] uppercase font-bold tracking-widest font-inter">Fit</span>
                        </div>
                        {product.fit && (
                          <span className="inline-block text-[10px] uppercase tracking-widest font-inter font-bold bg-black text-white px-2 py-0.5 mb-1 w-fit">
                            {product.fit}
                          </span>
                        )}
                        {product.fit_notes && (
                          <p className="text-[11px] font-inter opacity-80 leading-relaxed">
                            {product.fit_notes}
                          </p>
                        )}
                      </div>
                    )}
                    {product.care_instructions && (
                      <div className="bg-gray-50 border border-black p-3 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="w-4 h-4 text-black" />
                          <span className="text-[10px] uppercase font-bold tracking-widest font-inter">Care</span>
                        </div>
                        <p className="text-[11px] font-inter opacity-80 leading-relaxed">
                          {product.care_instructions}
                        </p>
                      </div>
                    )}
                    {product.design_tags && product.design_tags.length > 0 && (
                      <div className="bg-gray-50 border border-black p-3 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="w-4 h-4 text-black" />
                          <span className="text-[10px] uppercase font-bold tracking-widest font-inter">Design</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.design_tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-widest font-inter font-bold bg-black text-white px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className={`bg-gray-50 border border-black p-3 flex flex-col justify-between ${(!product.design_tags || product.design_tags.length === 0) ? 'col-span-2' : ''}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <Truck className="w-4 h-4 text-black" />
                        <span className="text-[10px] uppercase font-bold tracking-widest font-inter">Delivery & Returns</span>
                      </div>
                      <p className="text-[11px] font-inter opacity-80 leading-relaxed">
                        Free shipping above ₹999. ₹99 standard delivery. 7-day returns via WhatsApp.
                      </p>
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <button
                    ref={addToCartRef}
                    onClick={handleAddToCart}
                    disabled={isOOS}
                    className={`w-full py-4 text-xs uppercase tracking-widest font-inter font-bold transition-all duration-200 ${
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

              {/* Trust Signals */}
              <div className="mt-6 flex justify-between items-start text-gray-600 border-t border-b border-gray-200 py-4 px-2">
                <div className="flex flex-col items-center gap-2 w-1/4 text-center">
                  <Banknote className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-tight">Cash on<br/>Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/4 text-center">
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-tight">Free<br/>Returns</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/4 text-center">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-tight">Secure<br/>Checkout</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/4 text-center">
                  <MapPin className="w-5 h-5" />
                  <span className="text-[10px] uppercase font-bold tracking-widest leading-tight">Made in<br/>India</span>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Reviews Section */}
          <div className="mt-20 pt-12 border-t border-black">
            <h2 className="font-bebas-neue text-2xl font-black mb-8">CUSTOMER REVIEWS</h2>
            <div id="reviews"><ReviewsSection productId={product.id} reviews={reviews} loading={loadingReviews} onReviewSubmitted={fetchReviews} /></div>
          </div>

          {/* Related Products */}
          <div className="mt-20 pt-12 border-t border-black">
            <h2 className="font-bebas-neue text-2xl font-black mb-8">RELATED PRODUCTS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {relatedProducts.map((p) => {
                const pImages = p.product_images || []
                const pCover = pImages.find(img => img.is_cover) || pImages[0] || { image_url: '/placeholder-tee.png' }
                
                return (
                  <Link key={p.id} href={`/products/${p.slug}`}>
                    <div className="group border border-black cursor-pointer bg-gray-15 flex flex-col h-full">
                      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                        <img 
                          src={pCover.image_url} 
                          alt={p.name} 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="p-3 border-t border-black bg-white flex flex-col justify-between flex-grow">
                        <span className="font-bold text-xs uppercase tracking-wider">{p.name}</span>
                        <span className="text-xs mt-1 font-inter">₹{p.base_price}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
              {relatedProducts.length === 0 && (
                <p className="text-xs font-inter opacity-50 col-span-4">No related products found in this category.</p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Bottom Bar (Mobile Only) — hidden when all variants OOS */}
      <AnimatePresence>
        {showStickyBar && !allVariantsOOS && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-black p-4 z-50 md:hidden flex items-center justify-between shadow-2xl"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold font-inter uppercase">{selectedSize} / {selectedColor}</span>
              <span className="font-bebas-neue text-xl">₹{product.base_price}</span>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOOS}
              className={`px-8 py-3 text-xs uppercase tracking-widest font-inter font-bold transition-all duration-200 ${
                isOOS 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
                  : added 
                    ? 'bg-black text-white border border-black' 
                    : 'bg-black text-white border border-black hover:bg-white hover:text-black cursor-pointer'
              }`}
            >
              {isOOS ? 'OOS' : added ? 'ADDED' : 'ADD'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}

function ReviewsSection({ productId, reviews, loading, onReviewSubmitted }: { productId: string, reviews: any[], loading: boolean, onReviewSubmitted: () => void }) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [errors, setErrors] = useState<Record<string, string | undefined>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [reviewBodyText, setReviewBodyText] = useState('')

  const handleBlur = (fieldName: string, value: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    let valToValidate = value
    if (fieldName === 'customerMobile') {
      valToValidate = value.replace(/\D/g, '')
    }

    const fieldSchema = reviewFormSchema.shape[fieldName as keyof typeof reviewFormSchema.shape]
    if (fieldSchema) {
      const result = fieldSchema.safeParse(valToValidate)
      if (!result.success) {
        setErrors(prev => ({ ...prev, [fieldName]: result.error.issues[0].message }))
      } else {
        setErrors(prev => ({ ...prev, [fieldName]: undefined }))
      }
    }
  }

  const handleChange = (fieldName: string, value: string) => {
    if (fieldName === 'body') {
      setReviewBodyText(value)
    }

    if (errors[fieldName]) {
      const fieldSchema = reviewFormSchema.shape[fieldName as keyof typeof reviewFormSchema.shape]
      if (fieldSchema) {
        let valToValidate = value
        if (fieldName === 'customerMobile') {
          valToValidate = value.replace(/\D/g, '')
        }
        const result = fieldSchema.safeParse(valToValidate)
        if (result.success) {
          setErrors(prev => ({ ...prev, [fieldName]: undefined }))
        } else {
          setErrors(prev => ({ ...prev, [fieldName]: result.error.issues[0].message }))
        }
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const rawData = {
      reviewerName: formData.get('reviewerName') as string,
      customerMobile: formData.get('customerMobile') as string,
      rating: formData.get('rating') as string,
      title: formData.get('title') as string,
      body: formData.get('body') as string,
    }

    const parsed = reviewFormSchema.safeParse(rawData)
    if (!parsed.success) {
      const fieldErrors: Record<string, string | undefined> = {}
      parsed.error.issues.forEach((err) => {
        const path = err.path[0] as string
        if (!fieldErrors[path]) {
          fieldErrors[path] = err.message
        }
      })
      setErrors(fieldErrors)
      setSubmitting(false)
      return
    }

    formData.set('customerMobile', parsed.data.customerMobile)
    formData.append('productId', productId)

    try {
      const res = await submitReview(formData)
      if (!res.success) {
        if (res.errors) {
          setErrors(res.errors as Record<string, string>)
        } else if (res.error) {
          setError(res.error)
        } else {
          setError('Unable to submit review. Please try again.')
        }
      } else {
        e.currentTarget.reset()
        setReviewBodyText('')
        setErrors({})
        setTouched({})
        await onReviewSubmitted()
      }
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Unable to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* Review Form */}
      <div>
        <h3 className="font-inter font-bold text-sm mb-4">WRITE A REVIEW</h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-inter rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold font-inter mb-1">Name *</label>
            <input 
              name="reviewerName" 
              type="text" 
              onBlur={(e) => handleBlur('reviewerName', e.target.value)}
              onChange={(e) => handleChange('reviewerName', e.target.value)}
              className={`w-full border p-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-black ${errors.reviewerName ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
            />
            {errors.reviewerName && <p className="text-xs text-red-600 mt-1 font-inter">{errors.reviewerName}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold font-inter mb-1">Mobile number used during purchase *</label>
            <input 
              name="customerMobile" 
              type="tel" 
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile"
              onBlur={(e) => {
                const val = e.target.value.replace(/\D/g, '')
                e.target.value = val
                handleBlur('customerMobile', val)
              }}
              onChange={(e) => handleChange('customerMobile', e.target.value)}
              className={`w-full border p-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-black ${errors.customerMobile ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
            />
            {errors.customerMobile && <p className="text-xs text-red-600 mt-1 font-inter">{errors.customerMobile}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold font-inter mb-1">Rating *</label>
            <select 
              name="rating" 
              onBlur={(e) => handleBlur('rating', e.target.value)}
              onChange={(e) => handleChange('rating', e.target.value)}
              className={`w-full border p-2 text-sm font-inter bg-white focus:outline-none focus:ring-2 focus:ring-black ${errors.rating ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`}
            >
              <option value="">Select Rating</option>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Average</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Terrible</option>
            </select>
            {errors.rating && <p className="text-xs text-red-600 mt-1 font-inter">{errors.rating}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold font-inter mb-1">Title</label>
            <input 
              name="title" 
              type="text" 
              onBlur={(e) => handleBlur('title', e.target.value)}
              onChange={(e) => handleChange('title', e.target.value)}
              className={`w-full border p-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-black ${errors.title ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`} 
            />
            {errors.title && <p className="text-xs text-red-600 mt-1 font-inter">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-xs font-bold font-inter mb-1">Review *</label>
            <textarea 
              name="body" 
              rows={4} 
              maxLength={1000}
              value={reviewBodyText}
              onBlur={(e) => handleBlur('body', e.target.value)}
              onChange={(e) => handleChange('body', e.target.value)}
              className={`w-full border p-2 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-black ${errors.body ? 'border-red-600 focus:ring-red-600 font-bold text-red-600' : 'border-black'}`}
            ></textarea>
            <div className="flex justify-between items-center mt-1">
              {errors.body ? (
                <p className="text-xs text-red-600 font-inter">{errors.body}</p>
              ) : (
                <div />
              )}
              <span className={`text-[10px] font-inter ${reviewBodyText.length >= 950 ? 'text-amber-600 font-bold' : 'text-gray-400'}`}>
                {reviewBodyText.length} / 1000
              </span>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={submitting}
            className="w-full py-3 bg-black text-white text-xs uppercase tracking-widest font-inter font-bold hover:bg-white hover:text-black border border-black transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
          </button>
        </form>
      </div>

      {/* Review List */}
      <div>
        <h3 className="font-inter font-bold text-sm mb-4">RECENT REVIEWS</h3>
        {loading ? (
          <p className="text-sm font-inter opacity-60">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm font-inter opacity-60">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="space-y-6">
            {reviews.map((r, i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm font-inter">{r.reviewer_name}</span>
                  {r.purchase_verified && (
                    <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                      Verified Purchase
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-xs mb-2">
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </div>
                {r.title && <h4 className="font-bold text-sm font-inter mb-1">{r.title}</h4>}
                <p className="text-sm font-inter leading-relaxed">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
