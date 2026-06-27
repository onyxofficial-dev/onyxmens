'use client'

import { useEffect, useRef } from 'react'

interface MarqueeProps {
  text: string
  speed?: number
}

export function Marquee({ text, speed = 30 }: MarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const container = containerRef.current
    const content = contentRef.current
    if (!container || !content) return

    let animationId: number
    let position = 0

    const animate = () => {
      position -= speed / 60
      const contentWidth = content.offsetWidth
      const containerWidth = container.offsetWidth

      if (Math.abs(position) > contentWidth) {
        position = 0
      }

      content.style.transform = `translateX(${position}px)`
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [speed])

  return (
    <div ref={containerRef} className="w-full overflow-hidden bg-black text-white py-4">
      <div ref={contentRef} className="flex whitespace-nowrap">
        {/* Create multiple copies for seamless loop */}
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-8 font-space-mono text-xs uppercase tracking-widest">
            {text} <span className="mx-4">◆</span>
          </div>
        ))}
      </div>
    </div>
  )
}
