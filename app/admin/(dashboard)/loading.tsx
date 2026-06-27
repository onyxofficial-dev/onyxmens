import React from 'react'
import { DarkPulseBlock, SkeletonStatCard, SkeletonAdminCard } from '@/components/skeletons'

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-8 text-white bg-black min-h-screen p-4 sm:p-8">
      <div className="h-10 w-44 bg-white/10 animate-pulse mb-8" />

      {/* Same Day Deliveries Priority Section */}
      <div className="bg-neutral-900 border border-neutral-850 shadow-sm">
        <div className="bg-neutral-950 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">⚡</span>
            <div className="h-6 w-52 bg-white/10 animate-pulse" />
          </div>
          <div className="h-6 w-20 bg-white/10 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-neutral-850 last:border-0">
                <DarkPulseBlock className="h-4 w-20" />
                <DarkPulseBlock className="h-4 w-32" />
                <DarkPulseBlock className="h-4 w-28" />
                <DarkPulseBlock className="h-4 w-16" />
                <DarkPulseBlock className="h-4 w-20" />
                <DarkPulseBlock className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-neutral-900 p-6 border border-neutral-850 shadow-sm">
            <DarkPulseBlock className="h-3.5 w-20 mb-2" />
            <DarkPulseBlock className="h-12 w-16" />
          </div>
        ))}
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-neutral-900 border border-neutral-850 p-4 shadow-sm">
        <DarkPulseBlock className="h-3 w-32 mb-3" />
        <div className="flex flex-wrap gap-2">
          {[...Array(7)].map((_, i) => (
            <DarkPulseBlock key={i} className="h-8 w-28" />
          ))}
        </div>
      </div>

      {/* Recent Orders + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SkeletonAdminCard title={true} rows={10} />
        </div>
        <div>
          <SkeletonAdminCard title={true} rows={5} />
        </div>
      </div>

      {/* Low Stock + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonAdminCard title={true} rows={5} />
        <SkeletonAdminCard title={true} rows={8} />
      </div>
    </div>
  )
}
