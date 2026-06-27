import React from 'react'
import { SkeletonProductGrid, SkeletonFilterBar, PulseBlock } from '@/components/skeletons'

export default function CategoryLoading() {
  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <section className="w-full h-48 bg-black text-white flex flex-col items-center justify-center px-8">
        <div className="h-10 w-44 bg-white/10 animate-pulse rounded-none mb-2" />
        <div className="h-4 w-28 bg-white/10 animate-pulse rounded-none" />
      </section>

      {/* Content */}
      <section className="w-full px-6 md:px-16 py-12">
        {/* Filters */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-black">
          <div className="flex gap-4">
            <PulseBlock className="h-4 w-12" />
            <PulseBlock className="h-4 w-12" />
          </div>
          <PulseBlock className="h-8 w-24" />
        </div>

        {/* Fit Chips */}
        <SkeletonFilterBar count={5} />

        {/* Product Grid */}
        <SkeletonProductGrid count={8} />
      </section>
    </div>
  )
}
