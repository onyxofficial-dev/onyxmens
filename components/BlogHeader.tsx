import Link from 'next/link'

export function BlogHeader() {
  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="w-full h-8 bg-black text-white flex justify-between items-center px-4 md:px-6">
        <span className="text-[10px] md:text-xs uppercase tracking-widest font-inter font-bold truncate">
          ONYX ✦ MENS CLOTHING
        </span>
        <span className="text-[10px] md:text-xs font-inter ml-4">2026</span>
      </div>

      {/* STICKY NAV */}
      <nav className="sticky top-0 z-50 w-full h-16 bg-white border-b border-black flex items-center justify-center px-4 md:px-8 relative">
        <Link href="/" className="font-bebas-neue text-2xl font-bold text-black hover:opacity-60 transition-opacity flex items-center gap-2">
          <span>✦</span> ONYX <span>✦</span>
        </Link>
      </nav>
    </>
  )
}
