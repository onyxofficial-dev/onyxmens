import React from 'react'
import { SkeletonPDPGallery, SkeletonPDPInfo, SkeletonProductGrid, PulseBlock } from '@/components/skeletons'

export default function ProductDetailLoading() {
  return (
    <div className="w-full bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-16">
        {/* Main product columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <SkeletonPDPGallery />
          <SkeletonPDPInfo />
        </div>

        {/* Attribute grid */}
        <div className="grid grid-cols-2 gap-2 mb-16">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-neutral-50 border border-black p-3 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <PulseBlock className="w-4 h-4" />
                <PulseBlock className="h-3 w-16" />
              </div>
              <PulseBlock className="h-4 w-32" />
            </div>
          ))}
        </div>

        {/* Related Products */}
        <div className="border-t border-black pt-16">
          <h2 className="font-bebas-neue text-3xl font-black mb-8 text-center md:text-left">
            YOU MAY ALSO LIKE
          </h2>
          <SkeletonProductGrid count={4} />
        </div>
      </div>
    </div>
  )
}
