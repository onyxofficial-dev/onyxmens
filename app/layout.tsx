import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/lib/cart-context'

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
  title: {
    default: 'ONYX | Mens Clothing',
    template: '%s | ONYX',
  },
  description: 'Minimalist design. Maximum presence.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="font-inter bg-white text-black">
        <CartProvider>
          {children}
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
