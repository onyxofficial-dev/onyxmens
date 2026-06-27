import React from 'react'
import { SkeletonProductGrid, SkeletonFilterBar, PulseBlock } from '@/components/skeletons'

export default function NewDropsLoading() {
  return (
    <div className="w-full bg-white">
      {/* Page Header */}
      <section className="w-full px-8 py-20 border-b border-black">
        <PulseBlock className="h-16 w-3/4 mb-4" />
        <PulseBlock className="h-4 w-1/3" />
      </section>

      {/* Filter Bar */}
      <section className="w-full px-8 py-6 border-b border-black">
        <SkeletonFilterBar count={4} />
      </section>

      {/* Product Grid */}
      <section className="w-full px-8 py-12">
        <SkeletonProductGrid count={16} />
      </section>
    </div>
  )
}
