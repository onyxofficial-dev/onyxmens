'use client'

import { motion } from 'framer-motion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import Link from 'next/link'
import { PageTitle } from '@/components/page-title'

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageTitle title="Privacy Policy" />
      <Header />
      
      <main className="bg-white">
        <section className="px-16 py-12 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="font-bebas-neue text-4xl font-black mb-4">PRIVACY POLICY</h1>
            <p className="font-inter text-xs opacity-60 mb-12">Last updated: June 2024</p>

            <div className="space-y-8 font-inter text-sm leading-relaxed">
              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">1. INTRODUCTION</h2>
                <p>
                  ONYX (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information.
                </p>
              </div>

              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">2. INFORMATION WE COLLECT</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Contact and shipping details (name, email, phone, address)</li>
                  <li>• Order history and preferences</li>
                  <li>• Device and usage data (cookies, analytics)</li>
                  <li>• Communications (messages)</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">3. HOW WE USE YOUR DATA</h2>
                <ul className="space-y-2 ml-4">
                  <li>• Process and fulfill orders</li>
                  <li>• Send transactional notifications</li>
                  <li>• Improve our products and services</li>
                  <li>• Personalize your shopping experience</li>
                  <li>• Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">4. DATA PROTECTION</h2>
                <p>
                  We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, and disclosure.
                </p>
              </div>

              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">5. YOUR RIGHTS</h2>
                <p className="mb-3">Under the Digital Personal Data Protection Act (DPDP), 2023, you have the right to:</p>
                <ul className="space-y-2 ml-4">
                  <li>• Access your personal data</li>
                  <li>• Correct inaccurate data</li>
                  <li>• Request deletion of your data</li>
                  <li>• Data portability</li>
                </ul>
                <p className="mt-3">
                  To exercise these rights, please contact our support team.
                </p>
              </div>

              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">6. COOKIES</h2>
                <p>
                  We use cookies to enhance your browsing experience. You can disable cookies in your browser settings, though some features may not work properly.
                </p>
              </div>

              <div>
                <h2 className="font-bebas-neue text-xl font-black mb-3">7. CONTACT US</h2>
                <p>
                  For privacy concerns, contact us at <span className="font-bold">onyxmensofficial@gmail.com</span> or visit <Link href="/support" className="underline font-bold">Support</Link>
                </p>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-black">
              <Link href="/">
                <button className="text-xs uppercase tracking-widest font-inter font-bold hover:opacity-60">
                  ← BACK TO HOME
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
