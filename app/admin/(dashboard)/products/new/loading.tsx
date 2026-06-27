import React from 'react'
import { DarkPulseBlock } from '@/components/skeletons'

export default function AdminNewProductLoading() {
  return (
    <div className="space-y-6 text-white bg-black min-h-screen p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="h-10 w-44 bg-white/10 animate-pulse mb-8" />

      <div className="bg-neutral-900 border border-neutral-850 p-6 md:p-8 space-y-6">
        {/* Form sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <DarkPulseBlock className="h-3 w-24" />
              <div className="w-full h-11 bg-white/5 border border-neutral-850 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Textarea description */}
        <div className="space-y-2">
          <DarkPulseBlock className="h-3 w-20" />
          <div className="w-full h-24 bg-white/5 border border-neutral-850 animate-pulse" />
        </div>

        {/* Textarea fields grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <DarkPulseBlock className="h-3 w-28" />
              <div className="w-full h-16 bg-white/5 border border-neutral-850 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Multi-select chips row */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <DarkPulseBlock className="h-3 w-24" />
          <div className="flex flex-wrap gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 w-20 bg-white/5 border border-neutral-850 animate-pulse" />
            ))}
          </div>
        </div>

        {/* Upload image square */}
        <div className="space-y-3 pt-4 border-t border-neutral-800">
          <DarkPulseBlock className="h-3 w-36" />
          <div className="w-full h-40 bg-white/5 border border-neutral-850 border-dashed animate-pulse flex items-center justify-center">
            <DarkPulseBlock className="h-4 w-44" />
          </div>
        </div>

        {/* Save button */}
        <div className="pt-6 border-t border-neutral-800">
          <div className="w-full h-12 bg-white/10 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
