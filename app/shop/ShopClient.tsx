'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import Image from 'next/image'
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
  fit: string | null
  product_images?: ProductImage[]
}

type ShopClientProps = {
  products: Product[]
  categoryCounts: Record<string, number>
}

export default function ShopClient({ products, categoryCounts }: ShopClientProps) {
  const categories = [
    {
      name: 'T-Shirts',
      slug: 't-shirts',
      count: categoryCounts['t-shirts'] || 0,
      img: '/shop-tshirts.png'
    },
    {
      name: 'Shirts',
      slug: 'shirts',
      count: categoryCounts['shirts'] || 0,
      img: '/shop-shirts.png'
    },
    {
      name: 'Jeans',
      slug: 'jeans',
      count: categoryCounts['jeans'] || 0,
      img: '/shop-jeans.png'
    },
    {
      name: 'Outerwear',
      slug: 'outerwear',
      count: categoryCounts['outerwear'] || 0,
      img: '/shop-outerwear.png'
    },
  ]

  return (
    <>
      <Header />
      
      <main className="bg-white">
        {/* Hero Section */}
        <section className="w-full h-64 bg-black text-white flex flex-col items-center justify-center px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-bebas-neue text-6xl font-black mb-4">SHOP</h1>
            <p className="text-sm font-inter">Browse our complete collection</p>
          </motion.div>
        </section>

        {/* Category Grid */}
        <section className="w-full px-6 md:px-16 py-12 md:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {categories.map((category, idx) => (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
              >
                <Link href={`/shop/${category.slug}`} className="group flex flex-col items-center justify-center p-6 text-black hover:text-black transition-colors duration-300">
                  <div className="w-44 h-44 relative flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={category.img}
                      alt={category.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 176px, 176px"
                      priority
                    />
                  </div>
                  <h3 className="font-bebas-neue text-2xl font-black tracking-widest text-center mt-2 group-hover:opacity-75 transition-opacity">
                    {category.name}
                  </h3>
                  <p className="text-[10px] font-inter uppercase tracking-widest opacity-40 group-hover:opacity-75 transition-opacity mt-1">
                    {category.count} items
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* All Products Grid */}
          <div className="mt-16">
            <h2 className="font-bebas-neue text-3xl font-black mb-8">ALL PRODUCTS</h2>
            <ProductGrid products={products} />
            {products.length === 0 && (
              <div className="text-center py-12 text-xs opacity-50 font-inter">
                No products found.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
