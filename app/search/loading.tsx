import React from 'react'
import { SkeletonProductGrid, PulseBlock } from '@/components/skeletons'

export default function SearchLoading() {
  return (
    <div className="w-full bg-white">
      {/* Hero */}
      <section className="w-full bg-black text-white px-6 md:px-16 py-12">
        <PulseBlock className="h-4 w-24 bg-white/10 animate-pulse rounded-none mb-2" />
        <PulseBlock className="h-12 w-64 bg-white/10 animate-pulse rounded-none mb-6" />
        <div className="max-w-md h-12 bg-white/5 border border-white/20 animate-pulse" />
      </section>

      {/* Results */}
      <section className="w-full px-6 md:px-16 py-12">
        <SkeletonProductGrid count={8} />
      </section>
    </div>
  )
}
