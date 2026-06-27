'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useState } from 'react'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

const faqs = [
  {
    q: 'What is ONYX?',
    a: 'ONYX is a minimalist menswear brand focused on clean silhouettes, premium fabrics, and timeless design. We create pieces built to move, made to last.',
  },
  {
    q: 'How long does shipping take?',
    a: 'Standard delivery takes 5-7 working days. Express (2-3 days) and Overnight (next day by 10 AM) options are also available at checkout.',
  },
  {
    q: 'Can I return my order?',
    a: 'Yes! We offer 30-day returns on unworn items with tags attached. Visit /support/returns for full details.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship within India. International shipping is available for select regions. Contact support for quotes.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept Cash on Delivery and Prepaid (UPI or bank transfer). All payments are arranged directly through WhatsApp after your order is confirmed.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is confirmed, our team will send you updates directly via WhatsApp. You can also reach us on WhatsApp to check your order status.',
  },
]

export default function FAQPage() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <>
      <PageTitle title="FAQs" />
      <Header />
      
      <main className="bg-white">
        <section className="px-16 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-bebas-neue text-4xl font-black mb-4">FREQUENTLY ASKED QUESTIONS</h1>
            <p className="font-inter text-sm opacity-60 mb-12">Find answers to common questions</p>

            <div className="space-y-3 mb-12">
              {faqs.map((faq, idx) => (
                <motion.div
                  key={idx}
                  className="border border-black"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  viewport={{ once: true }}
                >
                  <button
                    onClick={() => setExpanded(expanded === idx ? null : idx)}
                    className="w-full px-6 py-4 flex justify-between items-center hover:bg-black hover:text-white transition-all"
                  >
                    <span className="font-bebas-neue font-black text-lg text-left">{faq.q}</span>
                    <span className="text-xl font-black">{expanded === idx ? '−' : '+'}</span>
                  </button>

                  {expanded === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-black bg-gray-50 px-6 py-4"
                    >
                      <p className="font-inter text-sm leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="bg-black text-white p-8 text-center">
              <h2 className="font-bebas-neue text-lg font-black mb-3">STILL HAVE QUESTIONS?</h2>
              <p className="font-inter text-sm mb-4">Contact our support team anytime</p>
              <Link href="/support">
                <button className="px-6 py-3 bg-white text-black font-inter text-xs uppercase tracking-widest font-bold hover:bg-black hover:text-white hover:border hover:border-white transition-all">
                  CONTACT SUPPORT
                </button>
              </Link>
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
