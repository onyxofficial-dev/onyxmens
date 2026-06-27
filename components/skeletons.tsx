import React from 'react'

// Helper for monochrome animated pulse block
export function PulseBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-neutral-200 animate-pulse rounded-none ${className}`} />
  )
}

// Helper for dark/admin pulse block
export function DarkPulseBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-neutral-800 animate-pulse rounded-none ${className}`} />
  )
}

// 1. Single product card skeleton
export function SkeletonProductCard() {
  return (
    <div className="w-full flex flex-col">
      {/* 3:4 aspect ratio image placeholder */}
      <div className="relative w-full aspect-[3/4] bg-neutral-100 border border-black mb-3 overflow-hidden">
        <PulseBlock className="w-full h-full !bg-neutral-200" />
      </div>
      {/* Category label */}
      <PulseBlock className="h-3 w-16 mb-2" />
      {/* Title */}
      <PulseBlock className="h-4 w-3/4 mb-2" />
      {/* Price */}
      <PulseBlock className="h-3.5 w-12 mb-3" />
      {/* Add to Cart button */}
      <PulseBlock className="h-9 w-full" />
    </div>
  )
}

// 2. Grid of product cards
export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, idx) => (
        <SkeletonProductCard key={idx} />
      ))}
    </div>
  )
}

// 3. Table row skeleton for admin tables
export function SkeletonTableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-neutral-800">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="p-3">
          <DarkPulseBlock className={`h-4 ${i === 0 ? 'w-24 font-mono' : i === cols - 1 ? 'w-16 ml-auto' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

// 4. Metric/Stat card skeleton for dashboard
export function SkeletonStatCard() {
  return (
    <div className="bg-neutral-900 border border-neutral-850 p-5 shadow-sm">
      <DarkPulseBlock className="h-3 w-20 mb-2" />
      <DarkPulseBlock className="h-10 w-28" />
    </div>
  )
}

// 5. Filter bar skeleton (e.g. on Shop Index, category list pages)
export function SkeletonFilterBar({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {[...Array(count)].map((_, i) => (
        <PulseBlock key={i} className={`h-8 ${i === 0 ? 'w-16' : 'w-24'}`} />
      ))}
    </div>
  )
}

// 6. PDP Main Image and Gallery thumbnails skeleton
export function SkeletonPDPGallery() {
  return (
    <div className="space-y-4">
      {/* Large main image square */}
      <div className="w-full aspect-[3/4] bg-neutral-100 border border-black relative overflow-hidden">
        <PulseBlock className="w-full h-full" />
      </div>
      {/* Thumbnail row */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-square bg-neutral-100 border border-black relative overflow-hidden">
            <PulseBlock className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// 7. PDP information detail placeholder (right side)
export function SkeletonPDPInfo() {
  return (
    <div className="space-y-6">
      {/* Category */}
      <PulseBlock className="h-3 w-16" />
      {/* Title */}
      <PulseBlock className="h-8 w-2/3" />
      {/* Price */}
      <PulseBlock className="h-6 w-20" />
      
      <hr className="border-black" />

      {/* Sizes */}
      <div className="space-y-2">
        <PulseBlock className="h-3 w-12" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <PulseBlock key={i} className="w-10 h-10" />
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="space-y-2">
        <PulseBlock className="h-3 w-12" />
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <PulseBlock key={i} className="w-8 h-8" />
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div className="space-y-2">
        <PulseBlock className="h-3 w-16" />
        <PulseBlock className="w-28 h-9" />
      </div>

      {/* Button */}
      <PulseBlock className="w-full h-12" />
    </div>
  )
}

// 8. Reusable admin cards/containers containing rows
export function SkeletonAdminCard({ title = true, rows = 5 }: { title?: boolean; rows?: number }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 shadow-sm">
      {title && <DarkPulseBlock className="h-4 w-32 mb-4" />}
      <div className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex justify-between items-center py-2 border-b border-neutral-850 last:border-0">
            <DarkPulseBlock className="h-3.5 w-1/3" />
            <DarkPulseBlock className="h-3.5 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
