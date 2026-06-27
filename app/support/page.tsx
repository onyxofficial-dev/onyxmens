'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

const SUPPORT_SECTIONS = [
  {
    title: 'Size Guide',
    href: '/support/size-guide',
    description:
      'Find your exact fit. Our sizing is calibrated for the Indian male silhouette — shoulders, chest, and torso proportions that actually match.',
  },
  {
    title: 'Shipping & Delivery',
    href: '/support/shipping',
    description:
      'Nationwide delivery in 3–5 business days. Every order is tracked from our facility to your door. No surprises.',
  },
  {
    title: 'Returns & Exchanges',
    href: '/support/returns',
    description:
      'Returns are handled directly over WhatsApp. Message us, we\'ll guide you through the process — no complicated forms, no long waits.',
  },
  {
    title: 'FAQs',
    href: '/support/faq',
    description:
      'Answers to common questions about ordering, WhatsApp checkout, COD, shipping, and returns.',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Browse & Add to Cart',
    desc: 'Pick your size, select your style, add to cart. No account needed — just your name and address at checkout.',
  },
  {
    step: '02',
    title: 'Fill the Order Form',
    desc: 'Enter your name, mobile number, and delivery address. Choose Cash on Delivery or Prepaid UPI — whichever works for you.',
  },
  {
    step: '03',
    title: 'Confirm on WhatsApp',
    desc: 'A pre-filled WhatsApp message opens automatically. Hit Send. Our team confirms your order and handles the rest.',
  },
]

export default function SupportPage() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'

  return (
    <>
      <PageTitle title="Support Hub" />
      <Header />

      <main className="w-full bg-white">

        {/* Header */}
        <section className="w-full px-8 md:px-16 py-20 border-b border-black">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              HELP & INFO
            </span>
            <h1
              className="font-bebas-neue font-black text-black uppercase tracking-wide mb-4"
              style={{ fontSize: 'clamp(48px, 10vw, 96px)', lineHeight: 0.9 }}
            >
              SUPPORT
            </h1>
            <p className="text-sm font-inter opacity-70 max-w-md">
              Everything you need to know about ordering, shipping, returns, and sizing.
            </p>
          </motion.div>
        </section>

        {/* How It Works — new section */}
        <section className="w-full bg-black text-white px-8 md:px-16 py-16 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              FIRST TIME HERE?
            </span>
            <h2
              className="font-bebas-neue font-black text-white mb-10"
              style={{ fontSize: 'clamp(28px, 4vw, 52px)', lineHeight: 0.9 }}
            >
              HOW ORDERING AT ONYX WORKS.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
              {HOW_IT_WORKS.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="p-8 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="font-bebas-neue text-5xl font-black opacity-10 block mb-4">
                    {item.step}
                  </span>
                  <h3 className="font-bebas-neue font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-xs font-inter leading-5 opacity-60">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <p className="text-xs font-inter opacity-40 mt-6">
              We use WhatsApp for order confirmation — so you always know who you're talking to and can ask questions directly.
            </p>
          </motion.div>
        </section>

        {/* Support Grid */}
        <section className="w-full px-8 md:px-16 py-16 border-b border-black">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-8 block">
              QUICK LINKS
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SUPPORT_SECTIONS.map((section, idx) => (
              <motion.div
                key={section.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={section.href}>
                  <div className="group p-6 border border-black hover:bg-black transition-all duration-200 cursor-pointer">
                    <h2 className="font-bebas-neue text-2xl font-black uppercase tracking-wide mb-2 group-hover:text-white transition-colors">
                      {section.title}
                    </h2>
                    <p className="text-sm font-inter opacity-60 mb-4 group-hover:opacity-90 group-hover:text-white transition-all">
                      {section.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-inter group-hover:text-white transition-colors">
                      Learn More <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA — WhatsApp only */}
        <section className="w-full px-8 md:px-16 py-16 bg-black text-white">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-bebas-neue text-3xl md:text-5xl font-black uppercase tracking-wide mb-4">
              STILL HAVE QUESTIONS?
            </h2>
            <p className="text-sm font-inter opacity-70 mb-8 max-w-md mx-auto">
              Message us on WhatsApp. Real responses from real people — not bots, not
              email queues. We reply fast.
            </p>
            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi%20ONYX%2C%20I%20have%20a%20question.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black text-xs uppercase tracking-widest font-inter hover:bg-gray-100 transition-all duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              CHAT ON WHATSAPP
            </a>
          </motion.div>
        </section>

      </main>

      <Footer />
    </>
  )
}
