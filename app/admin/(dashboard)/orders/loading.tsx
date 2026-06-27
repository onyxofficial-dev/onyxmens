import React from 'react'
import { DarkPulseBlock, SkeletonTableRow } from '@/components/skeletons'

export default function AdminOrdersLoading() {
  return (
    <div className="space-y-6 text-white bg-black min-h-screen p-4 sm:p-8">
      <div className="h-10 w-32 bg-white/10 animate-pulse mb-8" />

      {/* Filter and search bar placeholders */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex-1 w-full max-w-md h-11 bg-white/5 border border-neutral-850 animate-pulse" />
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="w-32 h-11 bg-white/5 border border-neutral-850 animate-pulse" />
          <div className="w-32 h-11 bg-white/5 border border-neutral-850 animate-pulse" />
          <div className="w-28 h-11 bg-white/5 border border-neutral-850 animate-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-neutral-900 border border-neutral-850 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black bg-neutral-950">
              <th className="p-3 w-32"><DarkPulseBlock className="h-3 w-16" /></th>
              <th className="p-3 w-28"><DarkPulseBlock className="h-3 w-14" /></th>
              <th className="p-3"><DarkPulseBlock className="h-3 w-24" /></th>
              <th className="p-3 w-24"><DarkPulseBlock className="h-3 w-12" /></th>
              <th className="p-3 w-28"><DarkPulseBlock className="h-3 w-16" /></th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <SkeletonTableRow key={i} cols={6} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
