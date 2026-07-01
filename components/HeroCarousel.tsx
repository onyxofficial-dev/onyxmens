"use client"

import React from 'react'
import Link from 'next/link'

const IMAGES = [
  "/carousel/01.jpg",
  "/carousel/02.jpg",
  "/carousel/03.jpg",
]

const STRIP = [...IMAGES, ...IMAGES]

export default function HeroCarousel() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes hero-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .hero-scroll-strip {
            animation: hero-scroll 10s linear infinite;
          }
        }
        .hero-scroll-strip:hover {
          animation-play-state: paused;
        }
      `}} />
      <div
        className="hero-scroll-strip"
        style={{ display: "flex", height: "100%", width: "600%" }}
      >
        {STRIP.map((src, i) => (
          <div
            key={i}
            style={{
              width: "16.6666%",
              height: "100%",
              flexShrink: 0,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden"
            }}
          >
            <Link
              href="/shop"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "100%",
                cursor: "pointer"
              }}
            >
              <img
                src={src}
                alt=""
                aria-hidden="true"
                style={{
                  height: "100%",
                  width: "auto",
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}


