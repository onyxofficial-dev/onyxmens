'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Image from 'next/image'
import Link from 'next/link'
import HeroCarousel from '@/components/HeroCarousel'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
}

const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, delay: 0.2 },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const CAROUSEL_ITEMS = [
  { img: '/cta-tshirts.png', label: 'T-SHIRTS', href: '/shop/t-shirts' },
  { img: '/cta-shirts.png', label: 'SHIRTS', href: '/shop/shirts' },
  { img: '/cta-jeans.png', label: 'JEANS', href: '/shop/jeans' },
  { img: '/cta-tshirts.png', label: 'OUTERWEAR', href: '/shop/outerwear' },
]

type ProductImage = {
  image_url: string
  is_cover: boolean
}

type Product = {
  id: string
  name: string
  slug: string
  base_price: number
  product_images?: ProductImage[]
}

type HomeClientProps = {
  featuredProducts: Product[]
}

export default function HomeClient({ featuredProducts }: HomeClientProps) {
  return (
    <>
      <Header />

      {/* SECTION 3: HERO */}
      <section className="relative w-full h-screen bg-white overflow-hidden flex items-center">
        {/* Background ONYX text (floating marquee) */}
        <div className="absolute inset-0 flex items-center pointer-events-none overflow-hidden opacity-[0.15]">
          <div className="marquee-inner flex whitespace-nowrap" style={{ animationDuration: '120s' }}>
            <span
              className="font-bebas-neue font-bold text-black select-none pr-12"
              style={{
                fontSize: 'clamp(200px, 28vw, 380px)',
                lineHeight: 1,
              }}
            >
              {"ONYX ONYX ONYX ONYX ONYX ONYX ONYX ONYX\u00A0"}
            </span>
            <span
              className="font-bebas-neue font-bold text-black select-none pr-12"
              style={{
                fontSize: 'clamp(200px, 28vw, 380px)',
                lineHeight: 1,
              }}
            >
              {"ONYX ONYX ONYX ONYX ONYX ONYX ONYX ONYX\u00A0"}
            </span>
          </div>
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-16 pt-24 md:pt-0 gap-12 md:gap-0">
          {/* Left: Copy */}
          <motion.div
            className="flex-1 max-w-md flex flex-col items-center md:items-start text-center md:text-left"
            initial="initial"
            animate="animate"
            variants={slideInLeft}
          >
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <span className="text-xs uppercase tracking-widest font-inter font-bold">NEW DROP</span>
              <div className="w-16 h-px bg-black"></div>
            </div>

            <h1
              className="font-bebas-neue font-black text-black mb-6"
              style={{
                fontSize: 'clamp(60px, 10vw, 120px)',
                lineHeight: 0.9,
              }}
            >
              Wear Less.
              <br />
              Say More.
            </h1>

            <p className="text-sm font-inter mb-6">Premium Minimalism. Affordable Reality.</p>

            <Link href="/shop">
              <button className="px-6 py-3 bg-black/75 backdrop-blur-md text-white text-xs uppercase tracking-widest font-inter hover:bg-black hover:text-white transition-all duration-300 flex items-center gap-2 border border-white/10 shadow-lg cursor-pointer rounded-none">
                SHOP NOW <ArrowRight className="w-3 h-3" />
              </button>
            </Link>
          </motion.div>

          {/* Right: Model Image */}
          <motion.div
            className="flex-1 w-full md:w-auto h-auto md:h-full flex items-end justify-center relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="relative w-full md:w-[500px] h-[420px] md:h-[600px] bg-transparent flex items-center justify-center overflow-hidden">
              <HeroCarousel />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: SPLIT BANNER */}
      <section className="w-full min-h-16 flex flex-col md:flex-row border-t border-b border-black bg-white">
        <div className="flex-1 bg-black text-white flex items-center justify-center md:justify-start px-4 py-4 md:px-8">
          <span className="text-xs md:text-sm uppercase tracking-widest font-inter font-bold text-center md:text-left">
            DESIGNED TO MOVE. MADE TO LAST.
          </span>
        </div>
        <Link href="/shop" className="flex-grow flex">
          <motion.button
            className="flex-1 bg-white text-black flex items-center justify-center md:justify-end px-4 py-4 md:px-8 hover:bg-black hover:text-white cursor-pointer transition-all duration-200 border-t md:border-t-0 md:border-l border-black text-xs md:text-sm uppercase tracking-widest font-inter font-bold w-full"
            whileHover={{ backgroundColor: '#000000', color: '#ffffff' }}
          >
            EXPLORE COLLECTION <ArrowRight className="w-3 h-3 ml-2" />
          </motion.button>
        </Link>
      </section>

      {/* SECTION 5: ABOUT SECTION */}
      <section className="w-full min-h-96 bg-black text-white flex flex-col lg:flex-row items-center px-6 py-12 md:px-16 md:py-20 gap-12 lg:gap-0 relative overflow-hidden">
        {/* Background video overlay */}
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/videos/Flow_202606232015.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-screen pointer-events-none"
        />

        <motion.div
          className="flex-1 relative z-10 bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 md:p-12 max-w-xl"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-xs uppercase tracking-widest font-inter font-bold mb-4">ABOUT ONYX</h2>
          <p className="text-sm font-inter leading-7 opacity-80 mb-6 max-w-md">
            We&apos;re obsessed with stitching quality. We find pieces that fit, check the seams, and sell them at prices that make sense.
          </p>
          <Link href="/about" className="text-xs uppercase tracking-widest font-inter hover:underline inline-flex items-center gap-2">
            LEARN MORE <ArrowRight className="w-2 h-2" />
          </Link>
        </motion.div>

        <motion.div
          className="flex-1 relative h-96 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="font-bebas-neue font-bold text-white select-none" style={{ fontSize: '200px', lineHeight: 1 }}>
              ONYX
            </span>
          </div>
        </motion.div>
      </section>

      {/* SECTION 6: MARQUEE STRIP */}
      <section className="w-full h-11 bg-white border-t-2 border-b-2 border-black flex items-center overflow-hidden relative">
        <div className="marquee-inner" style={{ animationDuration: '20s' }}>
          <span className="inline-block text-xs uppercase tracking-widest font-inter font-bold text-black pr-8">
            {"NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦\u00A0"}
          </span>
          <span className="inline-block text-xs uppercase tracking-widest font-inter font-bold text-black pr-8">
            {"NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦ NEW DROP ✦\u00A0"}
          </span>
        </div>
      </section>

      {/* SECTION 7: BESTSELLERS */}
      <section className="w-full bg-white">
        <div className="flex flex-col md:flex-row">
          {/* Left Sidebar */}
          <div className="w-full md:w-40 bg-white border-b md:border-b-0 md:border-r border-black flex items-center justify-center relative py-8 md:py-16 px-4">
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <div
                className="font-bebas-neue font-black text-black select-none hidden lg:block"
                style={{
                  fontSize: '80px',
                  lineHeight: 1,
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                }}
              >
                BESTSELLERS
              </div>
            </div>
            <div
              className="font-bebas-neue font-black text-black text-2xl md:text-3xl hidden md:block lg:hidden"
              style={{
                lineHeight: 1,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              BESTSELLERS
            </div>
            <div
              className="font-bebas-neue font-black text-black text-[80px] hidden lg:block"
              style={{
                lineHeight: 1,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
              }}
            >
              BESTSELLERS
            </div>
            <div className="font-bebas-neue font-black text-black text-5xl md:hidden">
              BESTSELLERS
            </div>
          </div>

          {/* Right: Product Grid */}
          <motion.div
            className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-black p-px md:p-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {featuredProducts.map((product, idx) => {
              const pImages = product.product_images || []
              const pCover = pImages.find(img => img.is_cover) || pImages[0] || { image_url: '/placeholder-tee.png' }

              return (
                <motion.div
                  key={product.id}
                  className="bg-white p-4 flex flex-col group relative transition-all duration-200 text-left border border-black overflow-hidden h-full cursor-pointer"
                  variants={fadeInUp}
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="relative w-full aspect-[3/4] bg-gray-200 mb-4 flex items-center justify-center overflow-hidden border border-gray-100">
                      <Image 
                        src={pCover.image_url} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <h3 className="text-xs uppercase tracking-widest font-inter font-bold mb-2 truncate group-hover:opacity-60 transition-opacity">
                      {product.name}
                    </h3>
                    <p className="text-xs font-inter">₹{product.base_price}</p>
                  </Link>
                </motion.div>
              )
            })}
            {featuredProducts.length === 0 && (
              <div className="bg-white p-8 text-center text-xs opacity-50 col-span-4">
                No bestseller products found.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* SECTION 7.5: URBAN INDIAN MENSWEAR MARQUEE */}
      <section className="w-full h-11 bg-white border-t-2 border-b-2 border-black flex items-center overflow-hidden relative">
        <div className="marquee-inner" style={{ animationDuration: '40s' }}>
          <span className="inline-block text-xs uppercase tracking-widest font-inter font-bold text-black pr-8">
            {"Urban Indian Menswear ✦ Effortless Style ✦ Unbeatable Value ✦ Urban Indian Menswear ✦ Effortless Style ✦ Unbeatable Value ✦ Urban Indian Menswear ✦ Effortless Style ✦ Unbeatable Value ✦\u00A0"}
          </span>
          <span className="inline-block text-xs uppercase tracking-widest font-inter font-bold text-black pr-8">
            {"Urban Indian Menswear ✦ Effortless Style ✦ Unbeatable Value ✦ Urban Indian Menswear ✦ Effortless Style ✦ Unbeatable Value ✦ Urban Indian Menswear ✦ Effortless Style ✦ Unbeatable Value ✦\u00A0"}
          </span>
        </div>
      </section>

      {/* SECTION 8: REDESIGNED FOOTER CTA BANNER */}
      <section className="w-full bg-black text-white py-16 md:py-24 border-t border-white/10 relative overflow-hidden flex flex-col items-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none z-0"></div>

        {/* Text Header with Staggered Scroll Animation */}
        <div className="w-full max-w-7xl px-6 md:px-16 mb-12 md:mb-16 z-10 text-center md:text-left relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <span className="text-[10px] uppercase tracking-widest font-inter font-bold text-white/50 mb-3 block">
                ONYX ✦ DEFINE YOUR STANDARD
              </span>
              <h2
                className="font-bebas-neue font-black text-white tracking-wide leading-none"
                style={{ fontSize: 'clamp(40px, 6vw, 72px)' }}
              >
                ELEVATE YOUR STYLE.
              </h2>
            </div>
            <p className="text-xs font-inter leading-relaxed max-w-sm text-white/60">
              Modern streetwear engineered with premium fabrics and clean silhouettes. Designed to stand out, made to endure.
            </p>
          </motion.div>
        </div>

        {/* Infinite Auto-Scrolling Category Gallery */}
        <div className="w-full overflow-hidden relative z-10 mb-12 md:mb-16 py-4">
          {/* Gradient masks for smooth fade-in/fade-out */}
          <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-20 pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-20 pointer-events-none"></div>

          <div 
            className="flex w-max marquee-inner hover:[animation-play-state:paused] cursor-grab active:cursor-grabbing"
            style={{ animationDuration: '30s' }}
          >
            {/* Track 1 */}
            <div className="flex gap-6 pr-6">
              {CAROUSEL_ITEMS.map((item, idx) => (
                <Link key={`t1-${idx}`} href={item.href} className="group block w-64 md:w-72 aspect-[3/4] relative bg-transparent overflow-hidden border border-white/5">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 256px, 288px"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 p-4 flex justify-between items-center transition-all duration-300 group-hover:border-white/20 group-hover:bg-black/80">
                    <span className="font-bebas-neue text-lg font-black tracking-wide text-white">
                       {item.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Track 2 (for seamless loop) */}
            <div className="flex gap-6 pr-6" aria-hidden="true">
              {CAROUSEL_ITEMS.map((item, idx) => (
                <Link key={`t2-${idx}`} href={item.href} className="group block w-64 md:w-72 aspect-[3/4] relative bg-transparent overflow-hidden border border-white/5">
                  <Image
                    src={item.img}
                    alt={item.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-all duration-700"
                    sizes="(max-width: 768px) 256px, 288px"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-md border border-white/10 p-4 flex justify-between items-center transition-all duration-300 group-hover:border-white/20 group-hover:bg-black/80">
                    <span className="font-bebas-neue text-lg font-black tracking-wide text-white">
                       {item.label}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Center CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="z-10"
        >
          <Link href="/shop">
            <button className="relative px-8 py-4 bg-transparent text-white border border-white/20 hover:border-white hover:text-black transition-all duration-300 font-inter text-xs font-bold uppercase tracking-widest overflow-hidden group cursor-pointer">
              <span className="absolute inset-0 w-full h-full bg-white scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out z-0"></span>
              <span className="relative z-10 flex items-center gap-2">
                ENTER THE SHOWROOM <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </Link>
        </motion.div>
      </section>

      <Footer />
    </>
  )
}
