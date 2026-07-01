'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'
import { ArrowRight, Trash2 } from 'lucide-react'

import { PageTitle } from '@/components/page-title'

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart, validateCartStock } = useCart()

  useEffect(() => {
    validateCartStock()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const shipping = total > 999 ? 0 : 99
  const finalTotal = total + shipping

  return (
    <>
      <PageTitle title="Shopping Cart" />
      <Header />

      <main className="w-full bg-white">
        {/* Page Header */}
        <div className="px-16 py-12 border-b border-black">
          <h1 className="font-bebas-neue font-black text-black text-6xl">SHOPPING CART</h1>
          <p className="text-xs font-inter opacity-60 mt-2">{items.length} items in cart</p>
        </div>

        {items.length === 0 ? (
          // Empty Cart
          <section className="w-full min-h-96 flex flex-col items-center justify-center px-16 py-20">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-bebas-neue font-black text-3xl mb-4">YOUR CART IS EMPTY</h2>
              <p className="text-sm font-inter opacity-70 mb-8 max-w-md">
                Explore our collections and find the perfect piece to add to your cart.
              </p>
              <Link href="/shop">
                <button className="px-6 py-3 bg-black text-white text-xs uppercase tracking-widest font-inter hover:bg-white hover:text-black border border-black transition-all duration-200 flex items-center gap-2 mx-auto cursor-pointer">
                  CONTINUE SHOPPING <ArrowRight className="w-3 h-3" />
                </button>
              </Link>
            </motion.div>
          </section>
        ) : (
          // Cart with Items
          <section className="w-full px-6 md:px-16 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left: Cart Items */}
              <div className="col-span-1 lg:col-span-2">
                <div className="space-y-px bg-black mb-8">
                  {items.map((item, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white border border-black p-6 flex gap-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-200 flex-shrink-0 border border-black overflow-hidden relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-bebas-neue font-black text-lg">
                          {item.name}
                          {item.isOutofStock && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 font-inter uppercase tracking-widest border border-red-200 inline-block align-middle">Out of Stock</span>}
                        </h3>
                        <div className="text-xs font-inter opacity-60 mt-1 space-y-1">
                          <p>Size: {item.size}</p>
                          <p>Color: {item.color}</p>
                        </div>
                        <p className="text-sm font-inter font-bold mt-3">₹{item.price}</p>
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex flex-col items-end gap-4">
                        {/* Quantity */}
                        <div className="flex items-center border border-black">
                          <button
                             onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-xs font-inter hover:bg-black hover:text-white transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-4 py-1 text-xs font-inter">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-xs font-inter hover:bg-black hover:text-white transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-xs font-inter opacity-60">Subtotal</p>
                          <p className="font-bebas-neue font-black text-lg">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-xs uppercase tracking-widest font-inter hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          REMOVE
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Continue Shopping */}
                <Link href="/shop">
                  <span className="text-xs uppercase tracking-widest font-inter hover:underline inline-flex items-center gap-2 cursor-pointer">
                    ← CONTINUE SHOPPING
                  </span>
                </Link>
              </div>

              {/* Right: Order Summary */}
              <motion.div
                className="bg-white border border-black p-8 h-fit"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="font-bebas-neue font-black text-xl mb-6">ORDER SUMMARY</h2>

                <div className="space-y-4 mb-6 pb-6 border-b border-black">
                  <div className="flex justify-between text-sm font-inter">
                    <span>Subtotal</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-inter">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-xs uppercase tracking-widest font-inter font-bold">Total</span>
                  <span className="font-bebas-neue font-black text-3xl">₹{finalTotal.toFixed(2)}</span>
                </div>

                <Link href="/order" onClick={(e) => {
                  if (items.some(i => i.isOutofStock)) {
                    e.preventDefault();
                    alert("Please remove out-of-stock items before proceeding to order.");
                  }
                }}>
                  <button className="w-full px-6 py-4 bg-black text-white text-xs uppercase tracking-widest font-inter font-bold hover:bg-white hover:text-black border border-black transition-all duration-200 flex items-center justify-center gap-2 mb-4 cursor-pointer">
                    PROCEED TO ORDER <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>

                <button
                  onClick={clearCart}
                  className="w-full px-6 py-3 bg-white text-black text-xs uppercase tracking-widest font-inter hover:bg-black hover:text-white border border-black transition-all duration-200 cursor-pointer"
                >
                  CLEAR CART
                </button>

                {shipping === 0 && (
                  <p className="text-xs font-inter opacity-60 mt-4 text-center">
                    ✓ FREE SHIPPING! Orders over ₹999 qualify for free shipping.
                  </p>
                )}
              </motion.div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  )
}
