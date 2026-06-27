'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function BlogCollectionGrid() {
  const categories = [
    { label: 'T-SHIRTS', href: '/shop/t-shirts', img: '/shop-tshirts.png' },
    { label: 'SHIRTS', href: '/shop/shirts', img: '/shop-shirts.png' },
    { label: 'JEANS', href: '/shop/jeans', img: '/shop-jeans.png' },
    { label: 'OUTERWEAR', href: '/shop/outerwear', img: '/shop-outerwear.png' },
  ]

  return (
    <div className="border-t border-white/10 pt-12 mt-12 w-full max-w-4xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h2 className="font-bebas-neue text-2xl md:text-3xl text-white tracking-widest leading-none mb-2">
          EXPLORE THE COLLECTION
        </h2>
        <p className="font-inter text-white/40 text-xs md:text-sm tracking-wider uppercase">
          Shop the Onyx catalog &mdash; same-day delivery in Jamnagar
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => (
          <motion.div
            key={cat.href}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="border border-white/10 bg-black flex flex-col h-full overflow-hidden"
          >
            <Link href={cat.href} className="flex flex-col h-full group">
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-white/5">
                <img
                  src={cat.img}
                  alt={`${cat.label} collection — Onyx`}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-3 border-t border-white/10 bg-black">
                <span className="font-bebas-neue text-lg text-white tracking-wider block">
                  {cat.label}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link href="/shop" className="block w-full">
        <motion.div
          whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          transition={{ duration: 0.15 }}
          className="w-full py-3 border border-white/20 text-white font-bebas-neue text-lg tracking-widest uppercase text-center cursor-pointer transition-colors"
        >
          SHOP ALL
        </motion.div>
      </Link>
    </div>
  )
}
