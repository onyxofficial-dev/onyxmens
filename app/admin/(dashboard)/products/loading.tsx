import React from 'react'
import { DarkPulseBlock } from '@/components/skeletons'

export default function AdminProductsLoading() {
  return (
    <div className="space-y-6 text-white bg-black min-h-screen p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-32 bg-white/10 animate-pulse" />
        <div className="h-11 w-32 bg-white/10 animate-pulse" />
      </div>

      {/* Filter chips & search bar placeholder */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-8 w-16 bg-white/5 border border-neutral-850 animate-pulse" />
          ))}
        </div>
        <div className="w-full sm:w-64 h-11 bg-white/5 border border-neutral-850 animate-pulse" />
      </div>

      {/* Masonry Columns Placeholder */}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-6 space-y-6">
        {[...Array(12)].map((_, i) => {
          // Vary the heights slightly to mimic masonry column layouts
          const heightClass = i % 4 === 0 ? 'h-64' : i % 4 === 1 ? 'h-72' : i % 4 === 2 ? 'h-80' : 'h-56'
          return (
            <div key={i} className="break-inside-avoid bg-neutral-900 border border-neutral-850 p-4 flex flex-col space-y-3">
              {/* Image box */}
              <div className={`w-full ${heightClass} bg-neutral-950 flex-shrink-0 animate-pulse`} />
              {/* Title & category */}
              <DarkPulseBlock className="h-3 w-12" />
              <DarkPulseBlock className="h-4 w-3/4" />
              <DarkPulseBlock className="h-3.5 w-16" />
              <div className="flex gap-2">
                <DarkPulseBlock className="h-5 w-14" />
                <DarkPulseBlock className="h-5 w-10" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
