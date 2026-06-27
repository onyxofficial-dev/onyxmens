'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

export default function SizeGuidePage() {
  return (
    <>
      <PageTitle title="Size Guide" />
      <Header />
      
      <main className="bg-white">
        <section className="px-16 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-bebas-neue text-4xl font-black mb-4">SIZE GUIDE</h1>
            <p className="font-inter text-sm opacity-60 mb-12">Find your perfect fit</p>

            <div className="space-y-12">
              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">MEASUREMENTS</h2>
                <div className="overflow-x-auto border border-black">
                  <table className="w-full text-sm font-inter">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Size</th>
                        <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Chest (cm)</th>
                        <th className="px-6 py-4 text-left font-bold uppercase tracking-widest">Length (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: 'XS', chest: '48', length: '64' },
                        { size: 'S', chest: '51', length: '66' },
                        { size: 'M', chest: '54', length: '68' },
                        { size: 'L', chest: '58', length: '70' },
                        { size: 'XL', chest: '62', length: '72' },
                        { size: 'XXL', chest: '66', length: '74' },
                      ].map((row) => (
                        <tr key={row.size} className="border-b border-black hover:bg-black hover:text-white transition-all">
                          <td className="px-6 py-4 font-bold">{row.size}</td>
                          <td className="px-6 py-4">{row.chest}</td>
                          <td className="px-6 py-4">{row.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h2 className="font-bebas-neue text-2xl font-black mb-6">HOW TO MEASURE</h2>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="font-black">1.</span>
                    <span className="font-inter">Measure chest at fullest point</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-black">2.</span>
                    <span className="font-inter">For length, measure from shoulder to hem</span>
                  </li>
                  <li className="flex gap-4">
                    <span className="font-black">3.</span>
                    <span className="font-inter">Keep tape loose for comfort</span>
                  </li>
                </ol>
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
