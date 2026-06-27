import { BlogHeader } from '@/components/BlogHeader'
import { Footer } from '@/components/footer'

export default function BlogLoading() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <BlogHeader />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 md:px-16 py-12 flex flex-col gap-8">
        {/* 1. Breadcrumbs placeholder */}
        <div className="h-4 w-[60%] bg-neutral-800 animate-pulse" />

        {/* 2. Title placeholder */}
        <div className="h-10 w-[85%] bg-neutral-800 animate-pulse mt-2" />

        {/* 3. Meta row placeholder */}
        <div className="h-4 w-[30%] bg-neutral-800 animate-pulse border-b border-white/10 pb-4" />

        {/* 4. Hero image placeholder */}
        <div className="w-full h-[260px] md:h-[480px] bg-neutral-800 animate-pulse mt-4 border border-white/10" />

        {/* 5. First paragraph placeholder (Three bars: 80%, 90%, 70%) */}
        <div className="flex flex-col gap-3 max-w-[680px] mx-auto w-full mt-6">
          <div className="h-4 w-[80%] bg-neutral-800 animate-pulse" />
          <div className="h-4 w-[90%] bg-neutral-800 animate-pulse" />
          <div className="h-4 w-[70%] bg-neutral-800 animate-pulse" />
        </div>

        {/* 6. Section image placeholder */}
        <div className="w-full h-[200px] md:h-[320px] bg-neutral-800 animate-pulse my-8 border border-white/10" />

        {/* 7. Second paragraph placeholder (Two bars: 85%, 60%) */}
        <div className="flex flex-col gap-3 max-w-[680px] mx-auto w-full">
          <div className="h-4 w-[85%] bg-neutral-800 animate-pulse" />
          <div className="h-4 w-[60%] bg-neutral-800 animate-pulse" />
        </div>

        {/* 8. CTA placeholder */}
        <div className="w-full h-16 bg-neutral-800 animate-pulse my-4 border border-white/10" />
      </main>

      <Footer />
    </div>
  )
}
