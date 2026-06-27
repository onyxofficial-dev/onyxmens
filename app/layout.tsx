import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from '@/lib/site-config'

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas-neue',
  weight: '400',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Onyx — Urban Indian Menswear',
    template: '%s | Onyx',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Tier 1
    'onyx', 'onyx menswear', 'onyx mens clothing', 'onyx cloth india', 'onyxmens',
    'onyx clothing brand india',
    // Tier 2
    'same day delivery jamnagar', 'mens clothing jamnagar', 'clothes shop jamnagar',
    'mens wear jamnagar', 'emergency shopping jamnagar', 'clothes delivery jamnagar',
    'online mens clothes jamnagar', 'menswear delivery jamnagar', 'mens fashion jamnagar',
    // Tier 3
    'mens t-shirts india online', 'premium mens shirts india', 'mens jeans online india',
    'mens outerwear india', 'buy mens clothing india',
    // Tier 4
    'premium indian menswear', 'urban indian menswear', 'minimalist mens fashion india',
    'mens streetwear india', 'mens clothing brand india',
  ],
  openGraph: { type: 'website', siteName: 'Onyx', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="font-inter bg-white text-black">
        {/* JSON-LD Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": SITE_NAME,
              "url": SITE_URL,
              "description": SITE_DESCRIPTION,
            }),
          }}
        />

        {/* JSON-LD WebSite Schema with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "url": SITE_URL,
              "name": SITE_NAME,
              "potentialAction": {
                "@type": "SearchAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": `${SITE_URL}/search?q={search_term_string}`,
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        <CartProvider>
          {children}
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
