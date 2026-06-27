'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

export default function AboutPage() {
  return (
    <>
      <PageTitle title="About Us" />
      <Header />

      <main className="w-full bg-white">

        {/* Section 1: Hero / Manifesto */}
        <section className="w-full bg-black text-white px-8 md:px-16 py-24 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-8 block">
              ONYX — URBAN INDIAN MENSWEAR
            </span>
            <h1
              className="font-bebas-neue font-black text-white mb-8"
              style={{ fontSize: 'clamp(56px, 10vw, 120px)', lineHeight: 0.88 }}
            >
              WEAR LESS.<br />SAY MORE.
            </h1>
            <p className="text-sm font-inter leading-7 max-w-2xl opacity-75">
              ONYX is not a fashion brand. It's a position. We make clothes for men who
              don't need to announce themselves — men who let the cut, the fabric, and
              the silence do the talking. Everything we make is stripped to its purpose.
              If it doesn't need to be there, it isn't.
            </p>
          </motion.div>
        </section>

        {/* Section 2: Philosophy */}
        <section className="w-full bg-white px-8 md:px-16 py-20 border-b border-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl"
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              OUR PHILOSOPHY
            </span>
            <h2
              className="font-bebas-neue font-black text-black mb-6"
              style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9 }}
            >
              LESS IS MORE.
            </h2>
            <p className="text-sm font-inter leading-7 opacity-70 mb-4">
              In a market full of noise — loud graphics, endless drops, fast fashion
              manufactured to look premium — we made the opposite choice. Restraint is
              harder than excess. Simplicity takes more skill than decoration.
            </p>
            <p className="text-sm font-inter leading-7 opacity-70">
              Every ONYX piece is designed to outlast trends. Not because it's boring —
              because it's right. The kind of right that still works three years from now.
            </p>
          </motion.div>
        </section>

        {/* Section 3: The Standard — Quality & Fabric Transparency */}
        <section className="w-full bg-black text-white px-8 md:px-16 py-20 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              THE STANDARD
            </span>
            <h2
              className="font-bebas-neue font-black text-white mb-10"
              style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9 }}
            >
              WHAT GOES INTO EVERY PIECE.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10">
              {[
                {
                  title: 'FABRIC FIRST',
                  desc: 'We source premium cotton and structured blends selected specifically for Indian heat and daily wear. No synthetic shortcuts. No compromise on how it feels against your skin.',
                },
                {
                  title: 'BUILT TO HOLD',
                  desc: 'Double-stitched seams on stress points. Pre-shrunk fabric so your size stays your size. Colourfast dyes that don\'t bleed after ten washes. The details no one notices until they fail.',
                },
                {
                  title: 'CHECKED BEFORE IT SHIPS',
                  desc: 'Every piece passes a quality check before it leaves. We don\'t move units — we move products we\'d wear ourselves. If it doesn\'t clear the bar, it doesn\'t go out.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="p-8 border border-white/10"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-bebas-neue font-black text-xl mb-3">{item.title}</h3>
                  <p className="text-xs font-inter leading-6 opacity-60">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 4: Built for Indian Men */}
        <section className="w-full bg-white px-8 md:px-16 py-20 border-b border-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              FIT & FUNCTION
            </span>
            <h2
              className="font-bebas-neue font-black text-black mb-10"
              style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9 }}
            >
              MADE FOR THE INDIAN BODY. ACTUALLY.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="text-sm font-inter leading-7 opacity-70 mb-6">
                  Most international brands size for Western builds and call it universal.
                  It isn't. Indian men have different shoulder widths, torso lengths, and
                  proportions — clothing that ignores that will never fit right, regardless
                  of the tag.
                </p>
                <p className="text-sm font-inter leading-7 opacity-70">
                  ONYX patterns are calibrated for the Indian male silhouette. Shoulders
                  sit where they should. Lengths fall right. The fit isn't an afterthought
                  — it's the starting point.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-px bg-black">
                {[
                  {
                    label: 'CLIMATE',
                    detail: 'Fabrics chosen for Indian heat and humidity — breathable and structured, not stiff.',
                  },
                  {
                    label: 'SILHOUETTE',
                    detail: 'Patterns graded on Indian body proportions, not adapted from Western templates.',
                  },
                  {
                    label: 'SIZING',
                    detail: 'XS to XXL with consistent measurements you can trust across every style we make.',
                  },
                  {
                    label: 'DAILY WEAR',
                    detail: 'Made for real use — commute, college, weekend. Not just product photography.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white p-6 border border-black">
                    <p className="text-xs uppercase tracking-widest font-inter font-bold mb-2 opacity-40">
                      {item.label}
                    </p>
                    <p className="text-xs font-inter leading-5 opacity-70">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Section 5: Values Grid */}
        <section className="w-full bg-black text-white px-8 md:px-16 py-20 border-b border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              WHAT WE STAND FOR
            </span>
            <h2
              className="font-bebas-neue font-black text-white mb-10"
              style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9 }}
            >
              OUR VALUES.
            </h2>

            <div className="grid grid-cols-2 gap-px bg-white/10">
              {[
                {
                  title: 'QUALITY',
                  desc: 'Materials that hold up — not materials that photograph well for 30 days then fall apart. Premium is a standard, not a selling point.',
                },
                {
                  title: 'RESTRAINT',
                  desc: 'We don\'t add because we can. Every design choice is justified. If something is on the garment, it earned its place there.',
                },
                {
                  title: 'DURABILITY',
                  desc: 'Built to last multiple seasons. We\'d rather you own one ONYX piece for three years than buy three pieces that last one.',
                },
                {
                  title: 'HONESTY',
                  desc: 'No inflated claims. No fake luxury. We tell you what\'s in the fabric, how it\'s made, and what to expect — then we deliver it.',
                },
              ].map((value, idx) => (
                <motion.div
                  key={idx}
                  className="bg-black p-8 border border-white/10 hover:bg-white hover:text-black transition-all duration-200 cursor-pointer group"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-bebas-neue font-black text-xl mb-2">{value.title}</h3>
                  <p className="text-xs font-inter opacity-60 group-hover:opacity-70 leading-5">
                    {value.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 6: How We Work — D2C Honesty Block */}
        <section className="w-full bg-white px-8 md:px-16 py-20 border-b border-black">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              HOW WE WORK
            </span>
            <h2
              className="font-bebas-neue font-black text-black mb-6"
              style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9 }}
            >
              DIRECT. HONEST.<br />NO MIDDLEMEN.
            </h2>
            <p className="text-sm font-inter leading-7 opacity-70 max-w-2xl mb-12">
              ONYX is direct-to-consumer. No retail markup. No distributor taking a cut.
              You pay for the product, not the chain. That's how we keep quality high and
              pricing honest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black">
              {[
                {
                  num: '01',
                  title: 'ORDER VIA WHATSAPP',
                  desc: 'We confirm every order through WhatsApp — real people, real responses. Not a chatbot. Not a ticketing system. You talk to us directly.',
                },
                {
                  num: '02',
                  title: 'PAY ON DELIVERY',
                  desc: 'Cash on delivery is available. You don\'t risk a single rupee until the product is physically in your hands. No prepayment required.',
                },
                {
                  num: '03',
                  title: 'NATIONWIDE SHIPPING',
                  desc: 'We deliver across India. Every order is tracked, packed properly, and arrives in the same condition it left our facility.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white p-8 border border-black"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <span className="font-bebas-neue text-5xl font-black opacity-10 block mb-4">
                    {item.num}
                  </span>
                  <h3 className="font-bebas-neue font-black text-lg mb-2">{item.title}</h3>
                  <p className="text-xs font-inter leading-5 opacity-60">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 7: Community / Identity — replaces Team */}
        <section className="w-full bg-black text-white px-8 md:px-16 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="text-xs uppercase tracking-widest font-inter font-bold opacity-40 mb-6 block">
              THE ONYX MAN
            </span>
            <h2
              className="font-bebas-neue font-black text-white mb-6"
              style={{ fontSize: 'clamp(36px, 6vw, 72px)', lineHeight: 0.9 }}
            >
              NOT EVERYONE'S BRAND.<br />YOURS, IF IT FITS.
            </h2>
            <p className="text-sm font-inter leading-7 opacity-70 mb-10 max-w-xl mx-auto">
              ONYX is for men who are done proving themselves through what they wear.
              You know what you want. You dress with intention, not impulse. You'd rather
              buy less and buy right. If that sounds like you — you're already in.
            </p>
            <Link
              href="/shop"
              className="inline-block px-8 py-4 border border-white text-white text-xs uppercase tracking-widest font-inter hover:bg-white hover:text-black transition-all duration-200"
            >
              SHOP THE COLLECTION
            </Link>
          </motion.div>
        </section>

      </main>

      <Footer />
    </>
  )
}
