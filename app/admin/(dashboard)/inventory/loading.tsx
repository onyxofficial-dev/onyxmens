import React from 'react'
import { DarkPulseBlock, SkeletonTableRow } from '@/components/skeletons'

export default function AdminInventoryLoading() {
  return (
    <div className="space-y-6 text-white bg-black min-h-screen p-4 sm:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="h-10 w-32 bg-white/10 animate-pulse" />
      </div>

      {/* Search and filters bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="w-full sm:w-64 h-11 bg-white/5 border border-neutral-850 animate-pulse" />
        <div className="h-11 w-32 bg-white/5 border border-neutral-850 animate-pulse" />
      </div>

      {/* Inventory table skeleton */}
      <div className="bg-neutral-900 border border-neutral-850 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black bg-neutral-950">
              <th className="p-3 w-16"></th>
              <th className="p-3"><DarkPulseBlock className="h-3 w-32" /></th>
              <th className="p-3 w-28"><DarkPulseBlock className="h-3 w-16" /></th>
              <th className="p-3 w-32 text-right"><DarkPulseBlock className="h-3 w-20" /></th>
              <th className="p-3 w-28"><DarkPulseBlock className="h-3 w-16" /></th>
              <th className="p-3 w-36"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(12)].map((_, i) => (
              <SkeletonTableRow key={i} cols={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
