'use client'

import { useEffect } from 'react'

/**
 * AnimatedFavicon — Flip-Flop Favicon
 *
 * Cleanly alternates between two inverted favicon states every ~2 seconds:
 *   • dark-on-light (black ONYX wordmark, white background)
 *   • light-on-dark (white ONYX wordmark, black background)
 *
 * No canvas blending — just a sharp, instant swap of the favicon href.
 * Mounted once in the root layout; persists across client-side navigations.
 */

const DARK_ON_LIGHT = '/favicon/onyx-favicon-dark-on-light.png'
const LIGHT_ON_DARK = '/favicon/onyx-favicon-light-on-dark.png'
const SWAP_INTERVAL = 500 // 0.5 seconds between swaps

export function AnimatedFavicon() {
  useEffect(() => {
    // Respect prefers-reduced-motion — show only static favicon, no animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let isDarkOnLight = true
    let intervalId: ReturnType<typeof setInterval> | null = null

    // Preload both images so swaps are instant with no flicker
    const preloadDark = new Image()
    const preloadLight = new Image()
    preloadDark.src = DARK_ON_LIGHT
    preloadLight.src = LIGHT_ON_DARK

    const getOrCreateFaviconLink = (): HTMLLinkElement => {
      const links = Array.from(
        document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']")
      ) as HTMLLinkElement[]

      // Remove duplicates — ensure exactly one <link rel="icon"> exists
      for (let i = 1; i < links.length; i++) {
        links[i].parentNode?.removeChild(links[i])
      }

      if (links.length > 0) {
        return links[0]
      }

      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      document.head.appendChild(link)
      return link
    }

    const swap = () => {
      // Don't swap while tab is hidden
      if (document.hidden) return

      isDarkOnLight = !isDarkOnLight
      const link = getOrCreateFaviconLink()
      link.href = isDarkOnLight ? DARK_ON_LIGHT : LIGHT_ON_DARK
      link.type = 'image/png'
    }

    const start = () => {
      if (intervalId) return
      intervalId = setInterval(swap, SWAP_INTERVAL)
    }

    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stop()
      } else {
        start()
      }
    }

    // Start the flip-flop
    start()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return null
}


