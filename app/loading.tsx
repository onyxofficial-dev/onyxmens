import React from 'react'
import { SkeletonProductGrid, PulseBlock } from '@/components/skeletons'

export default function HomeLoading() {
  return (
    <div className="w-full bg-white">
      {/* Hero section skeleton */}
      <div className="w-full h-[70vh] bg-black flex flex-col justify-center px-16 relative overflow-hidden">
        <div className="max-w-xl space-y-4 z-10">
          <div className="h-16 w-3/4 bg-white/10 animate-pulse rounded-none" />
          <div className="h-4 w-1/2 bg-white/10 animate-pulse rounded-none" />
          <div className="h-12 w-32 bg-white/10 animate-pulse rounded-none" />
        </div>
      </div>

      {/* Split CTA */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
        <div className="h-48 border-r border-black flex items-center justify-center p-8">
          <PulseBlock className="h-6 w-1/3" />
        </div>
        <div className="h-48 flex items-center justify-center p-8">
          <PulseBlock className="h-6 w-1/3" />
        </div>
      </div>

      {/* Bestsellers section */}
      <div className="w-full px-6 md:px-16 py-12 md:py-20">
        <h2 className="font-bebas-neue text-3xl font-black mb-8">BESTSELLERS</h2>
        <SkeletonProductGrid count={8} />
      </div>
    </div>
  )
}
