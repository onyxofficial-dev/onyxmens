'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

export default function ShippingPage() {
  return (
    <>
      <PageTitle title="Shipping Policy" />
      <Header />
      
      <main className="bg-white">
        <section className="px-16 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-bebas-neue text-4xl font-black mb-4">SHIPPING</h1>
            <p className="font-inter text-sm opacity-60 mb-12">Get your order delivered</p>

            <div className="space-y-12">
              {/* Same Day Delivery callout */}
              <div className="border-2 border-black bg-neutral-50 p-6 flex items-start gap-4 shadow-sm">
                <div className="text-xl">⚡</div>
                <div>
                  <h2 className="font-bebas-neue text-2xl font-black mb-2">Same Day Delivery — Jamnagar</h2>
                  <p className="font-inter text-sm leading-relaxed mb-2">
                    Jamnagar city customers qualify for same day delivery on all orders placed before <strong>2:00 PM</strong>.
                  </p>
                  <p className="font-inter text-xs text-neutral-500 italic">
                    *Note: Delivery within Jamnagar city limits only.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">SHIPPING OPTIONS</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Standard Delivery', time: '5-7 working days', cost: 'Free on orders over ₹150' },
                    { name: 'Express Delivery', time: '2-3 working days', cost: '₹99' },
                    { name: 'Overnight Delivery', time: 'Next day (by 10 AM)', cost: '₹299' },
                  ].map((option) => (
                    <div key={option.name} className="border border-black p-6 hover:bg-black hover:text-white transition-all">
                      <h3 className="font-bebas-neue text-lg font-black mb-2">{option.name}</h3>
                      <div className="flex justify-between font-inter text-sm">
                        <p>{option.time}</p>
                        <p className="font-bold">{option.cost}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">COVERAGE AREA</h2>
                <ul className="space-y-2 font-inter text-sm">
                  <li>✓ All major cities in India</li>
                  <li>✓ Tier-2 cities: 7-10 working days</li>
                  <li>✓ Remote areas: 10-15 working days</li>
                  <li>✓ International: Contact support for quotes</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">TRACKING YOUR ORDER</h2>
                <p className="font-inter text-sm mb-4">Once shipped, you&apos;ll receive a tracking link via email. You can track your order anytime on our platform.</p>
                <Link href="/support">
                  <button className="px-6 py-3 bg-black text-white font-inter text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-black hover:border hover:border-black transition-all">
                    TRACK YOUR ORDER
                  </button>
                </Link>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-black">
              <Link href="/support">
                <button className="text-xs uppercase tracking-widest font-inter font-bold hover:opacity-60">
                  ← BACK TO SUPPORT
                </button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  )
}
