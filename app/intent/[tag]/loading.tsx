import React from 'react'
import { SkeletonProductGrid, SkeletonFilterBar, PulseBlock } from '@/components/skeletons'

export default function IntentTagLoading() {
  return (
    <div className="w-full bg-white">
      {/* Header */}
      <section className="w-full bg-black text-white px-8 py-16">
        <PulseBlock className="h-10 w-44 bg-white/10 animate-pulse rounded-none mb-3" />
        <PulseBlock className="h-4 w-1/3 bg-white/10 animate-pulse rounded-none" />
      </section>

      {/* Filter Bar */}
      <section className="w-full px-8 py-6 border-b border-black">
        <SkeletonFilterBar count={4} />
      </section>

      {/* Product Grid */}
      <section className="w-full px-8 py-12">
        <SkeletonProductGrid count={8} />
      </section>
    </div>
  )
}
