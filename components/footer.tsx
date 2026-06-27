'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-black text-white px-6 md:px-16 py-12 border-t border-white/10">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
        {/* Col 1: Brand */}
        <div>
          <Link href="/">
            <h3 className="font-bebas-neue text-2xl font-black mb-1 hover:opacity-85 transition-opacity">ONYX</h3>
          </Link>
          <p className="text-[10px] uppercase tracking-widest font-inter mb-4">MENS CLOTHING</p>
          <div className="flex gap-4 items-center">
            <a 
              href="https://www.instagram.com/onyxmens/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:opacity-60 transition-opacity flex items-center justify-center"
              aria-label="Instagram"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:opacity-60 transition-opacity flex items-center justify-center"
              aria-label="Facebook"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a 
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '918758987200'}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:opacity-60 transition-opacity flex items-center justify-center"
              aria-label="WhatsApp"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.71 1.456h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Col 2: Shop */}
        <div>
          <h4 className="text-xs uppercase tracking-widest font-inter font-bold mb-3">SHOP</h4>
          <Link href="/new-drops" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            New Arrivals
          </Link>
          <Link href="/shop" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            All Products
          </Link>
          <Link href="/shop/t-shirts" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            T-Shirts
          </Link>
          <Link href="/shop/shirts" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            Shirts
          </Link>
        </div>

        {/* Col 3: Company */}
        <div>
          <h4 className="text-xs uppercase tracking-widest font-inter font-bold mb-3">COMPANY</h4>
          <Link href="/about" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            About Us
          </Link>
          <Link href="/privacy-policy" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            Privacy Policy
          </Link>
        </div>

        {/* Col 4: Support */}
        <div>
          <h4 className="text-xs uppercase tracking-widest font-inter font-bold mb-3">SUPPORT</h4>
          <Link href="/support/size-guide" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            Size Guide
          </Link>
          <Link href="/support/shipping" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            Shipping
          </Link>
          <Link href="/support/returns" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            Returns
          </Link>
          <Link href="/support/faq" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            FAQ
          </Link>
        </div>

        {/* Col 5: Follow */}
        <div>
          <h4 className="text-xs uppercase tracking-widest font-inter font-bold mb-3">FOLLOW</h4>
          <a 
            href="https://www.instagram.com/onyxmens/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2"
          >
            Instagram
          </a>
          <a href="#" className="block text-xs font-inter opacity-60 hover:opacity-100 transition-opacity mb-2">
            Blog
          </a>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between gap-4 md:gap-0">
        <p className="text-xs font-inter opacity-40 text-center md:text-left">© 2026 ONYXMENS. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  )
}
