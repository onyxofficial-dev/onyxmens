'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

export default function ReturnsPage() {
  return (
    <>
      <PageTitle title="Returns & Exchanges" />
      <Header />
      
      <main className="bg-white">
        <section className="px-16 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-bebas-neue text-4xl font-black mb-4">RETURNS & EXCHANGES</h1>
            <p className="font-inter text-sm opacity-60 mb-12">30-day returns on unworn items</p>

            <div className="space-y-12">
              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">RETURN POLICY</h2>
                <p className="font-inter text-sm leading-relaxed mb-6">
                  We stand behind our products. If you&apos;re not satisfied with your purchase, you can return it within 30 days of delivery for a full refund or exchange.
                </p>
                <ul className="space-y-3 font-inter text-sm">
                  <li>✓ 30 days from delivery date</li>
                  <li>✓ Items must be unworn with tags attached</li>
                  <li>✓ Original packaging required</li>
                  <li>✓ No return shipping fee on returns</li>
                  <li>✓ Refund within 7-10 business days</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">HOW TO RETURN</h2>
                <ol className="space-y-4">
                  {[
                    "Message us on WhatsApp with your order reference number and we'll guide you through the return process.",
                    'Describe the reason for your return or exchange.',
                    'Keep the items in their original packaging with tags intact.',
                    'Our team will coordinate the return pickup and process your request.',
                  ].map((step, idx) => (
                    <li key={idx} className="flex gap-4">
                      <span className="font-black min-w-fit">{idx + 1}.</span>
                      <span className="font-inter text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">EXCHANGES</h2>
                <p className="font-inter text-sm">
                  Need a different size or color? We offer free exchanges within 30 days. Select &quot;Exchange&quot; when initiating your return.
                </p>
              </div>

              <div className="bg-black text-white p-8">
                <h2 className="font-bebas-neue text-lg font-black mb-3">NEED HELP?</h2>
                <p className="font-inter text-sm mb-4">Contact our support team for any return-related questions.</p>
                <Link href="/support">
                  <button className="px-6 py-3 bg-white text-black font-inter text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white hover:border hover:border-white transition-all">
                    CONTACT SUPPORT
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
