import React from 'react'
import { SkeletonProductGrid, PulseBlock } from '@/components/skeletons'

export default function ShopLoading() {
  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <section className="w-full h-64 bg-black text-white flex flex-col items-center justify-center px-8">
        <div className="h-12 w-32 bg-white/10 animate-pulse rounded-none mb-3" />
        <div className="h-4 w-44 bg-white/10 animate-pulse rounded-none" />
      </section>

      {/* Category Grid */}
      <section className="w-full px-6 md:px-16 py-12 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-6 border border-transparent">
              <PulseBlock className="w-40 h-40 mb-4" />
              <PulseBlock className="h-4 w-24 mb-2" />
              <PulseBlock className="h-3 w-12" />
            </div>
          ))}
        </div>

        {/* All Products */}
        <div className="mt-16">
          <h2 className="font-bebas-neue text-3xl font-black mb-8">ALL PRODUCTS</h2>
          <SkeletonProductGrid count={8} />
        </div>
      </section>
    </div>
  )
}
